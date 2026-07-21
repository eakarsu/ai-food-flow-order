import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import crypto from 'node:crypto';
import {
  canTransition,
  containsSecret,
  digest,
  evaluateDraft,
  reconcileFulfillment,
  retryDisposition,
  validateProviderCommand,
  verifyProviderSignature,
  webhookTransition,
  type OrderDraft,
} from './orderPolicy.js';

const draft: OrderDraft = {
  customerActorId: 'customer-1',
  subjectId: 'subject-1',
  merchantId: 'merchant-1',
  restaurantId: 'restaurant-1',
  lines: [{ sku: 'sku-pizza', quantity: 2, unitPriceCents: 1200, availableQuantity: 4 }],
  inventoryQuoteRef: 'inventory-quote-1',
  inventoryQuoteVersion: 'inventory-v1',
  taxQuoteRef: 'tax-quote-1',
  taxCents: 240,
  deliveryQuoteRef: 'delivery-quote-1',
  deliveryCents: 300,
  tipCents: 200,
  discountCents: 100,
  declaredTotalCents: 3040,
};

test('canonical idempotency digest ignores object key order', () => {
  assert.equal(digest({ a: 1, b: 2 }), digest({ b: 2, a: 1 }));
  assert.notEqual(digest({ a: 1 }), digest({ a: 2 }));
});

test('draft totals are calculated in integer cents from provider quotes', () => {
  const result = evaluateDraft(draft, 'customer-1');
  assert.deepEqual(result.errors, []);
  assert.equal(result.normalized.totalCents, 3040);
  assert.equal(result.normalized.initialState, 'reservation_pending');
});

test('customer ownership and oversell attempts fail closed', () => {
  const result = evaluateDraft(
    { ...draft, customerActorId: 'other', lines: [{ ...draft.lines[0], availableQuantity: 1 }] },
    'customer-1'
  );
  assert.match(result.errors.join(' '), /signed actor/);
  assert.match(result.errors.join(' '), /oversell/);
});

test('declared total divergence is rejected', () => {
  assert.match(evaluateDraft({ ...draft, declaredTotalCents: 1 }, 'customer-1').errors.join(' '), /server-calculated/);
});

test('state machine allows recovery but denies lifecycle shortcuts', () => {
  assert.equal(canTransition('reservation_pending', 'reserved', 'integration_worker'), true);
  assert.equal(canTransition('reservation_pending', 'fulfilled', 'integration_worker'), false);
  assert.equal(canTransition('payment_failed', 'payment_pending', 'customer'), true);
});

test('refund and fulfillment transitions require scoped roles', () => {
  assert.equal(canTransition('refund_pending', 'refunded', 'customer'), false);
  assert.equal(canTransition('refund_pending', 'refunded', 'integration_worker'), true);
  assert.equal(canTransition('fulfillment_pending', 'fulfilled', 'merchant'), true);
});

test('provider adapters allow typed operations and reject credentials', () => {
  assert.deepEqual(validateProviderCommand('inventory', 'reserve', { inventoryQuoteRef: 'quote-1' }), []);
  assert.match(validateProviderCommand('inventory', 'charge', {}).join(' '), /unsupported/);
  assert.equal(containsSecret({ nested: { apiKey: 'secret' } }), true);
  assert.match(validateProviderCommand('payment', 'authorize', { accessToken: 'secret' }).join(' '), /credentials/);
});

test('retry policy reaches a bounded dead letter deterministically', () => {
  assert.deepEqual(retryDisposition(1), { status: 'failed', retryAfterSeconds: 30 });
  assert.equal(retryDisposition(5).status, 'dead_letter');
});

test('provider webhook signatures are timing-safe HMAC digests', () => {
  const payload = { eventId: 'event-0001', eventType: 'payment.authorized' };
  const secret = 'provider-webhook-secret-at-least-32-characters';
  const signature = crypto.createHmac('sha256', secret)
    .update('{"eventId":"event-0001","eventType":"payment.authorized"}').digest('hex');
  assert.equal(verifyProviderSignature(payload, signature, secret), true);
  assert.equal(verifyProviderSignature({ ...payload, eventType: 'payment.failed' }, signature, secret), false);
});

test('duplicate webhook identity is payload-bound', () => {
  const first = digest({ provider: 'payment', eventId: 'evt-1', payload: { amount: 3040 } });
  const replay = digest({ payload: { amount: 3040 }, eventId: 'evt-1', provider: 'payment' });
  const conflict = digest({ provider: 'payment', eventId: 'evt-1', payload: { amount: 1 } });
  assert.equal(first, replay);
  assert.notEqual(first, conflict);
});

test('partial fulfillment is explicit and reconciled', () => {
  assert.equal(reconcileFulfillment([{ ordered: 2, fulfilled: 1 }]), 'partially_fulfilled');
  assert.equal(reconcileFulfillment([{ ordered: 2, fulfilled: 2 }]), 'fulfilled');
  assert.equal(webhookTransition('delivery.partial'), 'partially_fulfilled');
});

test('migration, CI, and launcher encode failure-path controls', () => {
  const root = path.resolve(__dirname, '../../..');
  const migration = fs.readFileSync(path.join(root, 'server/src/migrations/005_governed_order_workflow.sql'), 'utf8');
  const rbacMigration = fs.readFileSync(path.join(root, 'server/src/migrations/003_rbac_and_roles.sql'), 'utf8');
  const rateLimit = fs.readFileSync(path.join(root, 'server/src/middleware/rateLimit.ts'), 'utf8');
  const socketService = fs.readFileSync(path.join(root, 'server/src/services/socketService.ts'), 'utf8');
  const workflow = fs.readFileSync(path.join(root, '.github/workflows/governed-orders.yml'), 'utf8');
  const launcher = fs.readFileSync(path.join(root, 'start.sh'), 'utf8');
  assert.match(migration, /SKIP LOCKED|dead_letter/);
  assert.match(migration, /append-only/);
  assert.match(workflow, /npm run check/);
  assert.match(rbacMigration, /DEFAULT 'customer'/);
  assert.doesNotMatch(rbacMigration, /SET role = 'admin'/);
  assert.match(rateLimit, /ipKeyGenerator/);
  assert.doesNotMatch(socketService, /your-secret|placeholder/);
  assert.doesNotMatch(launcher, /kill -9|npm install|seed/);
});
