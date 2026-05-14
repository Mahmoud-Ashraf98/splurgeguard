import { z } from "zod";

/** transaction_metadata shape — source of truth for agent + client */
const transactionMetadataRecurringSchema = z
  .object({
    is_recurring_subscription: z.literal(true),
  })
  .strict();

const transactionMetadataNonRecurringSchema = z
  .object({
    is_recurring_subscription: z.literal(false),
    amortization_schedule: z
      .object({
        spread_days: z.number().int().positive(),
        amortization_start_date: z.string().datetime({ offset: true }),
      })
      .optional(),
  })
  .strict();

export const transactionMetadataSchema = z.discriminatedUnion("is_recurring_subscription", [
  transactionMetadataRecurringSchema,
  transactionMetadataNonRecurringSchema,
]);

export type TransactionMetadata = z.infer<typeof transactionMetadataSchema>;

export const subscriptionSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  amountCents: z.number().int().positive(),
  billingCycle: z.enum(["monthly", "yearly"]),
  nextBillingDate: z.string().datetime(),
  isActive: z.boolean(),
  createdAt: z.string().min(1),
});

export type Subscription = z.infer<typeof subscriptionSchema>;

export interface SubscriptionViewModel extends Subscription {
  monthlyEquivalentCents: number;
  dailyDrainCents: number;
}
