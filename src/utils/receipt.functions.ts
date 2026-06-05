import { createServerFn } from "@tanstack/react-start";
import { getStartContext } from "@tanstack/start-storage-context";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import { ALL_CATEGORIES } from "@/lib/splurge-types";
import { TRANSACTION_EXTRACTION_SYSTEM_PROMPT } from "@/lib/transaction-extraction-agent-prompt";

/**
 * Reads the ANTHROPIC_API_KEY from the Cloudflare Worker env, which is exposed on
 * the Start context exactly like the `DB` binding (see src/db/d1-client.ts).
 * Returns null when not configured so callers can degrade gracefully.
 */
function getAnthropicKey(): string | null {
  const startCtx = getStartContext({ throwIfNotFound: false }) as
    | { contextAfterGlobalMiddlewares?: { ANTHROPIC_API_KEY?: string } }
    | undefined;
  return startCtx?.contextAfterGlobalMiddlewares?.ANTHROPIC_API_KEY ?? null;
}

const receiptInputSchema = z.object({
  // Raw base64 (no data: URL prefix). Capped to ~7MB of base64 (~5MB image).
  imageBase64: z.string().min(1).max(7_000_000),
  mediaType: z.enum(["image/jpeg", "image/png", "image/webp"]),
});

/** What the model is asked to return, and what we validate before trusting it. */
const extractionSchema = z.object({
  amountVND: z.number().finite(),
  category: z.string(),
  justification: z.string(),
});

/** Shape returned to the client to prefill the review form. */
export interface ReceiptExtraction {
  amountVND: number;
  category: string;
  justification: string;
}

/** JSON schema handed to Claude's structured-output mode (guarantees parseable JSON). */
const outputJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    amountVND: {
      type: "integer",
      description:
        "Total amount actually paid, in Vietnamese Dong (VND), as a plain integer (no separators). If the receipt is in another currency, convert to an approximate VND total; otherwise use the printed VND grand total.",
    },
    category: {
      type: "string",
      enum: ALL_CATEGORIES,
      description: "The single best-matching category from the allowed list.",
    },
    justification: {
      type: "string",
      description:
        "A short human note: merchant name and what was bought, e.g. 'Circle K — snacks & drink'. Aim for 5–80 characters.",
    },
  },
  required: ["amountVND", "category", "justification"],
} as const;

export const extractReceipt = createServerFn({ method: "POST" })
  .inputValidator(receiptInputSchema)
  .handler(async ({ data }): Promise<ReceiptExtraction> => {
    const apiKey = getAnthropicKey();
    if (!apiKey) {
      throw new Error("AI receipt scanning is not configured.");
    }

    const client = new Anthropic({ apiKey });

    const system = `${TRANSACTION_EXTRACTION_SYSTEM_PROMPT}

---

You are reading a PHOTO OF A RECEIPT for a personal-spending tracker.

- Output the grand total actually paid, as an integer number of Vietnamese Dong (VND) in "amountVND".
- "category" MUST be exactly one of these allowed values:
${ALL_CATEGORIES.map((c) => `  - ${c}`).join("\n")}
  Pick the closest fit. When unsure between essentials and splurges, prefer the more specific essential category for groceries/utilities/medical, otherwise "Other Splurges".
- "justification" is a short note naming the merchant and what was bought.
- If the image is not a readable receipt, still return your best guess with a low amount and justification "Unclear receipt — please review".`;

    const message = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 1024,
      system,
      output_config: {
        format: { type: "json_schema", schema: outputJsonSchema as Record<string, unknown> },
      },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: data.mediaType, data: data.imageBase64 },
            },
            {
              type: "text",
              text: "Extract the transaction from this receipt. Return only the structured fields.",
            },
          ],
        },
      ],
    });

    const text = message.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("")
      .trim();

    let parsed: z.infer<typeof extractionSchema>;
    try {
      parsed = extractionSchema.parse(JSON.parse(text));
    } catch {
      throw new Error("Could not read the receipt. Try a clearer photo, or log it manually.");
    }

    // Clamp the amount to a sane positive integer; never trust the model blindly.
    const amountVND = Math.max(0, Math.round(parsed.amountVND));
    const category = ALL_CATEGORIES.includes(parsed.category) ? parsed.category : "Other Splurges";
    const justification = parsed.justification.trim().slice(0, 120);

    return { amountVND, category, justification };
  });
