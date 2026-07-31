ALTER TABLE solicitacoes_vaga
  DROP CONSTRAINT IF EXISTS solicitacoes_vaga_email_solicitante_key;

ALTER TABLE solicitacoes_vaga
  ALTER COLUMN nome_solicitante DROP NOT NULL,
  ALTER COLUMN email_solicitante DROP NOT NULL,
  ALTER COLUMN grau_parentesco DROP NOT NULL,
  ALTER COLUMN endereco DROP NOT NULL,
  ALTER COLUMN cidade DROP NOT NULL,
  ALTER COLUMN estado DROP NOT NULL,
  ALTER COLUMN telefone_contato DROP NOT NULL,
  ALTER COLUMN nome_idoso DROP NOT NULL,
  ALTER COLUMN idade_idoso DROP NOT NULL,
  ALTER COLUMN mobilidade DROP NOT NULL,
  ALTER COLUMN interdicao DROP NOT NULL,
  ALTER COLUMN procuracao DROP NOT NULL,
  ALTER COLUMN historico_lar DROP NOT NULL,
  ALTER COLUMN grau_classificacao DROP NOT NULL;

ALTER TABLE solicitacoes_vaga
  ADD COLUMN IF NOT EXISTS origem text NOT NULL DEFAULT 'formulario_atual',
  ADD COLUMN IF NOT EXISTS necessita_revisao boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS avisos_migracao jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS legacy_import_row_id text,
  ADD COLUMN IF NOT EXISTS legacy_source_sheet text,
  ADD COLUMN IF NOT EXISTS legacy_source_row integer,
  ADD COLUMN IF NOT EXISTS revisao_resolvida_em timestamp,
  ADD COLUMN IF NOT EXISTS revisao_resolvida_por text;

CREATE UNIQUE INDEX IF NOT EXISTS solicitacoes_vaga_email_publico_unique
  ON solicitacoes_vaga (lower(email_solicitante))
  WHERE origem = 'formulario_atual' AND email_solicitante IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS solicitacoes_vaga_legacy_import_row_unique
  ON solicitacoes_vaga (legacy_import_row_id)
  WHERE legacy_import_row_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS solicitacoes_vaga_origem_idx
  ON solicitacoes_vaga (origem);

CREATE INDEX IF NOT EXISTS solicitacoes_vaga_revisao_idx
  ON solicitacoes_vaga (necessita_revisao);

CREATE TABLE IF NOT EXISTS legacy_import_batches (
  id text PRIMARY KEY,
  source_filename text NOT NULL,
  file_sha256 text NOT NULL UNIQUE,
  status text NOT NULL,
  total_rows integer NOT NULL DEFAULT 0,
  imported_rows integer NOT NULL DEFAULT 0,
  review_rows integer NOT NULL DEFAULT 0,
  skipped_rows integer NOT NULL DEFAULT 0,
  summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  started_at timestamp NOT NULL DEFAULT now(),
  completed_at timestamp,
  rolled_back_at timestamp
);

CREATE TABLE IF NOT EXISTS legacy_import_rows (
  id text PRIMARY KEY,
  batch_id text NOT NULL REFERENCES legacy_import_batches(id) ON DELETE RESTRICT,
  source_sheet text NOT NULL,
  source_row integer NOT NULL,
  style_color text,
  raw_data jsonb NOT NULL,
  normalized_data jsonb NOT NULL,
  warnings jsonb NOT NULL DEFAULT '[]'::jsonb,
  target_solicitacao_id text REFERENCES solicitacoes_vaga(id) ON DELETE SET NULL,
  created_at timestamp NOT NULL DEFAULT now(),
  UNIQUE (batch_id, source_sheet, source_row)
);

CREATE INDEX IF NOT EXISTS legacy_import_rows_target_idx
  ON legacy_import_rows(target_solicitacao_id);

