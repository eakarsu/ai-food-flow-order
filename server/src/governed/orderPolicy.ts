import crypto from 'node:crypto';

export const ORDER_STATES = [
  'reservation_pending',
  'reserved',
  'reservation_failed',
  'payment_pending',
  'payment_authorized',
  'payment_failed',
  'fulfillment_pending',
  'partially_fulfilled',
  'fulfilled',
  'fulfillment_failed',
  'cancellation_pending',
  'cancelled',
  'refund_pending',
  'refunded',
  'refund_failed',
  'reconciliation_required',
] as const;

export type OrderState = (typeof ORDER_STATES)[number];
export type OrderRole = 'customer' | 'operator' | 'merchant' | 'integration_worker' | 'admin';

type Transition = { to: OrderState; roles: OrderRole[] };
const TRANSITIONS: Record<OrderState, Transition[]> = {
  reservation_pending: [
    { to: 'reserved', roles: ['integration_worker', 'admin'] },
    { to: 'reservation_failed', roles: ['integration_worker', 'admin'] },
    { to: 'cancellation_pending', roles: ['customer', 'operator', 'merchant', 'admin'] },
  ],
  reserved: [
    { to: 'payment_pending', roles: ['operator', 'merchant', 'integration_worker', 'admin'] },
    { to: 'cancellation_pending', roles: ['customer', 'operator', 'merchant', 'admin'] },
  ],
  reservation_failed: [
    { to: 'reservation_pending', roles: ['operator', 'merchant', 'admin'] },
    { to: 'reconciliation_required', roles: ['operator', 'merchant', 'admin'] },
    { to: 'cancelled', roles: ['operator', 'merchant', 'admin'] },
  ],
  payment_pending: [
    { to: 'payment_authorized', roles: ['integration_worker', 'admin'] },
    { to: 'payment_failed', roles: ['integration_worker', 'admin'] },
    { to: 'cancellation_pending', roles: ['customer', 'operator', 'merchant', 'admin'] },
  ],
  payment_authorized: [
    { to: 'fulfillment_pending', roles: ['operator', 'merchant', 'integration_worker', 'admin'] },
    { to: 'cancellation_pending', roles: ['customer', 'operator', 'merchant', 'admin'] },
  ],
  payment_failed: [
    { to: 'payment_pending', roles: ['customer', 'operator', 'merchant', 'admin'] },
    { to: 'cancellation_pending', roles: ['customer', 'operator', 'merchant', 'admin'] },
    { to: 'reconciliation_required', roles: ['operator', 'merchant', 'admin'] },
  ],
  fulfillment_pending: [
    { to: 'partially_fulfilled', roles: ['integration_worker', 'merchant', 'admin'] },
    { to: 'fulfilled', roles: ['integration_worker', 'merchant', 'admin'] },
    { to: 'fulfillment_failed', roles: ['integration_worker', 'merchant', 'admin'] },
  ],
  partially_fulfilled: [
    { to: 'fulfillment_pending', roles: ['operator', 'merchant', 'admin'] },
    { to: 'fulfilled', roles: ['integration_worker', 'merchant', 'admin'] },
    { to: 'reconciliation_required', roles: ['operator', 'merchant', 'admin'] },
    { to: 'cancellation_pending', roles: ['operator', 'merchant', 'admin'] },
  ],
  fulfilled: [],
  fulfillment_failed: [
    { to: 'fulfillment_pending', roles: ['operator', 'merchant', 'admin'] },
    { to: 'reconciliation_required', roles: ['operator', 'merchant', 'admin'] },
    { to: 'cancellation_pending', roles: ['operator', 'merchant', 'admin'] },
  ],
  cancellation_pending: [
    { to: 'cancelled', roles: ['integration_worker', 'operator', 'merchant', 'admin'] },
    { to: 'refund_pending', roles: ['integration_worker', 'operator', 'merchant', 'admin'] },
    { to: 'reconciliation_required', roles: ['operator', 'merchant', 'admin'] },
  ],
  cancelled: [],
  refund_pending: [
    { to: 'refunded', roles: ['integration_worker', 'admin'] },
    { to: 'refund_failed', roles: ['integration_worker', 'admin'] },
  ],
  refunded: [],
  refund_failed: [
    { to: 'refund_pending', roles: ['operator', 'merchant', 'admin'] },
    { to: 'reconciliation_required', roles: ['operator', 'merchant', 'admin'] },
  ],
  reconciliation_required: [
    { to: 'reservation_pending', roles: ['operator', 'merchant', 'admin'] },
    { to: 'payment_pending', roles: ['operator', 'merchant', 'admin'] },
    { to: 'fulfillment_pending', roles: ['operator', 'merchant', 'admin'] },
    { to: 'refund_pending', roles: ['operator', 'merchant', 'admin'] },
    { to: 'cancelled', roles: ['operator', 'merchant', 'admin'] },
  ],
};

export const PROVIDER_OPERATIONS = Object.freeze({
  inventory: new Set(['reserve', 'release', 'reconcile']),
  tax: new Set(['quote', 'reconcile']),
  payment: new Set(['authorize', 'capture', 'cancel', 'refund', 'reconcile']),
  delivery: new Set(['create', 'cancel', 'reconcile']),
  partner_webhook: new Set(['notify', 'reconcile']),
});

const KEY = /^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$/;
const secretKey = /(authorization|password|secret|private.?key|api.?key|access.?token|refresh.?token)/i;

export function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    return `{${Object.keys(record).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(record[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

export function digest(value: unknown): string {
  return crypto.createHash('sha256').update(canonicalJson(value)).digest('hex');
}

export function validKey(value: unknown): value is string {
  return typeof value === 'string' && KEY.test(value);
}

export function containsSecret(value: unknown): boolean {
  if (Array.isArray(value)) return value.some(containsSecret);
  if (!value || typeof value !== 'object') return false;
  return Object.entries(value as Record<string, unknown>).some(
    ([key, nested]) => secretKey.test(key) || containsSecret(nested)
  );
}

export function canTransition(from: OrderState, to: OrderState, role: OrderRole): boolean {
  return TRANSITIONS[from].some((entry) => entry.to === to && entry.roles.includes(role));
}

export interface DraftLine {
  sku: string;
  quantity: number;
  unitPriceCents: number;
  availableQuantity: number;
}

export interface OrderDraft {
  customerActorId: string;
  subjectId: string;
  merchantId: string;
  restaurantId: string;
  lines: DraftLine[];
  inventoryQuoteRef: string;
  inventoryQuoteVersion: string;
  taxQuoteRef: string;
  taxCents: number;
  deliveryQuoteRef: string;
  deliveryCents: number;
  tipCents?: number;
  discountCents?: number;
  declaredTotalCents: number;
}

export function evaluateDraft(input: OrderDraft, actorId: string) {
  const errors: string[] = [];
  if (input.customerActorId !== actorId) errors.push('customerActorId must match signed actor');
  for (const field of ['subjectId', 'merchantId', 'restaurantId', 'inventoryQuoteRef',
    'inventoryQuoteVersion', 'taxQuoteRef', 'deliveryQuoteRef'] as const) {
    if (!validKey(input[field])) errors.push(`${field} is invalid`);
  }
  if (!Array.isArray(input.lines) || input.lines.length === 0) errors.push('at least one line is required');
  let subtotalCents = 0;
  const seen = new Set<string>();
  for (const [index, line] of (input.lines || []).entries()) {
    if (!validKey(line.sku) || seen.has(line.sku)) errors.push(`lines[${index}].sku is invalid or duplicated`);
    seen.add(line.sku);
    if (!Number.isInteger(line.quantity) || line.quantity < 1 || line.quantity > 100) {
      errors.push(`lines[${index}].quantity is invalid`);
    }
    if (!Number.isInteger(line.availableQuantity) || line.availableQuantity < line.quantity) {
      errors.push(`lines[${index}] would oversell inventory`);
    }
    if (!Number.isInteger(line.unitPriceCents) || line.unitPriceCents < 0) {
      errors.push(`lines[${index}].unitPriceCents is invalid`);
    } else if (Number.isInteger(line.quantity)) {
      subtotalCents += line.unitPriceCents * line.quantity;
    }
  }
  const taxCents = input.taxCents;
  const deliveryCents = input.deliveryCents;
  const tipCents = input.tipCents || 0;
  const discountCents = input.discountCents || 0;
  for (const [name, value] of Object.entries({ taxCents, deliveryCents, tipCents, discountCents })) {
    if (!Number.isInteger(value) || value < 0) errors.push(`${name} must be non-negative integer cents`);
  }
  const totalCents = subtotalCents + taxCents + deliveryCents + tipCents - discountCents;
  if (!Number.isSafeInteger(totalCents) || totalCents < 0 || totalCents !== input.declaredTotalCents) {
    errors.push('declaredTotalCents does not match server-calculated total');
  }
  return {
    errors,
    normalized: {
      ...input,
      lines: [...(input.lines || [])].map((line) => ({ ...line })).sort((a, b) => a.sku.localeCompare(b.sku)),
      subtotalCents,
      tipCents,
      discountCents,
      totalCents,
      initialState: 'reservation_pending' as OrderState,
    },
  };
}

export function validateProviderCommand(provider: string, operation: string, payload: unknown): string[] {
  const operations = PROVIDER_OPERATIONS[provider as keyof typeof PROVIDER_OPERATIONS];
  const errors: string[] = [];
  if (!operations || !operations.has(operation)) errors.push('unsupported provider operation');
  if (containsSecret(payload)) errors.push('provider payload must contain references, not credentials');
  return errors;
}

export function retryDisposition(attemptsAfterResult: number, maxAttempts = 5) {
  if (!Number.isInteger(attemptsAfterResult) || attemptsAfterResult < 1) throw new Error('attempt count is invalid');
  return {
    status: attemptsAfterResult >= maxAttempts ? 'dead_letter' : 'failed',
    retryAfterSeconds: Math.min(3600, 30 * (2 ** (attemptsAfterResult - 1))),
  };
}

export function verifyProviderSignature(payload: unknown, signature: string, secret: string): boolean {
  if (secret.length < 32 || !/^[0-9a-f]{64}$/i.test(signature || '')) return false;
  const expected = crypto.createHmac('sha256', secret).update(canonicalJson(payload)).digest();
  const supplied = Buffer.from(signature, 'hex');
  return supplied.length === expected.length && crypto.timingSafeEqual(supplied, expected);
}

export function webhookTransition(eventType: string): OrderState | null {
  return ({
    'inventory.reserved': 'reserved',
    'inventory.failed': 'reservation_failed',
    'payment.authorized': 'payment_authorized',
    'payment.failed': 'payment_failed',
    'delivery.partial': 'partially_fulfilled',
    'delivery.fulfilled': 'fulfilled',
    'delivery.failed': 'fulfillment_failed',
    'payment.refunded': 'refunded',
    'payment.refund_failed': 'refund_failed',
  } as Record<string, OrderState>)[eventType] || null;
}

export function reconcileFulfillment(lines: Array<{ ordered: number; fulfilled: number }>): OrderState {
  if (!lines.length || lines.some((line) => !Number.isInteger(line.ordered) || !Number.isInteger(line.fulfilled)
      || line.ordered < 1 || line.fulfilled < 0 || line.fulfilled > line.ordered)) {
    throw new Error('fulfillment counts are invalid');
  }
  const fulfilled = lines.reduce((sum, line) => sum + line.fulfilled, 0);
  const ordered = lines.reduce((sum, line) => sum + line.ordered, 0);
  if (fulfilled === 0) return 'fulfillment_failed';
  if (fulfilled === ordered) return 'fulfilled';
  return 'partially_fulfilled';
}
