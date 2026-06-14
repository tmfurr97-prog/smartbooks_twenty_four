# AI Workload Automation — Build Plan

You approved all 19 features. Building in your requested order, grouped into shippable waves so each one is testable before the next.

## Order of execution

1. **Wave A (foundation, ship first):** #1 Full document extraction, #14 Audit risk score + defense memo generator, #19 Blog/social drafts
2. **Wave B:** #2 Prior-year return ingestion, #3 Bank/credit card statement parser, #4 AI-drafted client replies
3. **Wave C:** #5 Missing-docs emails, #6 Intake interview bot, #7 Meeting prep briefs
4. **Wave D:** #8 Return reviewer, #9 Prior-vs-current diff, #10 Notice/letter responder
5. **Wave E:** #11 Quarterly planning memos, #12 Entity recommendation engine, #13 Bookkeeping cleanup proposals, #15 Year-end loss-harvesting alerts
6. **Wave F:** #16 Client triage dashboard, #17 Time-to-bill auto-tracker, #18 (internal ops polish)

This message implements **Wave A only**. I'll come back with Wave B after you confirm Wave A works.

## Wave A scope

### 1. Full document extraction (#1)
- New edge function `extract-full-document` (Gemini 3 flash, vision input on uploaded file URL).
- Extracts every field from W-2, 1099-NEC/MISC/INT/DIV/B/R/G/K, 1098, 1098-E, 1098-T, K-1, SSA-1099, 1095-A, brokerage composites into a typed JSON schema.
- New table `extracted_document_data` (document_id FK, payer info, amounts, box-level fields as jsonb, confidence, raw_text). RLS: owner + preparer-with-access read; service_role write.
- Auto-runs after upload (call from `analyze-document` once classification ≠ "other"). Stores result; surfaces nothing to the customer UI yet — preparer-only view added in `/dashboard/admin` as a "Extracted fields" panel per document.
- Pre-fills `tax_profiles` numeric fields when confidence ≥ 0.85 (W-2 box 1/2 → wages/withholding, 1099-NEC box 1 → SE income, etc.) so your returns start mostly done.

### 14. Audit risk score + defense memo (à la carte)
- New edge function `generate-audit-defense-memo` — pulls the client's return snapshot + flagged items, produces a 2–3 page memo (issue, IRC cite, facts, position, supporting docs checklist).
- Existing `/dashboard/audit-defense` gains a "Generate defense memo" button (preparer-only OR Pro+ with add-on).
- New table `audit_defense_memos` (user_id, return_year, content_md, generated_at). RLS owner-read, service_role-write.
- **Pricing (your ask):** add à la carte card to `/pricing` — **"Audit Defense Shield — $149/yr or $29 per memo"**. Stored as `addon_audit_defense` flag on `profiles`. Pro/Business tiers list it as "Available add-on"; Starter as "Upgrade required". Stripe wiring deferred to a follow-up (placeholder "Contact to enable" button now, since Stripe products for add-ons aren't set up yet).

### 19. Blog/social drafts
- Extend existing `generate-blog-post` function: add `mode: "social"` that produces 3 LinkedIn posts + 3 X posts + 1 short-form video script per source blog post.
- `/dashboard/blog-admin` gets a "Generate social pack" button per draft; output stored on `blog_posts` as new `social_pack jsonb` column. You copy/paste — no auto-posting.

## Technical details

- All AI calls: existing `LOVABLE_API_KEY` via `https://ai.gateway.lovable.dev/v1/chat/completions`, `google/gemini-3-flash-preview`, tool-calling for structured output. No new secrets.
- Edge functions deploy with `verify_jwt = false` per project default; auth checked in-code (require authenticated user; for memo + extraction also require role = preparer OR document owner).
- Migrations include GRANTs (`authenticated`, `service_role`) per project rules.
- Vocab: "taxx" not "tax" in all new user-facing strings.
- All new preparer-only UI placed under `/dashboard/admin` (existing AdminConsole) as new tabs; no customer-side advertising.
- No em dashes in user-visible copy; high-contrast text.

## Out of scope this wave

Waves B–F (16 remaining features) and live Stripe charging of the audit add-on. I'll do those next once you confirm Wave A.
