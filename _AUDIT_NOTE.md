# Audit Apply Note — ai-food-flow-order

## Audit recommendations (from batch_00.md)

Partial-build food-delivery: 21 route files, 8 AI endpoints (wait-time + upsell). Health endpoint already at `/health`.

### Missing AI counterparts
- AI demand forecasting by restaurant & time
- AI driver route optimization (TSP solver)
- AI menu recommendation (cold-start, personalized)
- AI fraud detection (payment anomalies, refund abuse)
- AI churn prediction (identify at-risk customers)

### Missing non-AI features
- Loyalty program (points, tiers, gamification)
- Affiliate commission automation
- Restaurant health score
- Dynamic pricing (surge during peak hours)

### Custom feature suggestions
- Multi-modal order intake (voice + chatbot + mobile)
- Real-time kitchen display integration
- Driver incentive optimization
- Supply chain risk
- Post-delivery feedback loops (NLP)

## Implemented in this pass

None. AI endpoints in this project go through dedicated controller functions in `server/src/controllers/aiController.ts` and `aiExtController.ts`. Adding new AI endpoints would require new controller code with the project's specific pattern (DB models, migration of new tables, etc.) — not a clean MECHANICAL add.

## Backlog (not implemented)

| Item | Category | Reason |
|---|---|---|
| AI demand forecasting | TOO-RISKY | New controller + table |
| AI driver route optimization | TOO-RISKY | TSP solver + map data integration |
| AI menu recommendation | TOO-RISKY | New embedding pipeline |
| AI fraud detection | TOO-RISKY | New controller + transaction-graph schema |
| AI churn prediction | TOO-RISKY | Customer-history aggregation pipeline |
| Loyalty program | NEEDS-PRODUCT-DECISION | Tier/points design |
| Dynamic pricing | NEEDS-PRODUCT-DECISION | Surge policy |
| Restaurant health score | NEEDS-CREDS | Health-inspection data feed |
| Multi-modal intake unification | TOO-RISKY | NLU pipeline |
| Kitchen display integration | NEEDS-CREDS | KDS provider |

## Apply pass 3 (frontend)

**Action:** LEFT-AS-IS (FE already wired).

The Vite/React frontend already has dedicated pages for the existing AI endpoints (`src/pages/wait-time/WaitTimePage.tsx`, `src/pages/upsell/UpsellPage.tsx`) plus pages for proposed AI features that aren't yet implemented in backend (`dynamic-pricing/`, `predictive-inventory/`, `personalized-recs/`, `staff-optimizer/`, `sustainability/`, `voice-order/`, `affiliate-network/`, `group-order/`). All routed in `src/App.tsx`. Wiring uses `services/api/ai.ts` with `services/api/config.ts` for auth-aware `apiRequest`.

Pass 2 left this project as TOO-RISKY backlog (no new backend endpoints were added), so there is no new FE wiring to perform. Files: none modified.

## Apply pass 4 (mechanical backlog)

**Action:** SKIPPED. All remaining backlog items in this project (AI demand forecasting, AI driver TSP optimization, AI menu recommendation cold-start, AI fraud detection, AI churn prediction, loyalty program, dynamic pricing, restaurant health score, multi-modal intake, kitchen-display integration) are tagged TOO-RISKY (require new controllers + DB tables + embedding/TSP/NLU pipelines), NEEDS-PRODUCT-DECISION, or NEEDS-CREDS. No mechanical items remain.

Files: none modified.

## Apply pass 5 (all backlog)

Implemented 8 endpoints additively (cap was 10) via a brand-new controller `server/src/controllers/aiBacklogController.ts` and route entries appended to `server/src/routes/ai.ts`. No changes to working code, no new deps.

### Backend (new endpoints — all 503 + `missing: 'OPENROUTER_API_KEY'` when key unset)
1. `POST /api/ai/demand-forecast` — TOO-RISKY → additive. Pulls last 14d hourly order counts (try/catch), asks LLM for an N-hour forecast. In-memory baseline fallback if LLM JSON parse fails.
2. `POST /api/ai/route-optimization` — TOO-RISKY → additive. Greedy nearest-neighbour heuristic in-memory + LLM refinement. PRODUCT-DECISION: no map-data SDK; no real TSP solver.
3. `POST /api/ai/menu-recommendation-cold` — TOO-RISKY → additive. Cold-start = popularity ranking + LLM narrative. No embedding pipeline.
4. `POST /api/ai/fraud-detection` — TOO-RISKY → additive. Pulls per-user payment counts + refund counts (try/catch), asks LLM to score 0–1.
5. `POST /api/ai/churn-prediction` — TOO-RISKY → additive. Aggregates user order history (try/catch), LLM produces churnRisk + drivers + retention suggestions.
6. `POST /api/ai/restaurant-health-score` — NEEDS-CREDS → additive. PRODUCT-DECISION: 0–100 composite of avg review, on-time rate, refund rate. NEEDS-CREDS env: `HEALTH_INSPECTION_API_KEY` documented for future inspection feed; current implementation never calls it.
7. `GET /api/ai/loyalty/status` — NEEDS-PRODUCT-DECISION resolved. PRODUCT-DECISION: bronze < $100, silver < $500, gold < $1500, else platinum. 1 point per dollar of completed-order subtotal_cents.
8. `POST /api/ai/dynamic-surge-policy` — NEEDS-PRODUCT-DECISION resolved. PRODUCT-DECISION: max +25% surge / -20% discount, mirroring existing dynamic-pricing endpoint. Returns recommendation only; never writes to menu.

All endpoints: defensive try/catch on every DB lookup (tables/columns may not yet exist), best-effort persistence into `ai_results` (table optional), in-memory fallback when LLM JSON parsing fails.

### Frontend
Appended 8 client helpers to `src/services/api/ai.ts` (`aiDemandForecast`, `aiRouteOptimization`, `aiMenuRecommendationCold`, `aiFraudDetection`, `aiChurnPrediction`, `aiRestaurantHealthScore`, `aiLoyaltyStatus`, `aiDynamicSurgePolicy`). Existing FE pages (`src/pages/dynamic-pricing/`, `src/pages/personalized-recs/`, etc.) can call them via the same auth-aware `apiRequest` helper. No new pages created (existing pages already cover these features by name, and creating dedicated pages for each would balloon the surface).

### Smoke test
Started backend on port 3081. Login as `demo@orderlybite.com / Demo123!` returns a valid 233-char access token. Existing endpoints (e.g. `/api/ai/wait-time/history`) return `{"error":"Invalid token"}` with the same valid token — this is a pre-existing bug in `server/src/middleware/auth.ts` (verified by stashing the new files: existing endpoints fail identically without our changes). Per constraints, did not modify working code.

Route registration verified via runtime introspection: all 8 new paths show up under the `/api/ai` router (alongside the 14 pre-existing ones).

### Files modified / created
- `server/src/controllers/aiBacklogController.ts` (created, ~360 lines)
- `server/src/routes/ai.ts` (extended: 1 import block + 8 router lines)
- `src/services/api/ai.ts` (extended: 8 helper functions)
