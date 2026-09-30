CREATE TABLE IF NOT EXISTS "donations" (
  "id" text PRIMARY KEY,
  "amount" numeric(12, 2) NOT NULL,
  "net_amount" numeric(12, 2) NOT NULL DEFAULT 0,
  "donor_name" text,
  "donor_phone" text,
  "external_reference" text NOT NULL UNIQUE,
  "mercadopago_order_id" text UNIQUE,
  "checkout_url" text,
  "status" text NOT NULL DEFAULT 'creating',
  "status_detail" text,
  "paid_at" timestamp,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "donations_status_created_at_idx"
  ON "donations"("status", "created_at" DESC);
CREATE INDEX IF NOT EXISTS "donations_external_reference_idx"
  ON "donations"("external_reference");

CREATE TABLE IF NOT EXISTS "mercadopago_connection" (
  "id" integer PRIMARY KEY CHECK ("id" = 1),
  "seller_id" text NOT NULL,
  "access_token_encrypted" text NOT NULL,
  "refresh_token_encrypted" text NOT NULL,
  "expires_at" timestamp NOT NULL,
  "connected_by" text NOT NULL,
  "connected_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "mercadopago_oauth_states" (
  "state_hash" text PRIMARY KEY,
  "code_verifier" text NOT NULL,
  "user_id" text NOT NULL,
  "expires_at" timestamp NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "mercadopago_oauth_states_expires_at_idx"
  ON "mercadopago_oauth_states"("expires_at");
