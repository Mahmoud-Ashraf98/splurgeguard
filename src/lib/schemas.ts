import { z } from "zod";

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
