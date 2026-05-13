CREATE TABLE `subscriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`amount_cents` integer NOT NULL,
	`billing_cycle` text NOT NULL,
	`next_billing_date` text NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
INSERT OR IGNORE INTO "subscriptions" ("id", "name", "amount_cents", "billing_cycle", "next_billing_date", "is_active", "created_at") VALUES
	('a0000001-0000-4000-8000-000000000001', 'Netflix', 230000, 'monthly', '2026-06-01T00:00:00.000Z', 1, '2026-05-12T00:00:00.000Z'),
	('a0000002-0000-4000-8000-000000000002', 'GitHub Copilot', 1900000, 'yearly', '2027-05-12T00:00:00.000Z', 1, '2026-05-12T00:00:00.000Z'),
	('a0000003-0000-4000-8000-000000000003', 'iCloud', 59000, 'monthly', '2026-06-15T00:00:00.000Z', 1, '2026-05-12T00:00:00.000Z');
