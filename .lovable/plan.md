# Return Preview: The Money Maker

A live, always-on draft return that rebuilds itself every time a document or transaction lands in the account. Most taxx software shows the user nothing until March; this is the opposite, and it's what justifies a year-round subscription instead of a one-time filing fee.

## What the user sees

Route: `/dashboard/return-preview`

```text
+----------------------------------------------------------+
|  Your 2026 Return                Confidence: 73%  [info] |
|  Last updated 2 min ago                                  |
+----------------------------------------------------------+
|  Prepared by Joshua Hodge, AFSP  |  PTIN P012345678      |
|  QuickBooks ProAdvisor 2024      |  View credentials >   |
+----------------------------------------------------------+

[ Top-line card ]
  Estimated Refund                $4,210  (+$880 vs 2025)
  AGI                            $87,430  (verified)
  Taxxable Income                $74,180  (estimated)
  Total Liability                $11,604  (estimated)

[ Schedule C card ]  per-line badges: verified / est / missing
  Gross receipts                 $112,400  verified
  Total expenses                  $38,920  estimated (4 docs)
  Net profit                      $73,480

[ Schedule SE card ]
[ Schedule D / 8949 card ]

[ What-if scenarios ]  (Pro only — paywall card for Free)
  Sliders: SEP IRA, mileage, home-office sqft, HSA
  "Saving $5,000 to a SEP IRA would lower your refund-cost
   by $1,250 and raise your refund to $5,460."
```

Admin/preparer view bypasses the Pro gate and shows the same UI for any selected client.

## Engagement letter flow

First visit blocks the preview with a one-page acknowledgment:

- Scope of services (preparation, review, e-file)
- What is NOT included (audit representation unless purchased, bookkeeping unless purchased, legal advice)
- Fee schedule reference
- Client responsibilities (truthful records, document retention)
- Preparer credentials (auto-pulled from `preparer_profiles`)
- Checkbox + typed-name e-signature + timestamp + IP

Stored in `engagement_letters` with version hash so we can re-prompt if terms change.

## Pro gating

| Tier   | Sees preview | Sees scenarios | Save scenarios |
|--------|--------------|----------------|----------------|
| Free   | Yes, read-only top-line + Sched C only | Paywall card | No |
| Pro    | All forms, per-line badges | Yes, live sliders | Yes, named |
| Admin/Preparer | Full, for any client | Yes | Yes |

## Database changes

New tables:

1. `preparer_profiles` — one row per admin/preparer. Fields: `user_id`, `display_name`, `ptin`, `credentials[]` (AFSP, EA, CPA), `qb_certifications[]`, `bio`, `headshot_url`, `accepting_clients`.
2. `engagement_letters` — `user_id`, `preparer_id`, `tax_year`, `version_hash`, `acknowledged_at`, `signature_name`, `ip_address`, `scope_json`.
3. `return_scenarios` — `user_id`, `tax_year`, `name`, `inputs_json` (sep_contribution, mileage_override, home_office_sqft, hsa), `computed_summary_json`, `created_at`.
4. `return_snapshots` — daily snapshot of computed values so YoY deltas next year work and so the "+$880 vs last week" indicator can render. `user_id`, `tax_year`, `summary_json`, `created_at`.

All four get the standard RLS pattern: owner can read/write own rows, preparers with `tax_professional_access` can read assigned clients, admins via `has_role`.

## Calculation engine

New edge function `compute-return-preview`:

- Inputs: `user_id`, `tax_year`, optional `scenario_inputs`
- Pulls from existing tables: `tax_profiles`, `transactions`, `documents`, `mileage_trips`, `vehicle_expenses`, `estimated_tax_payments`, crypto positions
- Reuses existing `src/utils/taxCalculator.ts` for the math (already correctly subtracts mileage and uses `MILEAGE_RATE`)
- Returns: `{ form1040, scheduleC, scheduleSE, scheduleD, confidence: { overall, byLine }, yoyDelta }`
- Confidence calculation: `verified_lines / total_expected_lines` where "verified" means sourced from a parsed document or reconciled transaction, "estimated" means inferred, "missing" means a required input the taxx profile says should exist but doesn't.

Client calls this on page load and after every scenario slider change (debounced 400ms).

## Files to create

- `src/pages/ReturnPreview.tsx` — page shell, gating logic
- `src/components/return-preview/EngagementLetterGate.tsx`
- `src/components/return-preview/PreparerCredentialsBanner.tsx`
- `src/components/return-preview/TopLineCard.tsx`
- `src/components/return-preview/ScheduleCard.tsx` — reusable for C, SE, D
- `src/components/return-preview/ConfidenceBadge.tsx`
- `src/components/return-preview/ScenarioPanel.tsx` (Pro-gated)
- `src/components/return-preview/ProPaywallCard.tsx`
- `supabase/functions/compute-return-preview/index.ts`
- Route added to `src/App.tsx` and link added to dashboard sidebar
- Memory file `mem://features/return-preview`

## Out of scope for this build

- Actual state returns (federal only for v1)
- Stripe Pro upgrade flow (the paywall card will link to a placeholder upgrade page; we wire Stripe in a follow-up since you already have `STRIPE_SECRET_KEY` configured)
- Multi-year scenario comparison (single year + YoY delta only)
- Self-serve preparer credential editing UI (you'll seed your own row via admin for v1; UI comes later)

## Technical details

- Engagement letter `version_hash` is a SHA-256 of the scope template string, computed at build time. When you update the template, all existing acknowledgments are auto-invalidated and re-prompted.
- Scenario calc never mutates the base snapshot — base is always derived fresh from source data, scenarios are layered on top in-memory.
- Per-line confidence stored alongside each value so the UI can render the badge without re-deriving.
- `return_snapshots` is written by a daily pg_cron job (we already have the cron infra from quarterly-taxes) so we accumulate the YoY history this feature needs in year two.