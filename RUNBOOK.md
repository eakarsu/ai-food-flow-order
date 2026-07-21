# Governed order operations

The supported backend path is `/api/governed-orders`. It is tenant scoped and
uses a payload-bound `Idempotency-Key`, server-calculated integer-cent totals,
provider quote references, optimistic versions, role-scoped transitions,
immutable events, signed provider webhooks, and a leased provider outbox.

## Lifecycle

1. Install locked dependencies explicitly with `npm ci` in the project and
   `server` directories.
2. Set the variables in `.env.example` through an approved secret manager. Never
   put live values in a repository file.
3. Run `./start.sh check` without mutating the database.
4. Back up the database and run `./start.sh migrate` as a separate approved
   release step. The migration runner records each applied SQL file.
   Before release, review every existing role assignment; older deployments may
   have applied a prior RBAC migration that promoted legacy accounts.
5. Build artifacts in CI, then run `./start.sh start`. Startup never installs,
   seeds, migrates, deletes files, or kills processes.

Provider workers claim one outbox item with `FOR UPDATE SKIP LOCKED`. A claim has
a two-minute lease. Delivered results require a typed, secret-free receipt;
failed results use bounded error codes, exponential retry, and become dead
letters after five attempts. Operators investigate dead letters, compare the
request hash to provider records, append a reasoned reconciliation transition,
then submit a new idempotent command rather than editing audit history.

Webhook providers sign the canonical JSON body with HMAC-SHA256 and a secret in
`PROVIDER_WEBHOOK_SECRETS_JSON`. Duplicate provider event identifiers replay only
when the payload digest matches; conflicting reuse is rejected. Events that do
not fit the current state are retained as quarantined evidence and do not force
a lifecycle shortcut.

## Rollback and incident handling

- Roll back application code independently. Migrations are additive and audit
  rows are append-only; do not delete or rewrite them.
- Disable the affected provider worker, preserve outbox/webhook rows, rotate any
  exposed secret at the provider, and record external receipt references.
- Partial fulfillment, uncertain payment state, or conflicting provider evidence
  must move through `reconciliation_required`; never infer a refund or delivery.
- Database restore, provider credentials, payment certification, tax nexus/rate
  approval, merchant onboarding, and live delivery validation are external
  release gates. Passing repository tests does not certify those systems.

Generated gap/LLM routes are disabled by default and forbidden in production.
They are not part of the governed order acceptance boundary.
Seed endpoints are also disabled by default and cannot be enabled in production.
