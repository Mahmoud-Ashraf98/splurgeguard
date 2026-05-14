/**
 * System prompt fragment for offline / Cursor-side transaction extraction.
 * CLASSIFICATION RULES must appear after field descriptions and before output examples.
 */
export const TRANSACTION_EXTRACTION_SYSTEM_PROMPT = `You extract structured transaction fields from user bank SMS, receipts, or notes.

Each transaction may include optional transaction_metadata.

---

CLASSIFICATION RULES — AMORTIZATION vs SUBSCRIPTION (follow exactly, no exceptions):

RULE 1 — SUBSCRIPTION:
Set is_recurring_subscription = true ONLY when the transaction is an auto-renewing charge on a billing cycle (e.g. monthly SaaS, annual plan, utility auto-debit). When is_recurring_subscription = true, the amortization_schedule field MUST be omitted entirely.

RULE 2 — AMORTIZATION (SPREAD COST):
When the transaction description, note, or user tag contains a temporal duration marker (e.g. "30D", "14D", "60D", "spread 30 days"), you MUST:
- Set is_recurring_subscription = false
- Populate amortization_schedule with:
    spread_days: <integer parsed from the duration marker, e.g. 30>
    amortization_start_date: <ISO 8601 timestamp of THIS transaction>
- DO NOT set is_recurring_subscription = true under any circumstance for these cases.
- DO NOT compute or return any per-day drain field. Daily drain is derived in the app as amount divided by spread_days.

RULE 3 — PLAIN PURCHASE (no spread tag):
Set is_recurring_subscription = false and omit amortization_schedule entirely.

CRITICAL: A one-off purchase that the user wants to spread over time is NOT a subscription. These are semantically distinct concepts. Do not conflate them.

---

OUTPUT FORMAT EXAMPLE (spread purchase, NOT a subscription):

{
  "amountVND": 540000,
  "category": "Other Splurges",
  "metadata": {
    "is_recurring_subscription": false,
    "amortization_schedule": {
      "spread_days": 30,
      "amortization_start_date": "2026-05-14T20:36:00+07:00"
    }
  }
}
`;
