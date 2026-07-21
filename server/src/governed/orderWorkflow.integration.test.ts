import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import type { AddressInfo } from 'node:net';
import test from 'node:test';
import jwt from 'jsonwebtoken';
import { canonicalJson } from './orderPolicy.js';

const enabled = Boolean(process.env.DATABASE_URL);

test('persisted order journeys cover replay, oversell, payment failure, fulfillment, and audit', { skip: !enabled }, async () => {
  process.env.NODE_ENV = 'test';
  process.env.DEFAULT_TENANT_ID = 'tenant-e2e';
  process.env.JWT_SECRET = 'e2e-access-secret-that-is-at-least-thirty-two-characters';
  process.env.JWT_REFRESH_SECRET = 'e2e-refresh-secret-that-is-at-least-thirty-two-characters';
  const webhookSecret = 'e2e-provider-webhook-secret-at-least-thirty-two';
  process.env.PROVIDER_WEBHOOK_SECRETS_JSON = JSON.stringify({ inventory: webhookSecret,
    payment: webhookSecret, delivery: webhookSecret });

  const [{ app }, database] = await Promise.all([import('../index.js'), import('../config/database.js')]);
  const actorId = '00000000-0000-4000-8000-000000000101';
  await database.query(
    `INSERT INTO users(id,email,password_hash,role,is_active)
     VALUES($1,$2,'not-used','operator',TRUE)
     ON CONFLICT(id) DO UPDATE SET role='operator',is_active=TRUE`, [actorId, 'e2e@example.invalid']
  );
  const token = jwt.sign(
    { userId: actorId, email: 'e2e@example.invalid', tenantId: 'tenant-e2e', role: 'operator', subjects: ['*'] },
    process.env.JWT_SECRET,
    { algorithm: 'HS256', expiresIn: '5m' }
  );
  const server = app.listen(0);
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const authorized = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const draft = {
    customerActorId: actorId,
    subjectId: 'subject-e2e',
    merchantId: actorId,
    restaurantId: 'restaurant-e2e',
    lines: [{ sku: 'sku-e2e-pizza', quantity: 2, unitPriceCents: 1200, availableQuantity: 5 }],
    inventoryQuoteRef: 'inventory-quote-e2e',
    inventoryQuoteVersion: 'inventory-version-e2e',
    taxQuoteRef: 'tax-quote-e2e',
    taxCents: 240,
    deliveryQuoteRef: 'delivery-quote-e2e',
    deliveryCents: 300,
    tipCents: 200,
    discountCents: 100,
    declaredTotalCents: 3040,
  };

  try {
    const oversell = await fetch(`${base}/api/governed-orders`, {
      method: 'POST', headers: { ...authorized, 'Idempotency-Key': 'order-e2e-oversell' },
      body: JSON.stringify({ ...draft, lines: [{ ...draft.lines[0], quantity: 6 }] }),
    });
    assert.equal(oversell.status, 422);

    const createdResponse = await fetch(`${base}/api/governed-orders`, {
      method: 'POST', headers: { ...authorized, 'Idempotency-Key': 'order-e2e-0001' }, body: JSON.stringify(draft),
    });
    assert.equal(createdResponse.status, 201);
    const created = await createdResponse.json() as { id: string };

    const replay = await fetch(`${base}/api/governed-orders`, {
      method: 'POST', headers: { ...authorized, 'Idempotency-Key': 'order-e2e-0001' }, body: JSON.stringify(draft),
    });
    assert.equal(replay.status, 200);
    const conflict = await fetch(`${base}/api/governed-orders`, {
      method: 'POST', headers: { ...authorized, 'Idempotency-Key': 'order-e2e-0001' },
      body: JSON.stringify({ ...draft, tipCents: 300, declaredTotalCents: 3140 }),
    });
    assert.equal(conflict.status, 409);

    const webhook = async (provider: string, payload: Record<string, unknown>) => {
      const signature = crypto.createHmac('sha256', webhookSecret).update(canonicalJson(payload)).digest('hex');
      return fetch(`${base}/api/governed-orders/webhooks/${provider}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Provider-Signature': signature },
        body: JSON.stringify(payload),
      });
    };
    const inventoryEvent = { tenantId: 'tenant-e2e', eventId: 'inventory-event-0001',
      eventType: 'inventory.reserved', orderId: created.id };
    assert.equal((await webhook('inventory', inventoryEvent)).status, 200);
    assert.equal((await webhook('inventory', inventoryEvent)).status, 200);
    const conflictingInventoryEvent = { ...inventoryEvent, eventType: 'inventory.failed' };
    assert.equal((await webhook('inventory', conflictingInventoryEvent)).status, 409);

    const transition = async (to: string, version: number, reason: string) => fetch(
      `${base}/api/governed-orders/${created.id}/transitions`,
      { method: 'POST', headers: authorized, body: JSON.stringify({ to, version, reason }) }
    );
    assert.equal((await transition('payment_pending', 2, 'Inventory receipt reconciled')).status, 200);
    assert.equal((await webhook('payment', { tenantId: 'tenant-e2e', eventId: 'payment-event-0001',
      eventType: 'payment.authorized', orderId: created.id })).status, 200);
    assert.equal((await transition('fulfillment_pending', 4, 'Merchant accepted the order')).status, 200);
    assert.equal((await webhook('delivery', { tenantId: 'tenant-e2e', eventId: 'delivery-event-0001',
      eventType: 'delivery.partial', orderId: created.id })).status, 200);
    assert.equal((await transition('reconciliation_required', 6, 'One line remains unfulfilled')).status, 200);

    const stored = await database.query(
      'SELECT state,version FROM governed_orders WHERE tenant_id=$1 AND id=$2', ['tenant-e2e', created.id]
    );
    assert.deepEqual(stored.rows[0], { state: 'reconciliation_required', version: 7 });
    const outbox = await database.query(
      'SELECT provider,operation,status FROM governed_order_provider_outbox WHERE tenant_id=$1 AND order_id=$2',
      ['tenant-e2e', created.id]
    );
    assert.deepEqual(outbox.rows, [{ provider: 'inventory', operation: 'reserve', status: 'queued' }]);
    await assert.rejects(
      database.query("UPDATE governed_order_events SET reason='tampered' WHERE tenant_id=$1 AND order_id=$2", ['tenant-e2e', created.id]),
      /append-only/
    );

    const failedOrderResponse = await fetch(`${base}/api/governed-orders`, {
      method: 'POST', headers: { ...authorized, 'Idempotency-Key': 'order-e2e-payment-failure' },
      body: JSON.stringify({ ...draft, inventoryQuoteRef: 'inventory-quote-failure-e2e' }),
    });
    assert.equal(failedOrderResponse.status, 201);
    const failedOrder = await failedOrderResponse.json() as { id: string };
    assert.equal((await webhook('inventory', { tenantId: 'tenant-e2e', eventId: 'inventory-event-failure-e2e',
      eventType: 'inventory.reserved', orderId: failedOrder.id })).status, 200);
    assert.equal((await fetch(`${base}/api/governed-orders/${failedOrder.id}/transitions`, {
      method: 'POST', headers: authorized,
      body: JSON.stringify({ to: 'payment_pending', version: 2, reason: 'Inventory receipt reconciled' }),
    })).status, 200);
    assert.equal((await webhook('payment', { tenantId: 'tenant-e2e', eventId: 'payment-event-failure-e2e',
      eventType: 'payment.failed', orderId: failedOrder.id })).status, 200);
    assert.equal((await fetch(`${base}/api/governed-orders/${failedOrder.id}/transitions`, {
      method: 'POST', headers: authorized,
      body: JSON.stringify({ to: 'reconciliation_required', version: 4, reason: 'Payment decline requires review' }),
    })).status, 200);
    const failedStored = await database.query(
      'SELECT state,version FROM governed_orders WHERE tenant_id=$1 AND id=$2', ['tenant-e2e', failedOrder.id]
    );
    assert.deepEqual(failedStored.rows[0], { state: 'reconciliation_required', version: 5 });
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    await database.closePool();
  }
});
