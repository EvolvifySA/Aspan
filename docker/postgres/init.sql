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
  "nome_solicitante" text NOT NULL,
  "email_solicitante" text NOT NULL UNIQUE,
  "grau_parentesco" text NOT NULL,
  "grau_parentesco_outro" text,
  "endereco" text NOT NULL,
  "cidade" text NOT NULL,
  "estado" text NOT NULL,
  "telefone_contato" text NOT NULL,
  "nome_idoso" text NOT NULL,
  "idade_idoso" integer NOT NULL,
  "genero_idoso" text,
  "estado_conjugal" text,
  "doencas" jsonb NOT NULL,
  "doenca_outro" text,
  "nivel_orientacao" text,
  "mobilidade" text NOT NULL,
  "avaliacao_abvd" jsonb NOT NULL,
  "avaliacao_aivd" jsonb NOT NULL,
  "medicacoes" text NOT NULL,
  "interdicao" boolean NOT NULL DEFAULT false,
  "procuracao" boolean NOT NULL DEFAULT false,
  "familiares" text,
  "fonte_renda" text,
  "renda_mensal_faixa" text,
  "renda_mensal_outro" text,
  "historico_lar" boolean NOT NULL DEFAULT false,
  "detalhes_historico_lar" text,
  "grau_classificacao" integer NOT NULL,
  "situacao" text NOT NULL DEFAULT 'Esperando atendimento',
  "observacao" text,
  "usuario_alteracao" text,
  "data_alteracao" timestamp,
  "created_at" timestamp NOT NULL DEFAULT now(),
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "solicitacoes_vaga_situacao_idx"
  ON "solicitacoes_vaga"("situacao");

CREATE INDEX IF NOT EXISTS "solicitacoes_vaga_grau_classificacao_idx"
  ON "solicitacoes_vaga"("grau_classificacao");

CREATE INDEX IF NOT EXISTS "solicitacoes_vaga_created_at_idx"
  ON "solicitacoes_vaga"("created_at");
