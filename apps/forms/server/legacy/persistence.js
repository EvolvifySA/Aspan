import { randomUUID } from "node:crypto";
import { pool } from "../db.js";
import { runMigrations } from "../migrate.js";

const REQUEST_COLUMNS = [
  "id", "nome_solicitante", "email_solicitante", "grau_parentesco",
  "grau_parentesco_outro", "endereco", "cidade", "estado", "telefone_contato",
  "nome_idoso", "idade_idoso", "genero_idoso", "estado_conjugal", "doencas",
  "doenca_outro", "nivel_orientacao", "mobilidade", "avaliacao_abvd",
  "avaliacao_aivd", "medicacoes", "interdicao", "procuracao", "familiares",
  "fonte_renda", "renda_mensal_faixa", "renda_mensal_outro", "historico_lar",
  "detalhes_historico_lar", "grau_classificacao", "situacao", "observacao",
  "usuario_alteracao", "data_alteracao", "origem", "necessita_revisao",
  "avisos_migracao", "legacy_import_row_id", "legacy_source_sheet",
  "legacy_source_row", "created_at", "updated_at",
];

function requestValues(record, requestId, legacyRowId) {
  const data = record.data;
  return [
    requestId,
    data.nome_solicitante,
    data.email_solicitante,
    data.grau_parentesco,
    data.grau_parentesco_outro,
    data.endereco,
    data.cidade,
    data.estado,
    data.telefone_contato,
    data.nome_idoso,
    data.idade_idoso,
    data.genero_idoso,
    data.estado_conjugal,
    JSON.stringify(data.doencas),
    data.doenca_outro,
    data.nivel_orientacao,
    data.mobilidade,
    JSON.stringify(data.avaliacao_abvd),
    JSON.stringify(data.avaliacao_aivd),
    data.medicacoes,
    data.interdicao,
    data.procuracao,
    data.familiares,
    data.fonte_renda,
    data.renda_mensal_faixa,
    data.renda_mensal_outro,
    data.historico_lar,
    data.detalhes_historico_lar,
    data.grau_classificacao,
    data.situacao,
    data.observacao,
    data.usuario_alteracao,
    data.data_alteracao,
    data.origem,
    record.needsReview,
    JSON.stringify(record.warnings),
    legacyRowId,
    record.sourceSheet,
    record.sourceRow,
    data.createdAt,
    data.updatedAt,
  ];
}

export async function applyLegacyImport({ fileName, fileSha256, records, summary }) {
  await runMigrations();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const existing = await client.query(
      "SELECT id, status FROM legacy_import_batches WHERE file_sha256 = $1 FOR UPDATE",
      [fileSha256],
    );

    if (existing.rows[0]?.status === "completed") {
      await client.query("ROLLBACK");
      return { batchId: existing.rows[0].id, alreadyImported: true, summary };
    }

    const batchId = existing.rows[0]?.id || randomUUID();
    if (existing.rows[0]) {
      await client.query(
        `UPDATE legacy_import_batches
         SET status = 'running', rolled_back_at = NULL, started_at = now()
         WHERE id = $1`,
        [batchId],
      );
    } else {
      await client.query(
        `INSERT INTO legacy_import_batches (
           id, source_filename, file_sha256, status, total_rows, review_rows, skipped_rows, summary
         ) VALUES ($1, $2, $3, 'running', $4, $5, $6, $7::jsonb)`,
        [batchId, fileName, fileSha256, records.length, summary.reviewRows,
          summary.skippedEmpty, JSON.stringify(summary)],
      );
    }

    const insertRequestSql = `
      INSERT INTO solicitacoes_vaga (${REQUEST_COLUMNS.map((column) => `"${column}"`).join(", ")})
      VALUES (${REQUEST_COLUMNS.map((_, index) => `$${index + 1}`).join(", ")})
    `;

    for (const record of records) {
      const legacyRow = await client.query(
        `INSERT INTO legacy_import_rows (
           id, batch_id, source_sheet, source_row, style_color,
           raw_data, normalized_data, warnings, target_solicitacao_id
         ) VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8::jsonb, NULL)
         ON CONFLICT (batch_id, source_sheet, source_row)
         DO UPDATE SET style_color = EXCLUDED.style_color, raw_data = EXCLUDED.raw_data,
           normalized_data = EXCLUDED.normalized_data, warnings = EXCLUDED.warnings,
           target_solicitacao_id = NULL
         RETURNING id`,
        [randomUUID(), batchId, record.sourceSheet, record.sourceRow, record.styleColor,
          JSON.stringify(record.rawData), JSON.stringify(record.data),
          JSON.stringify(record.warnings)],
      );
      const legacyRowId = legacyRow.rows[0].id;
      const requestId = randomUUID();
      await client.query(insertRequestSql, requestValues(record, requestId, legacyRowId));
      await client.query(
        "UPDATE legacy_import_rows SET target_solicitacao_id = $2 WHERE id = $1",
        [legacyRowId, requestId],
      );
    }

    await client.query(
      `UPDATE legacy_import_batches
       SET status = 'completed', imported_rows = $2, total_rows = $2,
           review_rows = $3, skipped_rows = $4, summary = $5::jsonb,
           completed_at = now()
       WHERE id = $1`,
      [batchId, records.length, summary.reviewRows, summary.skippedEmpty,
        JSON.stringify(summary)],
    );
    await client.query("COMMIT");
    return { batchId, alreadyImported: false, summary };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function rollbackLegacyImport(batchId) {
  await runMigrations();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const batch = await client.query(
      "SELECT id, status FROM legacy_import_batches WHERE id = $1 FOR UPDATE",
      [batchId],
    );
    if (!batch.rows[0]) throw new Error("Lote de importacao nao encontrado.");
    if (batch.rows[0].status === "rolled_back") {
      await client.query("ROLLBACK");
      return { batchId, alreadyRolledBack: true, deletedRows: 0 };
    }

    const deleted = await client.query(
      `DELETE FROM solicitacoes_vaga
       WHERE legacy_import_row_id IN (
         SELECT id FROM legacy_import_rows WHERE batch_id = $1
       )`,
      [batchId],
    );
    await client.query(
      "UPDATE legacy_import_rows SET target_solicitacao_id = NULL WHERE batch_id = $1",
      [batchId],
    );
    await client.query(
      `UPDATE legacy_import_batches
       SET status = 'rolled_back', rolled_back_at = now(), completed_at = NULL,
           imported_rows = 0 WHERE id = $1`,
      [batchId],
    );
    await client.query("COMMIT");
    return { batchId, alreadyRolledBack: false, deletedRows: deleted.rowCount };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

