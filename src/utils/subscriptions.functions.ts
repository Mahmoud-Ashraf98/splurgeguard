import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "@/db/d1-client";
import { subscriptions } from "@/db/schema";

const subscriptionInputSchema = z.object({
  name: z.string().min(1).max(100),
  amountCents: z.number().int().positive(),
  billingCycle: z.enum(["monthly", "yearly"]),
  nextBillingDate: z.string().datetime(),
});

const updateSubscriptionInputSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string().min(1).max(100).optional(),
    amountCents: z.number().int().positive().optional(),
    billingCycle: z.enum(["monthly", "yearly"]).optional(),
    nextBillingDate: z.string().datetime().optional(),
  })
  .refine(
    (d) => d.name !== undefined || d.amountCents !== undefined || d.billingCycle !== undefined || d.nextBillingDate !== undefined,
    { message: "At least one field to update is required" },
  );

function mapRow(row: typeof subscriptions.$inferSelect) {
  return {
    id: row.id,
    name: row.name,
    amountCents: row.amountCents,
    billingCycle: row.billingCycle,
    nextBillingDate: row.nextBillingDate,
    isActive: row.isActive,
    createdAt: row.createdAt,
  };
}

export const getSubscriptions = createServerFn({ method: "GET" }).handler(async () => {
  const db = getDb();
  if (!db) return [];
  const rows = await db.select().from(subscriptions).where(eq(subscriptions.isActive, true));
  return rows.map(mapRow);
});

export const createSubscription = createServerFn({ method: "POST" })
  .inputValidator(subscriptionInputSchema)
  .handler(async ({ data }) => {
    const db = getDb();
    if (!db) throw new Error("Database is not configured");
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    await db.insert(subscriptions).values({
      ...data,
      id,
      isActive: true,
      createdAt,
    });
    return { id };
  });

export const updateSubscription = createServerFn({ method: "POST" })
  .inputValidator(updateSubscriptionInputSchema)
  .handler(async ({ data }) => {
    const db = getDb();
    if (!db) throw new Error("Database is not configured");
    const { id, name, amountCents, billingCycle, nextBillingDate } = data;
    const updates: {
      name?: string;
      amountCents?: number;
      billingCycle?: "monthly" | "yearly";
      nextBillingDate?: string;
    } = {};
    if (name !== undefined) updates.name = name;
    if (amountCents !== undefined) updates.amountCents = amountCents;
    if (billingCycle !== undefined) updates.billingCycle = billingCycle;
    if (nextBillingDate !== undefined) updates.nextBillingDate = nextBillingDate;
    if (Object.keys(updates).length === 0) return;
    await db.update(subscriptions).set(updates).where(eq(subscriptions.id, id));
  });

export const deleteSubscription = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }) => {
    const db = getDb();
    if (!db) throw new Error("Database is not configured");
    await db.update(subscriptions).set({ isActive: false }).where(eq(subscriptions.id, data.id));
  });
