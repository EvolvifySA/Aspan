CREATE TABLE IF NOT EXISTS "user" (
  "id" text PRIMARY KEY,
  "name" text NOT NULL,
  "email" text NOT NULL UNIQUE,
  "emailVerified" boolean NOT NULL DEFAULT false,
  "image" text,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "session" (
  "id" text PRIMARY KEY,
  "expiresAt" timestamp NOT NULL,
  "token" text NOT NULL UNIQUE,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now(),
  "ipAddress" text,
  "userAgent" text,
  "userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "account" (
  "id" text PRIMARY KEY,
  "accountId" text NOT NULL,
  "providerId" text NOT NULL,
  "userId" text NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "accessToken" text,
  "refreshToken" text,
  "idToken" text,
  "accessTokenExpiresAt" timestamp,
  "refreshTokenExpiresAt" timestamp,
  "scope" text,
  "password" text,
  "createdAt" timestamp NOT NULL DEFAULT now(),
  "updatedAt" timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "verification" (
  "id" text PRIMARY KEY,
  "identifier" text NOT NULL,
  "value" text NOT NULL,
  "expiresAt" timestamp NOT NULL,
  "createdAt" timestamp DEFAULT now(),
  "updatedAt" timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "posts" (
  "id" serial PRIMARY KEY,
  "userId" text NOT NULL,
  "imageUrl" text NOT NULL,
  "imageUrls" jsonb,
  "caption" text NOT NULL DEFAULT '',
  "createdAt" timestamp NOT NULL DEFAULT now()
);

-- Optional seed: descomente se quiser um usuário admin inicial.
-- INSERT INTO "user" ("id", "name", "email", "emailVerified")
-- VALUES ('admin-seed', 'Admin ASPAN', 'admin@aspan.org.br', true)
-- ON CONFLICT ("email") DO NOTHING;

CREATE TABLE IF NOT EXISTS "transparency_documents" (
  "id" serial PRIMARY KEY,
  "title" text NOT NULL,
  "reference_month" text NOT NULL,
  "file_url" text NOT NULL,
  "original_filename" text NOT NULL,
  "file_size" integer NOT NULL,
  "uploaded_by" text NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "transparency_documents_reference_month_idx"
  ON "transparency_documents"("reference_month");

CREATE INDEX IF NOT EXISTS "transparency_documents_created_at_idx"
  ON "transparency_documents"("created_at");

CREATE TABLE IF NOT EXISTS "solicitacoes_vaga" (
  "id" text PRIMARY KEY,
  "nome_solicitante" text,
  "email_solicitante" text,
  "grau_parentesco" text,
  "grau_parentesco_outro" text,
  "endereco" text,
  "cidade" text,
  "estado" text,
  "telefone_contato" text,
  "nome_idoso" text,
  "idade_idoso" integer,
  "genero_idoso" text,
  "estado_conjugal" text,
  "doencas" jsonb NOT NULL,
  "doenca_outro" text,
  "nivel_orientacao" text,
  "mobilidade" text,
  "avaliacao_abvd" jsonb NOT NULL,
  "avaliacao_aivd" jsonb NOT NULL,
  "medicacoes" text NOT NULL,
  "interdicao" boolean,
  "procuracao" boolean,
  "familiares" text,
  "fonte_renda" text,
  "renda_mensal_faixa" text,
  "renda_mensal_outro" text,
  "historico_lar" boolean,
  "detalhes_historico_lar" text,
  "grau_classificacao" integer,
  "situacao" text NOT NULL DEFAULT 'Esperando atendimento',
  "observacao" text,
  "usuario_alteracao" text,
  "data_alteracao" timestamp,
  "origem" text NOT NULL DEFAULT 'formulario_atual',
  "necessita_revisao" boolean NOT NULL DEFAULT false,
  "avisos_migracao" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "legacy_import_row_id" text,
  "legacy_source_sheet" text,
  "legacy_source_row" integer,
  "revisao_resolvida_em" timestamp,
  "revisao_resolvida_por" text,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "solicitacoes_vaga_situacao_idx"
  ON "solicitacoes_vaga"("situacao");

CREATE INDEX IF NOT EXISTS "solicitacoes_vaga_grau_classificacao_idx"
  ON "solicitacoes_vaga"("grau_classificacao");

CREATE INDEX IF NOT EXISTS "solicitacoes_vaga_created_at_idx"
  ON "solicitacoes_vaga"("created_at");

CREATE UNIQUE INDEX IF NOT EXISTS "solicitacoes_vaga_email_publico_unique"
  ON "solicitacoes_vaga" (lower("email_solicitante"))
  WHERE "origem" = 'formulario_atual' AND "email_solicitante" IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "solicitacoes_vaga_legacy_import_row_unique"
  ON "solicitacoes_vaga" ("legacy_import_row_id")
  WHERE "legacy_import_row_id" IS NOT NULL;

CREATE INDEX IF NOT EXISTS "solicitacoes_vaga_origem_idx"
  ON "solicitacoes_vaga"("origem");

CREATE INDEX IF NOT EXISTS "solicitacoes_vaga_revisao_idx"
  ON "solicitacoes_vaga"("necessita_revisao");

CREATE TABLE IF NOT EXISTS "legacy_import_batches" (
  "id" text PRIMARY KEY,
  "source_filename" text NOT NULL,
  "file_sha256" text NOT NULL UNIQUE,
  "status" text NOT NULL,
  "total_rows" integer NOT NULL DEFAULT 0,
  "imported_rows" integer NOT NULL DEFAULT 0,
  "review_rows" integer NOT NULL DEFAULT 0,
  "skipped_rows" integer NOT NULL DEFAULT 0,
  "summary" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "started_at" timestamp NOT NULL DEFAULT now(),
  "completed_at" timestamp,
  "rolled_back_at" timestamp
);

CREATE TABLE IF NOT EXISTS "legacy_import_rows" (
  "id" text PRIMARY KEY,
  "batch_id" text NOT NULL REFERENCES "legacy_import_batches"("id") ON DELETE RESTRICT,
  "source_sheet" text NOT NULL,
  "source_row" integer NOT NULL,
  "style_color" text,
  "raw_data" jsonb NOT NULL,
  "normalized_data" jsonb NOT NULL,
  "warnings" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "target_solicitacao_id" text REFERENCES "solicitacoes_vaga"("id") ON DELETE SET NULL,
  "created_at" timestamp NOT NULL DEFAULT now(),
  UNIQUE ("batch_id", "source_sheet", "source_row")
);

CREATE INDEX IF NOT EXISTS "legacy_import_rows_target_idx"
  ON "legacy_import_rows"("target_solicitacao_id");
