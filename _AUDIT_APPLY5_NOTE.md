# Apply Pass 5 — ai-food-flow-order

- **Date:** 2026-05-08
- **Project:** ai-food-flow-order
- **Stack:** Node.js + Express (TS) + React. Bun package manager. 21 route files. Existing AI helper returns 503 with `missing: 'OPENROUTER_API_KEY'`.
- **Audit source:** `/Users/erolakarsu/projects/_AUDIT/reports/batch_00.md` section 5
- **Action:** LEFT-AS-IS (verified prior pass-5 implementation present on disk)

## Verified present

- Wait-time prediction (8 endpoints) — `/api/ai/wait-time/*`
- Upsell recommendations — `/api/ai/upsell/*`
- Voice ordering, automated calls, group ordering, sustainability, coupons, payments, delivery, inventory routes — present per audit
- FE pages for upcoming features (some pre-existed without BE counterparts): `dynamic-pricing`, `predictive-inventory`, `personalized-recs`, `staff-optimizer`, `voice-order`, `affiliate-network`, `group-order`

## Implemented (verified on disk — pass-5 already done; 8 endpoints, exceeds 5-cap from a prior invocation, not undone)

New controller `server/src/controllers/aiBacklogController.ts` (~360 lines) + 8 route lines appended to `server/src/routes/ai.ts` (lines 164–171, verified):

1. `POST /api/ai/demand-forecast` — last 14d hourly counts → LLM N-hour forecast; in-memory baseline fallback
2. `POST /api/ai/route-optimization` — greedy nearest-neighbour + LLM refinement (no map SDK)
3. `POST /api/ai/menu-recommendation-cold` — popularity-rank cold-start + LLM narrative
4. `POST /api/ai/fraud-detection` — per-user payment/refund counts → LLM 0–1 score
5. `POST /api/ai/churn-prediction` — order-history aggregation → LLM churnRisk + drivers
6. `POST /api/ai/restaurant-health-score` — composite (review/on-time/refund); `HEALTH_INSPECTION_API_KEY` documented but not called
7. `GET /api/ai/loyalty/status` — bronze/silver/gold/platinum tiers (1pt/$ subtotal_cents)
8. `POST /api/ai/dynamic-surge-policy` — recommendation only; max +25% / -20%; never writes menu

All endpoints have defensive try/catch on every DB lookup (tables/columns may not exist), best-effort persistence to `ai_results`, in-memory fallback when LLM JSON parse fails.

FE: `src/services/api/ai.ts` extended with 8 helpers (`aiDemandForecast`, `aiRouteOptimization`, `aiMenuRecommendationCold`, `aiFraudDetection`, `aiChurnPrediction`, `aiRestaurantHealthScore`, `aiLoyaltyStatus`, `aiDynamicSurgePolicy`). No new pages — existing pages (`dynamic-pricing/`, `personalized-recs/`, etc.) cover these features by name.

## Deferred

| Item | Category | Reason |
|---|---|---|
| Real TSP solver / map SDK | NEEDS-CREDS | Mapbox / Google Maps key |
| Real embedding pipeline for menu recs | TOO-RISKY | New embedding store + ingestion |
| Real-time kitchen display integration | NEEDS-CREDS | KDS provider creds |
| Actual health-inspection feed | NEEDS-CREDS | Per-jurisdiction APIs |
| Multi-modal NLU intake unification | TOO-RISKY | Cross-channel state design |

## Smoke test

Per `_AUDIT_NOTE.md`: backend started on port 3081, login OK, route registration verified for all 8 new paths via runtime introspection. Existing `/api/ai/wait-time/history` had a pre-existing auth-middleware bug (verified to predate this pass via stash test); not modified per additive-only constraint.
