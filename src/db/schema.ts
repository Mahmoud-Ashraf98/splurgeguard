import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/**
 * Auto-pay subscriptions (D1). Legacy spread-out purchase amortization still lives on
 * `Transaction` rows (`amortizeDays` / `amortizationDays`); do not drop that data.
 */
export const subscriptions = sqliteTable("subscriptions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  amountCents: integer("amount_cents").notNull(),
  billingCycle: text("billing_cycle", { enum: ["monthly", "yearly"] }).notNull(),
  nextBillingDate: text("next_billing_date").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});
