import crypto from 'node:crypto';
import { Router, type Response } from 'express';
import { getClient, query } from '../config/database.js';
import { authenticateToken, type AuthRequest } from '../middleware/auth.js';
import {
  canTransition,
  containsSecret,
  digest,
  evaluateDraft,
  retryDisposition,
  validateProviderCommand,
  validKey,
  verifyProviderSignature,
  webhookTransition,
  type OrderDraft,
  type OrderRole,
  type OrderState,
} from '../governed/orderPolicy.js';

const router = Router();
const errorCode = /^[A-Z0-9][A-Z0-9._:-]{1,63}$/;

function webhookSecrets(): Record<string, string> {
  try {
    const parsed = JSON.parse(process.env.PROVIDER_WEBHOOK_SECRETS_JSON || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (_) {
    return {};
  }
}

function accessible(req: AuthRequest, order: { customer_actor_id: string; merchant_id: string }) {
  const user = req.user!;
  return user.role === 'admin' || user.role === 'operator' || order.customer_actor_id === user.id
    || (user.role === 'merchant' && order.merchant_id === user.id);
}

router.post('/webhooks/:provider', async (req, res, next) => {
  const provider = String(req.params.provider || '');
  const signature = String(req.get('X-Provider-Signature') || '');
  const secret = webhookSecrets()[provider] || '';
  if (!verifyProviderSignature(req.body, signature, secret)) {
    return res.status(401).json({ error: 'valid provider signature required' });
  }
  const tenantId = String(req.body.tenantId || '');
  const eventId = String(req.body.eventId || '');
  const eventType = String(req.body.eventType || '');
  const orderId = String(req.body.orderId || '');
  if (![tenantId, eventId, orderId].every(validKey) || !eventType) {
    return res.status(422).json({ error: 'tenantId, eventId, eventType, and orderId are required' });
  }
  const requestHash = digest({ provider, eventId, payload: req.body });
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const inserted = await client.query(
      `INSERT INTO governed_order_webhook_events
        (tenant_id,provider,provider_event_id,event_type,order_id,request_hash,payload)
       VALUES($1,$2,$3,$4,$5,$6,$7) ON CONFLICT(tenant_id,provider,provider_event_id) DO NOTHING
       RETURNING id`,
      [tenantId, provider, eventId, eventType, orderId, requestHash, req.body]
    );
    if (!inserted.rowCount) {
      const prior = await client.query(
        `SELECT request_hash,transition_applied FROM governed_order_webhook_events
         WHERE tenant_id=$1 AND provider=$2 AND provider_event_id=$3`, [tenantId, provider, eventId]
      );
      await client.query('COMMIT');
      if (!prior.rowCount || prior.rows[0].request_hash !== requestHash) {
        return res.status(409).json({ error: 'provider event id was reused with a different payload' });
      }
      return res.json({ duplicate: true, transitionApplied: prior.rows[0].transition_applied });
    }
    const current = await client.query(
      'SELECT state FROM governed_orders WHERE tenant_id=$1 AND id=$2 FOR UPDATE', [tenantId, orderId]
    );
    const to = webhookTransition(eventType);
    let applied = false;
    if (current.rowCount && to && canTransition(current.rows[0].state, to, 'integration_worker')) {
      await client.query(
        'UPDATE governed_orders SET state=$1,version=version+1,updated_at=NOW() WHERE tenant_id=$2 AND id=$3',
        [to, tenantId, orderId]
      );
      await client.query(
        `INSERT INTO governed_order_events
          (tenant_id,order_id,actor_id,actor_role,event_type,from_state,to_state,evidence)
         VALUES($1,$2,$3,'integration_worker','provider_webhook',$4,$5,$6)`,
        [tenantId, orderId, `provider:${provider}`, current.rows[0].state, to, { provider, eventId, requestHash }]
      );
      await client.query('UPDATE governed_order_webhook_events SET transition_applied=TRUE WHERE id=$1', [inserted.rows[0].id]);
      applied = true;
    } else if (current.rowCount) {
      await client.query(
        `INSERT INTO governed_order_events
          (tenant_id,order_id,actor_id,actor_role,event_type,from_state,evidence)
         VALUES($1,$2,$3,'integration_worker','provider_webhook_quarantined',$4,$5)`,
        [tenantId, orderId, `provider:${provider}`, current.rows[0].state, { provider, eventId, eventType, requestHash }]
      );
    }
    await client.query('COMMIT');
    return res.status(applied ? 200 : 202).json({ duplicate: false, transitionApplied: applied });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
});

router.use(authenticateToken);

router.post('/', async (req: AuthRequest, res: Response, next) => {
  const key = req.get('Idempotency-Key');
  if (!validKey(key)) return res.status(422).json({ error: 'valid Idempotency-Key required' });
  const evaluation = evaluateDraft(req.body as OrderDraft, req.user!.id);
  if (evaluation.errors.length) return res.status(422).json({ errors: evaluation.errors });
  if (!req.user!.subjects.includes('*') && !req.user!.subjects.includes(evaluation.normalized.subjectId)) {
    return res.status(403).json({ error: 'signed subject scope required' });
  }
  if (containsSecret(req.body)) return res.status(422).json({ error: 'request must use provider references, not credentials' });
  const requestHash = digest(evaluation.normalized);
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const result = await client.query(
      `WITH inserted AS (
        INSERT INTO governed_orders
          (tenant_id,subject_id,customer_actor_id,merchant_id,restaurant_id,state,request,
           subtotal_cents,tax_cents,delivery_cents,tip_cents,discount_cents,total_cents,
           inventory_quote_ref,inventory_quote_version,tax_quote_ref,delivery_quote_ref,idempotency_key,request_hash)
        VALUES($1,$2,$3,$4,$5,'reservation_pending',$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
        ON CONFLICT(tenant_id,idempotency_key) DO NOTHING RETURNING *
      ) SELECT inserted.*,false AS idempotent_replay FROM inserted
        UNION ALL SELECT existing.*,true AS idempotent_replay FROM governed_orders existing
        WHERE existing.tenant_id=$1 AND existing.idempotency_key=$17 AND existing.request_hash=$18
          AND NOT EXISTS(SELECT 1 FROM inserted) LIMIT 1`,
      [req.user!.tenantId, evaluation.normalized.subjectId, req.user!.id, evaluation.normalized.merchantId,
        evaluation.normalized.restaurantId, evaluation.normalized, evaluation.normalized.subtotalCents,
        evaluation.normalized.taxCents, evaluation.normalized.deliveryCents, evaluation.normalized.tipCents,
        evaluation.normalized.discountCents, evaluation.normalized.totalCents, evaluation.normalized.inventoryQuoteRef,
        evaluation.normalized.inventoryQuoteVersion, evaluation.normalized.taxQuoteRef,
        evaluation.normalized.deliveryQuoteRef, key, requestHash]
    );
    if (!result.rowCount) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Idempotency-Key was reused with a different request' });
    }
    const order = result.rows[0];
    if (!order.idempotent_replay) {
      for (const line of evaluation.normalized.lines) {
        await client.query(
          `INSERT INTO governed_order_lines(tenant_id,order_id,sku,quantity,unit_price_cents)
           VALUES($1,$2,$3,$4,$5)`,
          [req.user!.tenantId, order.id, line.sku, line.quantity, line.unitPriceCents]
        );
      }
      await client.query(
        `INSERT INTO governed_order_events
          (tenant_id,order_id,actor_id,actor_role,event_type,to_state,evidence)
         VALUES($1,$2,$3,$4,'order_created','reservation_pending',$5)`,
        [req.user!.tenantId, order.id, req.user!.id, req.user!.role, { requestHash, inventoryQuoteRef: evaluation.normalized.inventoryQuoteRef }]
      );
      const providerKey = `inventory:${requestHash.slice(0, 32)}`;
      await client.query(
        `INSERT INTO governed_order_provider_outbox
          (tenant_id,order_id,provider,operation,payload,idempotency_key,request_hash)
         VALUES($1,$2,'inventory','reserve',$3,$4,$5)`,
        [req.user!.tenantId, order.id, { inventoryQuoteRef: evaluation.normalized.inventoryQuoteRef,
          inventoryQuoteVersion: evaluation.normalized.inventoryQuoteVersion, lines: evaluation.normalized.lines },
        providerKey, digest({ provider: 'inventory', operation: 'reserve', orderId: order.id, requestHash })]
      );
    }
    await client.query('COMMIT');
    return res.status(order.idempotent_replay ? 200 : 201).json(order);
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
});

router.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const result = await query('SELECT * FROM governed_orders WHERE tenant_id=$1 AND id=$2', [req.user!.tenantId, req.params.id]);
    if (!result.rowCount || !accessible(req, result.rows[0])) return res.status(404).json({ error: 'not found' });
    const events = await query(
      `SELECT actor_id,actor_role,event_type,from_state,to_state,reason,evidence,created_at
       FROM governed_order_events WHERE tenant_id=$1 AND order_id=$2 ORDER BY id`,
      [req.user!.tenantId, req.params.id]
    );
    res.json({ order: result.rows[0], events: events.rows });
  } catch (error) { next(error); }
});

router.post('/:id/transitions', async (req: AuthRequest, res, next) => {
  const to = req.body.to as OrderState;
  const version = Number(req.body.version);
  const reason = String(req.body.reason || '').trim();
  if (!reason || !Number.isInteger(version)) return res.status(422).json({ error: 'version and reason required' });
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const current = await client.query('SELECT * FROM governed_orders WHERE tenant_id=$1 AND id=$2 FOR UPDATE', [req.user!.tenantId, req.params.id]);
    if (!current.rowCount || !accessible(req, current.rows[0])) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'not found' });
    }
    if (current.rows[0].version !== version || !canTransition(current.rows[0].state, to, req.user!.role as OrderRole)) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'stale version or forbidden transition' });
    }
    const changed = await client.query(
      `UPDATE governed_orders SET state=$1,version=version+1,updated_at=NOW()
       WHERE tenant_id=$2 AND id=$3 AND version=$4 RETURNING *`, [to, req.user!.tenantId, req.params.id, version]
    );
    await client.query(
      `INSERT INTO governed_order_events
        (tenant_id,order_id,actor_id,actor_role,event_type,from_state,to_state,reason)
       VALUES($1,$2,$3,$4,'manual_transition',$5,$6,$7)`,
      [req.user!.tenantId, req.params.id, req.user!.id, req.user!.role, current.rows[0].state, to, reason.slice(0, 500)]
    );
    await client.query('COMMIT');
    res.json(changed.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK'); next(error);
  } finally { client.release(); }
});

router.post('/:id/providers', async (req: AuthRequest, res, next) => {
  if (!['operator', 'merchant', 'admin'].includes(req.user!.role)) return res.status(403).json({ error: 'operator or merchant role required' });
  const key = req.get('Idempotency-Key');
  const provider = String(req.body.provider || '');
  const operation = String(req.body.operation || '');
  const errors = validateProviderCommand(provider, operation, req.body.payload || {});
  if (!validKey(key) || errors.length) return res.status(422).json({ errors: ['valid Idempotency-Key required', ...errors] });
  const requestHash = digest({ orderId: req.params.id, provider, operation, payload: req.body.payload || {} });
  try {
    const result = await query(
      `WITH owned AS (
        SELECT * FROM governed_orders WHERE tenant_id=$1 AND id=$2
          AND ($8 IN('operator','admin') OR merchant_id=$9)
      ), inserted AS (
        INSERT INTO governed_order_provider_outbox
          (tenant_id,order_id,provider,operation,payload,idempotency_key,request_hash)
        SELECT tenant_id,id,$3,$4,$5,$6,$7 FROM owned
        ON CONFLICT(tenant_id,provider,idempotency_key) DO NOTHING RETURNING *
      ) SELECT inserted.*,false AS idempotent_replay FROM inserted
        UNION ALL SELECT existing.*,true AS idempotent_replay FROM governed_order_provider_outbox existing
        WHERE existing.tenant_id=$1 AND existing.provider=$3 AND existing.idempotency_key=$6
          AND existing.request_hash=$7 AND NOT EXISTS(SELECT 1 FROM inserted) LIMIT 1`,
      [req.user!.tenantId, req.params.id, provider, operation, req.body.payload || {}, key, requestHash,
        req.user!.role, req.user!.id]
    );
    if (!result.rowCount) return res.status(409).json({ error: 'missing order or conflicting provider command' });
    res.status(result.rows[0].idempotent_replay ? 200 : 202).json(result.rows[0]);
  } catch (error) { next(error); }
});

router.post('/providers/claim', async (req: AuthRequest, res, next) => {
  if (!['integration_worker', 'admin'].includes(req.user!.role)) return res.status(403).json({ error: 'integration worker required' });
  try {
    const leaseToken = crypto.randomUUID();
    const result = await query(
      `WITH candidate AS (
        SELECT id FROM governed_order_provider_outbox WHERE tenant_id=$1 AND attempts<5
          AND ((status IN('queued','failed') AND next_attempt_at<=NOW()) OR (status='processing' AND lease_expires_at<NOW()))
        ORDER BY next_attempt_at,id FOR UPDATE SKIP LOCKED LIMIT 1
      ) UPDATE governed_order_provider_outbox o SET status='processing',lease_token=$2,
          lease_expires_at=NOW()+INTERVAL '2 minutes',updated_at=NOW()
        FROM candidate WHERE o.id=candidate.id RETURNING o.*`, [req.user!.tenantId, leaseToken]
    );
    if (!result.rowCount) return res.status(204).end();
    res.json(result.rows[0]);
  } catch (error) { next(error); }
});

router.post('/providers/:outboxId/results', async (req: AuthRequest, res, next) => {
  if (!['integration_worker', 'admin'].includes(req.user!.role)) return res.status(403).json({ error: 'integration worker required' });
  const status = String(req.body.status || '');
  const leaseToken = String(req.get('X-Lease-Token') || '');
  const receipt = req.body.receipt;
  if (!['delivered', 'failed'].includes(status) || !leaseToken) return res.status(422).json({ error: 'status and lease token required' });
  if (status === 'delivered' && (!receipt || !validKey(receipt.receiptRef)
      || !receipt.receivedAt || Number.isNaN(Date.parse(receipt.receivedAt)) || containsSecret(receipt))) {
    return res.status(422).json({ error: 'typed secret-free provider receipt required' });
  }
  if (status === 'failed' && !errorCode.test(String(req.body.errorCode || ''))) {
    return res.status(422).json({ error: 'bounded errorCode required' });
  }
  try {
    const current = await query(
      `SELECT attempts FROM governed_order_provider_outbox
       WHERE tenant_id=$1 AND id=$2 AND status='processing' AND lease_token=$3 AND lease_expires_at>=NOW()`,
      [req.user!.tenantId, req.params.outboxId, leaseToken]
    );
    if (!current.rowCount) return res.status(409).json({ error: 'missing, expired, or terminal provider command' });
    const attempts = Number(current.rows[0].attempts) + 1;
    const retry = retryDisposition(attempts);
    const nextStatus = status === 'delivered' ? 'delivered' : retry.status;
    const result = await query(
      `UPDATE governed_order_provider_outbox SET status=$1,attempts=$2,provider_receipt=$3,
         last_error_code=$4,delivered_at=CASE WHEN $1='delivered' THEN NOW() END,
         next_attempt_at=NOW()+($5::text||' seconds')::interval,lease_token=NULL,lease_expires_at=NULL,updated_at=NOW()
       WHERE tenant_id=$6 AND id=$7 AND status='processing' AND lease_token=$8 RETURNING *`,
      [nextStatus, attempts, status === 'delivered' ? receipt : null,
        status === 'failed' ? String(req.body.errorCode) : null, retry.retryAfterSeconds,
        req.user!.tenantId, req.params.outboxId, leaseToken]
    );
    if (!result.rowCount) return res.status(409).json({ error: 'provider command lease changed' });
    res.json(result.rows[0]);
  } catch (error) { next(error); }
});

export default router;
