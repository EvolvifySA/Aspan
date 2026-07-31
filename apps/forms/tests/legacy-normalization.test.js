import test from "node:test";
import assert from "node:assert/strict";
import {
  createMunicipalityIndex,
  normalizeDiseases,
  normalizeEmail,
  normalizeLocation,
  normalizePhones,
  parseAge,
  statusFromColor,
} from "../server/legacy/normalization.js";

test("normaliza e valida e-mail sem inventar valores", () => {
  assert.deepEqual(normalizeEmail(" PESSOA@EXEMPLO.COM "), {
    value: "pessoa@exemplo.com",
    warning: null,
  });
  assert.equal(normalizeEmail("email-invalido").warning, "email_invalido");
  assert.equal(normalizeEmail("").warning, "email_ausente");
});

test("recupera telefone numerico e infere DDD informado", () => {
  assert.equal(normalizePhones(5583999991111).primary, "(83) 99999-1111");
  const inferred = normalizePhones(999991111, { defaultAreaCode: "83" });
  assert.equal(inferred.primary, "(83) 99999-1111");
  assert.ok(inferred.warnings.includes("telefone_ddd_inferido"));
});

test("preserva telefones adicionais", () => {
  const phones = normalizePhones("(83) 99999-1111 - (83) 98888-2222");
  assert.equal(phones.primary, "(83) 99999-1111");
  assert.deepEqual(phones.additional, ["(83) 98888-2222"]);
  assert.ok(phones.warnings.includes("telefones_multiplos"));
});

test("interpreta idade simples e data de nascimento", () => {
  assert.equal(parseAge("80 anos", new Date("2025-01-01")).value, 80);
  assert.equal(parseAge("01/01/1950", new Date("2025-06-01")).value, 75);
  assert.equal(parseAge("89 e 85 respectivamente", new Date("2025-01-01")).warning, "idade_ambigua");
});

test("mapeia cores da legenda sem adivinhar cores desconhecidas", () => {
  assert.equal(statusFromColor("FFFF0000").value, "Nao acolhimento");
  assert.equal(statusFromColor("FF93C47D").value, "Agendado entrevista");
  assert.equal(statusFromColor(null).value, "Esperando atendimento");
  assert.equal(statusFromColor("FFC27BA0").warning, "status_cor_ambigua");
});

test("normaliza doencas e conserva texto livre", () => {
  const result = normalizeDiseases("Hipertensao, Demencia ou Alzheimer, Doenca rara");
  assert.deepEqual(result.values, ["Hipertensao", "Demencia ou Alzheimer", "Outro"]);
  assert.equal(result.other, "Doenca rara");
});

test("separa cidade e UF com indice de municipios", () => {
  const index = createMunicipalityIndex([
    { nome: "Joao Pessoa", uf: "PB" },
    { nome: "Recife", uf: "PE" },
  ]);
  assert.deepEqual(normalizeLocation("Joao Pessoa - Paraiba", index), {
    city: "Joao Pessoa",
    state: "PB",
    warnings: [],
  });
  assert.ok(normalizeLocation("Somente PB", index).warnings.includes("cidade_nao_identificada"));
});

