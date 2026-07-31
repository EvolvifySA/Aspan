import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import pg from "pg";
import { z } from "zod";
import {
  ABVD_FIELDS,
  AIVD_FIELDS,
  calcularGrauClassificacao,
  defaultSituacaoFromGrau,
  DOENCAS_OPTIONS,
  ESTADO_CONJUGAL_OPTIONS,
  FONTE_RENDA_OPTIONS,
  FUNCIONALIDADE_OPTIONS,
  GENERO_IDOSO_OPTIONS,
  GRAU_PARENTESCO_OPTIONS,
  hasDemenciaOuAlzheimer,
  MOBILIDADE_OPTIONS,
  NIVEL_ORIENTACAO_OPTIONS,
  RENDA_MENSAL_OPTIONS,
  SITUACAO_OPTIONS,
} from "../shared/solicitacao.js";

const { Pool } = pg;
const app = express();
const PORT = Number(process.env.PORT || 3001);
const AUTH_INTERNAL_URL =
  process.env.BETTER_AUTH_INTERNAL_URL ||
  process.env.BETTER_AUTH_URL ||
  "http://localhost:3000";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
    ],
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

const solicitacaoFields = `
  id,
  nome_solicitante,
  email_solicitante,
  grau_parentesco,
  grau_parentesco_outro,
  endereco,
  cidade,
  estado,
  telefone_contato,
  nome_idoso,
  idade_idoso,
  genero_idoso,
  estado_conjugal,
  doencas,
  doenca_outro,
  nivel_orientacao,
  mobilidade,
  avaliacao_abvd,
  avaliacao_aivd,
  medicacoes,
  interdicao,
  procuracao,
  familiares,
  fonte_renda,
  renda_mensal_faixa,
  renda_mensal_outro,
  historico_lar,
  detalhes_historico_lar,
  grau_classificacao,
  situacao,
  observacao,
  usuario_alteracao,
  data_alteracao,
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

function optionalTextSchema() {
  return z.preprocess((value) => {
    if (value === null || value === undefined || value === "") return undefined;
    return value;
  }, z.string().trim().optional().nullable());
}

function optionalEnumSchema(options) {
  return z.preprocess((value) => {
    if (value === null || value === undefined || value === "") return undefined;
    return value;
  }, z.enum(options).optional().nullable());
}

function createFunctionalAssessmentSchema(fields) {
  return z.object(
    Object.fromEntries(
      fields.map((field) => [field.key, z.enum(FUNCIONALIDADE_OPTIONS)]),
    ),
  );
}

const abvdSchema = createFunctionalAssessmentSchema(ABVD_FIELDS);
const aivdSchema = createFunctionalAssessmentSchema(AIVD_FIELDS);

const solicitacaoCreateSchema = z
  .object({
    nome_solicitante: z.string().trim().min(1),
    email_solicitante: z.string().trim().email(),
    grau_parentesco: z.enum(GRAU_PARENTESCO_OPTIONS),
    grau_parentesco_outro: optionalTextSchema(),
    endereco: z.string().trim().min(1),
    cidade: z.string().trim().min(1),
    estado: z.string().trim().min(1),
    telefone_contato: z.string().trim().min(1),
    nome_idoso: z.string().trim().min(1),
    idade_idoso: z.coerce.number().int().positive(),
    genero_idoso: optionalEnumSchema(GENERO_IDOSO_OPTIONS),
    estado_conjugal: optionalEnumSchema(ESTADO_CONJUGAL_OPTIONS),
    doencas: z.array(z.enum(DOENCAS_OPTIONS)).default([]),
    doenca_outro: optionalTextSchema(),
    nivel_orientacao: optionalEnumSchema(NIVEL_ORIENTACAO_OPTIONS),
    mobilidade: z.enum(MOBILIDADE_OPTIONS),
    avaliacao_abvd: abvdSchema,
    avaliacao_aivd: aivdSchema,
    medicacoes: z.string().trim().min(1),
    interdicao: z.boolean().default(false),
    procuracao: z.boolean().default(false),
    familiares: optionalTextSchema(),
    fonte_renda: optionalEnumSchema(FONTE_RENDA_OPTIONS),
    renda_mensal_faixa: z.enum(RENDA_MENSAL_OPTIONS),
    renda_mensal_outro: optionalTextSchema(),
    historico_lar: z.boolean().default(false),
    detalhes_historico_lar: optionalTextSchema(),
    observacao: optionalTextSchema(),
  })
  .superRefine((value, ctx) => {
    if (value.grau_parentesco === "Outros" && !value.grau_parentesco_outro) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["grau_parentesco_outro"],
        message: "Informe o grau de parentesco quando selecionar Outros.",
      });
    }

    if (value.doencas.includes("Outro") && !value.doenca_outro) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["doenca_outro"],
        message: "Informe qual doenca quando selecionar Outro.",
      });
    }

    if (value.renda_mensal_faixa === "Outro" && !value.renda_mensal_outro) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["renda_mensal_outro"],
        message: "Informe a renda mensal quando selecionar Outro.",
      });
    }

    if (hasDemenciaOuAlzheimer(value) && !value.nivel_orientacao) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["nivel_orientacao"],
        message:
          "Nivel de orientacao e obrigatorio quando Demencia ou Alzheimer estiver marcado.",
      });
    }
  });

const solicitacaoUpdateSchema = z.object({
  situacao: z.enum(SITUACAO_OPTIONS),
  grau_classificacao: z.coerce.number().int().min(1).max(3),
  observacao: optionalTextSchema(),
});

function normalizeOptionalString(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  return String(value);
}

function serializeSolicitacao(record) {
  return {
    ...record,
    doencas: Array.isArray(record.doencas) ? record.doencas : [],
    avaliacao_abvd:
      record.avaliacao_abvd &&
      typeof record.avaliacao_abvd === "object" &&
      !Array.isArray(record.avaliacao_abvd)
        ? record.avaliacao_abvd
        : {},
    avaliacao_aivd:
      record.avaliacao_aivd &&
      typeof record.avaliacao_aivd === "object" &&
      !Array.isArray(record.avaliacao_aivd)
        ? record.avaliacao_aivd
        : {},
  };
}

async function getCurrentAdmin(req) {
  const cookie = req.headers.cookie;
  if (!cookie) return null;

  const response = await fetch(`${AUTH_INTERNAL_URL}/api/auth/get-session`, {
    headers: { cookie },
  });

  if (!response.ok) return null;

  const session = await response.json();
  return session?.user ? session.user : null;
}

async function requireAdmin(req, res, next) {
  const user = await getCurrentAdmin(req);
  if (!user) {
    return res.status(401).json({ message: "Admin authentication required" });
  }

  req.adminUser = user;
  return next();
}

app.get("/api/health", (_, res) => {
  res.json({ ok: true });
});

app.get(
  "/api/forms/auth/me",
  asyncHandler(async (req, res) => {
    const user = await getCurrentAdmin(req);
    if (!user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    return res.json(user);
  }),
);

app.get(
  "/api/forms/solicitacoes",
  requireAdmin,
  asyncHandler(async (_, res) => {
    const { rows } = await pool.query(
      `SELECT ${solicitacaoFields}
       FROM solicitacoes_vaga
       ORDER BY created_at DESC`,
    );

    return res.json(rows.map(serializeSolicitacao));
  }),
);

app.post(
  "/api/forms/solicitacoes",
  asyncHandler(async (req, res) => {
    const data = solicitacaoCreateSchema.parse(req.body);
    const grau = calcularGrauClassificacao(data);
    const situacao = defaultSituacaoFromGrau(grau);
    const now = new Date();

    try {
      const { rows } = await pool.query(
        `INSERT INTO solicitacoes_vaga (
          id,
          nome_solicitante,
          email_solicitante,
          grau_parentesco,
          grau_parentesco_outro,
          endereco,
          cidade,
          estado,
          telefone_contato,
          nome_idoso,
          idade_idoso,
          genero_idoso,
          estado_conjugal,
          doencas,
          doenca_outro,
          nivel_orientacao,
          mobilidade,
          avaliacao_abvd,
          avaliacao_aivd,
          medicacoes,
          interdicao,
          procuracao,
          familiares,
          fonte_renda,
          renda_mensal_faixa,
          renda_mensal_outro,
          historico_lar,
          detalhes_historico_lar,
          grau_classificacao,
          situacao,
          observacao,
          usuario_alteracao,
          data_alteracao,
          created_at,
          updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
          $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
          $31, $32, $33, $34, $35
        )
        RETURNING ${solicitacaoFields}`,
        [
          randomUUID(),
          data.nome_solicitante,
          data.email_solicitante,
          data.grau_parentesco,
          normalizeOptionalString(data.grau_parentesco_outro),
          data.endereco,
          data.cidade,
          data.estado,
          data.telefone_contato,
          data.nome_idoso,
          data.idade_idoso,
          normalizeOptionalString(data.genero_idoso),
          normalizeOptionalString(data.estado_conjugal),
          JSON.stringify(data.doencas),
          normalizeOptionalString(data.doenca_outro),
          normalizeOptionalString(data.nivel_orientacao),
          data.mobilidade,
          JSON.stringify(data.avaliacao_abvd),
          JSON.stringify(data.avaliacao_aivd),
          data.medicacoes,
          data.interdicao,
          data.procuracao,
          normalizeOptionalString(data.familiares),
          normalizeOptionalString(data.fonte_renda),
          data.renda_mensal_faixa,
          normalizeOptionalString(data.renda_mensal_outro),
          data.historico_lar,
          normalizeOptionalString(data.detalhes_historico_lar),
          grau,
          situacao,
          normalizeOptionalString(data.observacao),
          "Solicitacao publica",
          now,
          now,
          now,
        ],
      );

      return res.status(201).json(serializeSolicitacao(rows[0]));
    } catch (error) {
      if (error?.code === "23505") {
        return res
          .status(409)
          .json({ message: "Ja existe uma solicitacao com este e-mail." });
      }

      throw error;
    }
  }),
);

app.put(
  "/api/forms/solicitacoes/:id",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const data = solicitacaoUpdateSchema.parse(req.body);

    const { rows } = await pool.query(
      `UPDATE solicitacoes_vaga
       SET situacao = $2,
           grau_classificacao = $3,
           observacao = $4,
           usuario_alteracao = $5,
           data_alteracao = $6,
           updated_at = $6
       WHERE id = $1
       RETURNING ${solicitacaoFields}`,
      [
        id,
        data.situacao,
        data.grau_classificacao,
        normalizeOptionalString(data.observacao),
        req.adminUser.name || req.adminUser.email || "Administrador",
        new Date(),
      ],
    );

    if (!rows[0]) {
      return res.status(404).json({ message: "Record not found" });
    }

    return res.json(serializeSolicitacao(rows[0]));
  }),
);

app.delete(
  "/api/forms/solicitacoes/:id",
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM solicitacoes_vaga WHERE id = $1", [
      id,
    ]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Record not found" });
    }

    return res.status(204).end();
  }),
);

app.use((error, req, res, next) => {
  if (error instanceof z.ZodError) {
    return res.status(400).json({
      message: "Validation failed",
      issues: error.issues,
    });
  }

  console.error(error);
  return res.status(500).json({ message: "Internal server error" });
});

const distPath = path.resolve(process.cwd(), "dist");

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get(/^(?!\/api).*/, (_, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`ASPAN Forms running on http://localhost:${PORT}`);
});
