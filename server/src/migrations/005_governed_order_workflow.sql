-- Preserve least privilege for databases that applied an earlier RBAC migration.
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'customer';
UPDATE users SET role='customer' WHERE role IS NULL OR role='viewer';

CREATE TABLE IF NOT EXISTS governed_orders (
  tenant_id TEXT NOT NULL,
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  subject_id TEXT NOT NULL,
  customer_actor_id UUID NOT NULL,
  merchant_id TEXT NOT NULL,
  restaurant_id TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'reservation_pending' CHECK(state IN(
    'reservation_pending','reserved','reservation_failed','payment_pending','payment_authorized',
    'payment_failed','fulfillment_pending','partially_fulfilled','fulfilled','fulfillment_failed',
    'cancellation_pending','cancelled','refund_pending','refunded','refund_failed','reconciliation_required'
  )),
  request JSONB NOT NULL,
  subtotal_cents BIGINT NOT NULL CHECK(subtotal_cents >= 0),
  tax_cents BIGINT NOT NULL CHECK(tax_cents >= 0),
  delivery_cents BIGINT NOT NULL CHECK(delivery_cents >= 0),
  tip_cents BIGINT NOT NULL CHECK(tip_cents >= 0),
  discount_cents BIGINT NOT NULL CHECK(discount_cents >= 0),
  total_cents BIGINT NOT NULL CHECK(total_cents >= 0),
  inventory_quote_ref TEXT NOT NULL,
  inventory_quote_version TEXT NOT NULL,
  tax_quote_ref TEXT NOT NULL,
  delivery_quote_ref TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  request_hash CHAR(64) NOT NULL,
  version INTEGER NOT NULL DEFAULT 1 CHECK(version > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY(tenant_id,id),
  UNIQUE(tenant_id,idempotency_key)
);

CREATE TABLE IF NOT EXISTS governed_order_lines (
  tenant_id TEXT NOT NULL,
  order_id UUID NOT NULL,
  sku TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK(quantity > 0),
  unit_price_cents BIGINT NOT NULL CHECK(unit_price_cents >= 0),
  fulfilled_quantity INTEGER NOT NULL DEFAULT 0 CHECK(fulfilled_quantity >= 0 AND fulfilled_quantity <= quantity),
  PRIMARY KEY(tenant_id,order_id,sku),
  FOREIGN KEY(tenant_id,order_id) REFERENCES governed_orders(tenant_id,id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS governed_order_events (
  id BIGSERIAL PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  order_id UUID NOT NULL,
  actor_id TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  event_type TEXT NOT NULL,
  from_state TEXT,
  to_state TEXT,
  reason TEXT,
  evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  FOREIGN KEY(tenant_id,order_id) REFERENCES governed_orders(tenant_id,id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS governed_order_provider_outbox (
  id BIGSERIAL PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  order_id UUID NOT NULL,
  provider TEXT NOT NULL CHECK(provider IN('inventory','tax','payment','delivery','partner_webhook')),
  operation TEXT NOT NULL,
  payload JSONB NOT NULL,
  idempotency_key TEXT NOT NULL,
  request_hash CHAR(64) NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued' CHECK(status IN('queued','processing','delivered','failed','dead_letter')),
  attempts INTEGER NOT NULL DEFAULT 0 CHECK(attempts >= 0),
  next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  lease_token UUID,
  lease_expires_at TIMESTAMPTZ,
  provider_receipt JSONB,
  last_error_code TEXT,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id,provider,idempotency_key),
  FOREIGN KEY(tenant_id,order_id) REFERENCES governed_orders(tenant_id,id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS governed_order_webhook_events (
  id BIGSERIAL PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_event_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  order_id UUID NOT NULL,
  request_hash CHAR(64) NOT NULL,
  payload JSONB NOT NULL,
  transition_applied BOOLEAN NOT NULL DEFAULT FALSE,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id,provider,provider_event_id),
  FOREIGN KEY(tenant_id,order_id) REFERENCES governed_orders(tenant_id,id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS governed_orders_scope_idx
  ON governed_orders(tenant_id,subject_id,merchant_id,state,updated_at DESC);
CREATE INDEX IF NOT EXISTS governed_provider_claim_idx
  ON governed_order_provider_outbox(tenant_id,status,next_attempt_at,lease_expires_at);
CREATE INDEX IF NOT EXISTS governed_webhook_order_idx
  ON governed_order_webhook_events(tenant_id,order_id,received_at);

CREATE OR REPLACE FUNCTION reject_governed_order_event_mutation() RETURNS trigger
LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'governed_order_events is append-only'; END $$;
DROP TRIGGER IF EXISTS governed_order_events_append_only ON governed_order_events;
CREATE TRIGGER governed_order_events_append_only
BEFORE UPDATE OR DELETE ON governed_order_events
FOR EACH ROW EXECUTE FUNCTION reject_governed_order_event_mutation();
