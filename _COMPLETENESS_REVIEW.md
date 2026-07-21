# Completeness Review: ai-food-flow-order

**Review date:** 2026-07-20

## Assessment basis

Static inspection plus an isolated PostgreSQL migration, explicit administrator provisioning, backend startup, database-backed login/session/API acceptance, maintained tests, and production builds. Live payment, tax, inventory, delivery, and partner providers remain external deployment gates.

## Classification

**Functional but incomplete**

This is a substantive but unfinished commerce/order operations application, not just an empty scaffold. Inspection found 266 source files across `src/`, `server/`, `android/`, `ios/` using Next.js, React, Express, JVM, Swift/iOS; however, the checked-in workflow and delivery controls do not yet demonstrate a complete, production-operable product.

## Why it is not complete

- Generated gap/visualization routes describe missing capabilities or simulate recommendations; they do not implement the underlying domain operation.
- Generic LLM calls are used as product behavior without enough typed tools, grounded evidence, deterministic rules, or output evaluation.
- Mock, demo, sample, fixture, or placeholder behavior remains in executable/product paths.
- Only 1 test-like file(s) were found, too little evidence for the breadth of the implemented workflow.
- No checked-in CI workflow proves builds, tests, migrations, and security checks on every change.

## Needed features

1. Implement an idempotent order state machine covering reservation, payment, cancellation, refund, fulfillment, and exception recovery.
2. Connect real inventory, tax, payment, shipping/delivery, and partner-webhook providers behind retry-safe adapters.
3. Add role-scoped customer, operator, and merchant workflows with immutable order and refund audit history.
4. Test duplicate webhooks, partial fulfillment, payment failure, overselling, and reconciliation end to end.
5. Add risk-based unit, integration, and end-to-end tests in CI, including migration and failure-path coverage.

## Risks or launch blockers

- Credential/configuration exposure: environment files are present in the repository tree and must be checked against Git history and rotated if real.
- Weak/fallback secret patterns can permit forged sessions or accidental insecure deployments.
- Automation contains destructive process, filesystem, or database operations; do not run it on a shared machine without review.
- Startup appears coupled to seed/migration behavior, risking data mutation or non-repeatable launches.

## Evidence inspected

- `README.md`
- `server/src/controllers/authController.ts:9`
- `src/App.tsx:52`
- `src/App.tsx`
- `android/app/src/test/java/com/getcapacitor/myapp/ExampleUnitTest.java`
- `package.json`

## Recommended next action

Choose one real commerce/order operations journey, define acceptance criteria and external contracts, then close its persistence, permission, integration, failure, and test gaps before expanding features.

## Implementation progress (2026-07-18)

The recommended governed commerce boundary is now implemented at
`/api/governed-orders`; generated gap/LLM routes and seed endpoints are disabled
by default and cannot be enabled in production.

1. **Idempotent lifecycle:** `server/src/governed/orderPolicy.ts`,
   `server/src/routes/governedOrders.ts`, and migration 005 implement
   payload-bound idempotency, optimistic versions, reservation, payment,
   cancellation, refund, fulfillment, failure, retry, and reconciliation states.
2. **Provider boundary:** inventory, tax, payment, delivery, and partner webhook
   operations use typed, secret-free commands, a leased PostgreSQL outbox,
   bounded retries/dead letters, provider receipts, and HMAC-signed,
   payload-bound webhook deduplication. Live provider workers and credentials
   remain deployment integrations and are not represented as validated here.
3. **Scoped operations and audit:** signed tokens require tenant, role, and
   subject claims; customer/operator/merchant access and transitions are scoped;
   socket subscriptions are database-authorized; order events are append-only.
   Migrations now default new and legacy viewer accounts to `customer` rather
   than elevating them to administrator.
4. **Failure-path evidence:** 12 deterministic policy tests plus one live HTTP
   and PostgreSQL journey cover duplicate and conflicting webhooks, idempotent
   replay and conflicting key reuse, overselling, payment failure, recovery,
   partial fulfillment, reconciliation, provider outbox creation, and rejection
   of audit mutation.
5. **Delivery controls:** `.github/workflows/governed-orders.yml`, `start.sh`,
   `.env.example`, and `RUNBOOK.md` provide locked installation, build/test,
   migration/repeat-migration checks, fail-closed configuration, explicit
   migration/start commands, incident response, and external release gates.

Validation performed locally:

- Backend TypeScript build passed. All 13 tests passed against an isolated
  PostgreSQL instance; none were skipped.
- Migrations 001 through 005 applied successfully, and a second deployment
  correctly skipped all five already-recorded migrations.
- The Vite production build passed after a clean locked dependency install.
- `bash -n start.sh`, the default launcher's fail-closed missing-database check,
  `git diff --check`, fallback-secret scans, and review-heading checks passed.
- The ignored local `.env` is not tracked and has no commits in current Git
  history; its values were not printed or trusted. Operators must still source
  production secrets from an approved manager and rotate any externally exposed
  credentials.

Residual release gates are explicit: the root dependency audit reports 30
findings (2 low, 11 moderate, 15 high, 2 critical), and the backend reports 29
(1 low, 16 moderate, 9 high, 3 critical). They were not force-upgraded across
major versions. Production payment/tax/inventory/delivery credentials, provider
workers, merchant onboarding, verified TLS trust roots, data migration/role
review, provider certification, and staging reconciliation remain required.

## Runtime acceptance (2026-07-20)

- `start.sh start` now requires a validated explicit `BACKEND_PORT`, refuses an occupied port, binds only to `BACKEND_HOST=127.0.0.1`, and supports the isolated runtime source without installing, migrating, or seeding during launch. The server has no fallback listener port and starts under the validator's test environment only through an explicit runtime-launch flag.
- Broad demo seeding was removed from conventional bootstrap script names. A separate `create-admin` command requires `BOOTSTRAP_ACKNOWLEDGEMENT=create-initial-admin`, refuses overwrite, hashes the injected password with bcrypt cost 12, and inserts only the requested PostgreSQL administrator.
- The first and only recorded attempt in `_runtime_non_suite_repair_shard2l.tsv` is `API_VERIFIED / startup_login_session_api`. It used PostgreSQL `127.0.0.1:55623` and the backend listener `127.0.0.1:6060`; reserved UI port `6061` remained listener-free. Login checked the persisted `users` credential, stored the refresh token in PostgreSQL, and the bearer-authenticated `/api/auth/me` route reloaded the account from the database.
- Current verification passed: backend TypeScript build, 13 maintained tests executed (12 passed and the database integration journey skipped without its opt-in test database), and the Vite production build. Shell syntax, diff checks, and assigned-port release checks passed.
