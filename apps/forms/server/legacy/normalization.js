import {
  DOENCAS_OPTIONS,
} from "../../shared/solicitacao.js";

const STATE_NAMES = {
  ac: "acre",
  al: "alagoas",
  ap: "amapa",
  am: "amazonas",
  ba: "bahia",
  ce: "ceara",
  df: "distrito federal",
  es: "espirito santo",
  go: "goias",
  ma: "maranhao",
  mt: "mato grosso",
  ms: "mato grosso do sul",
  mg: "minas gerais",
  pa: "para",
  pb: "paraiba",
  pr: "parana",
  pe: "pernambuco",
  pi: "piaui",
  rj: "rio de janeiro",
  rn: "rio grande do norte",
  rs: "rio grande do sul",
  ro: "rondonia",
  rr: "roraima",
  sc: "santa catarina",
  sp: "sao paulo",
  se: "sergipe",
  to: "tocantins",
};

const COLOR_STATUS = new Map([
  ...[
    "FFFF0000",
    "FFEA9999",
    "FFF4CCCC",
    "FFDD7E6B",
    "FFE6B8AF",
    "FFCC0000",
  ].map((color) => [color, "Nao acolhimento"]),
  ...["FFFFFF00", "FFFFD966"].map((color) => [color, "Observacoes / Avaliar"]),
  ...[
    "FF999999",
    "FF666666",
    "FF434343",
    "FFB7B7B7",
    "FFD9D9D9",
    "FFCCCCCC",
    "FF000000",
  ].map((color) => [color, "Sem contato / Desistencia"]),
  ...["FFB6D7A8", "FF93C47D", "FF6AA84F", "FF38761D"].map((color) => [
    color,
    "Agendado entrevista",
  ]),
  ...["FF9FC5E8", "FF4A86E8", "FFA4C2F4", "FF6D9EEB", "FF6FA8DC"].map(
    (color) => [color, "Admissao"],
  ),
]);

const DISEASE_LOOKUP = new Map(
  DOENCAS_OPTIONS.map((option) => [normalizeText(option), option]),
);

const REVIEW_WARNING_CODES = new Set([
  "cidade_nao_identificada",
  "conteudo_repetido",
  "email_invalido",
  "email_ausente",
  "estado_nao_identificado",
  "grau_indeterminado",
  "historico_lar_invalido",
  "idade_ambigua",
  "idade_ausente",
  "interdicao_invalida",
  "mesmo_idoso_email",
  "mobilidade_ausente",
  "nome_idoso_ausente",
  "nome_solicitante_ausente",
  "procuracao_invalida",
  "status_cor_ambigua",
  "telefone_invalido",
]);

export function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

export function cleanText(value) {
  const text = String(value ?? "").trim().replace(/\s+/g, " ");
  return text || null;
}

export function normalizeEmail(value) {
  const email = normalizeText(value);
  if (!email) return { value: null, warning: "email_ausente" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { value: null, warning: "email_invalido" };
  }
  return { value: email, warning: null };
}

function numericPhoneText(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value.toFixed(0);
  }
  return String(value ?? "").replace(/[.,]0+$/, "");
}

export function normalizePhones(value, { defaultAreaCode = null } = {}) {
  const raw = numericPhoneText(value);
  if (!raw.trim()) return { primary: null, additional: [], warnings: ["telefone_invalido"] };

  const chunks = raw
    .split(/(?:\s+(?:-|\.|\/|;|,|\bou\b)\s+|\s*(?:\/|;|,|\bou\b)\s*)/i)
    .map((chunk) => chunk.replace(/\D/g, ""))
    .filter(Boolean);

  if (chunks.length === 0) chunks.push(raw.replace(/\D/g, ""));

  const candidates = [];
  let inferredAreaCode = false;
  for (let digits of chunks) {
    if (digits.startsWith("0") && (digits.length === 11 || digits.length === 12)) {
      digits = digits.slice(1);
    }
    if (digits.startsWith("55") && (digits.length === 12 || digits.length === 13)) {
      digits = digits.slice(2);
    }
    if ((digits.length === 8 || digits.length === 9) && defaultAreaCode) {
      digits = `${defaultAreaCode}${digits}`;
      inferredAreaCode = true;
    }
    if (digits.length === 10 || digits.length === 11) candidates.push(digits);
  }

  if (candidates.length === 0) {
    let digits = raw.replace(/\D/g, "");
    if (digits.startsWith("0") && (digits.length === 11 || digits.length === 12)) {
      digits = digits.slice(1);
    }
    if (digits.startsWith("55") && (digits.length === 12 || digits.length === 13)) {
      digits = digits.slice(2);
    }
    if ((digits.length === 8 || digits.length === 9) && defaultAreaCode) {
      digits = `${defaultAreaCode}${digits}`;
      inferredAreaCode = true;
    }
    if (digits.length === 10 || digits.length === 11) candidates.push(digits);
  }

  const unique = [...new Set(candidates)];
  if (unique.length === 0) {
    return { primary: null, additional: [], warnings: ["telefone_invalido"] };
  }

  const format = (digits) =>
    digits.length === 11
      ? `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
      : `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;

  return {
    primary: format(unique[0]),
    additional: unique.slice(1).map(format),
    warnings: [
      ...(unique.length > 1 ? ["telefones_multiplos"] : []),
      ...(inferredAreaCode ? ["telefone_ddd_inferido"] : []),
    ],
  };
}

export function parseAge(value, submittedAt) {
  if (typeof value === "number" && Number.isFinite(value)) {
    const age = Math.round(value);
    return age >= 0 && age <= 120
      ? { value: age, warning: null }
      : { value: null, warning: "idade_ambigua" };
  }

  const text = cleanText(value);
  if (!text) return { value: null, warning: "idade_ausente" };

  const birthDate = text.match(/\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/);
  if (birthDate && submittedAt instanceof Date && !Number.isNaN(submittedAt.valueOf())) {
    const born = new Date(
      Number(birthDate[3]),
      Number(birthDate[2]) - 1,
      Number(birthDate[1]),
    );
    let age = submittedAt.getFullYear() - born.getFullYear();
    const beforeBirthday =
      submittedAt.getMonth() < born.getMonth() ||
      (submittedAt.getMonth() === born.getMonth() && submittedAt.getDate() < born.getDate());
    if (beforeBirthday) age -= 1;
    if (age >= 0 && age <= 120) return { value: age, warning: null };
  }

  const plausible = [...text.matchAll(/\b(\d{2,3})(?:[.,]0+)?\b/g)]
    .map((match) => Number(match[1]))
    .filter((age) => age >= 0 && age <= 120);
  const unique = [...new Set(plausible)];
  if (unique.length === 1) return { value: unique[0], warning: null };
  return { value: null, warning: "idade_ambigua" };
}

export function normalizeRelationship(value) {
  const raw = cleanText(value);
  const text = normalizeText(raw);
  if (!text) return { value: null, other: null };
  if (/\bfilh[oa]\b/.test(text)) return { value: "Filho(a)", other: null };
  if (/\birma[oa]\b/.test(text)) return { value: "Irmao(a)", other: null };
  if (/\bsobrinh[oa]\b/.test(text)) return { value: "Sobrinho(a)", other: null };
  return { value: "Outros", other: raw };
}

export function normalizeGender(value) {
  const text = normalizeText(value);
  if (text === "masculino") return "Masculino";
  if (text === "feminino") return "Feminino";
  return text ? "Outro" : null;
}

export function normalizeMaritalStatus(value) {
  const text = normalizeText(value);
  if (text.startsWith("casad")) return "Casado(a)";
  if (text.startsWith("viuv")) return "Viuvo(a)";
  if (text.startsWith("solteir")) return "Solteiro(a)";
  if (text.startsWith("divorciad")) return "Divorciado(a)";
  return text ? "Outro" : null;
}

export function normalizeDiseases(value, { mentalDiagnosis = false } = {}) {
  const raw = cleanText(value);
  if (!raw || (mentalDiagnosis && normalizeText(raw) === "nao")) {
    return { values: [], other: null, warning: "doencas_nao_coletadas" };
  }

  const values = [];
  const other = [];
  const add = (item) => {
    if (item && !values.includes(item)) values.push(item);
  };

  for (const part of raw.split(",")) {
    const normalized = normalizeText(part).replace(/:$/, "");
    if (!normalized) continue;
    if (normalized.includes("alzheimer") || normalized.includes("demencia")) {
      add("Demencia ou Alzheimer");
      continue;
    }
    const direct = DISEASE_LOOKUP.get(normalized);
    if (direct) {
      add(direct);
      continue;
    }
    if (normalized.startsWith("outro")) {
      add("Outro");
      const detail = part.replace(/^\s*outro\s*:?/i, "").trim();
      if (detail) other.push(detail);
      continue;
    }
    if (normalized.includes("depressao")) {
      add("Depressao");
      continue;
    }
    add("Outro");
    other.push(part.trim());
  }

  return {
    values,
    other: other.length ? other.join("; ") : null,
    warning: values.length ? null : "doencas_nao_identificadas",
  };
}

export function normalizeOrientation(value) {
  const text = normalizeText(value);
  if (text === "orientado") return "Orientado";
  if (text === "parcialmente orientado") return "Parcialmente orientado";
  if (text === "nao orientado") return "Nao orientado";
  return null;
}

export function normalizeMobility(value, { legacyShortForm = false } = {}) {
  const text = normalizeText(value);
  if (!text) return null;
  if (text.includes("acamado") || text === "nao") return "Nao anda, e acamado";
  if (text.includes("com ajuda") || text.includes("auxilio") || text.includes("equipamento")) {
    return "Com ajuda";
  }
  if (text.includes("sozinho") || text === "sim") return "Sozinho(a)";
  return legacyShortForm ? null : cleanText(value);
}

export function normalizeBoolean(value) {
  const text = normalizeText(value);
  if (text === "sim") return true;
  if (text === "nao") return false;
  return null;
}

export function normalizeIncomeSource(value) {
  const parts = String(value ?? "")
    .split(",")
    .map(normalizeText)
    .filter(Boolean)
    .map((item) => {
      if (item === "bpc") return "BPC";
      if (item.startsWith("pens")) return "Pensao";
      if (item.startsWith("aposent")) return "Aposentadoria";
      return cleanText(item);
    });
  return parts.length ? [...new Set(parts)].join(", ") : null;
}

export function normalizeIncomeRange(value, { rawAmount = false } = {}) {
  const raw = cleanText(value);
  const text = normalizeText(raw);
  if (!text) return { range: null, other: null };
  if (rawAmount) return { range: "Outro", other: raw };
  if (text.startsWith("ate 1")) return { range: "ate 1 salario minimo", other: null };
  if (text.startsWith("de 1 a 2")) return { range: "de 1 a 2 salarios minimos", other: null };
  if (text.startsWith("de 3 a 5")) return { range: "de 3 a 5 salarios minimos", other: null };
  if (text.startsWith("de 6 a 10")) return { range: "de 6 a 10 salarios minimos", other: null };
  return { range: "Outro", other: raw.replace(/^outro\s*:?/i, "").trim() || raw };
}

export function normalizeFunctionalValue(value, kind) {
  const text = normalizeText(value);
  if (!text) return null;
  if (text.includes("sem ajuda") || text === "sim") return "Independente";
  if (text.includes("recebe ajuda") || text.includes("nao toma banho so")) {
    return "Precisa de ajuda parcial";
  }
  if (text === "nao") return kind === "banho" ? "Precisa de ajuda parcial" : "Dependente";
  return null;
}

export function classifyLegacyGrade(data) {
  if (data.mobilidade === "Nao anda, e acamado") return 3;
  if (
    data.doencas.includes("Demencia ou Alzheimer") &&
    data.nivel_orientacao === "Nao orientado"
  ) {
    return 3;
  }
  if (data.mobilidade === "Com ajuda" || data.nivel_orientacao === "Parcialmente orientado") {
    return 2;
  }
  return null;
}

export function statusFromColor(color) {
  if (!color) return { value: "Esperando atendimento", warning: null };
  const normalized = color.toUpperCase();
  const value = COLOR_STATUS.get(normalized);
  return value
    ? { value, warning: null }
    : { value: "Esperando atendimento", warning: "status_cor_ambigua" };
}

export function needsReview(warnings) {
  return warnings.some((warning) => REVIEW_WARNING_CODES.has(warning));
}

export function createMunicipalityIndex(municipalities = []) {
  const index = new Map();
  for (const municipality of municipalities) {
    const name = municipality.nome || municipality.name;
    const uf =
      municipality.microrregiao?.mesorregiao?.UF?.sigla ||
      municipality["regiao-imediata"]?.["regiao-intermediaria"]?.UF?.sigla ||
      municipality.uf;
    if (!name || !uf) continue;
    const key = normalizeText(name);
    if (!index.has(key)) index.set(key, []);
    index.get(key).push({ name, uf: String(uf).toUpperCase() });
  }
  return index;
}

function identifyState(text) {
  const normalized = ` ${normalizeText(text).replace(/[^a-z0-9]+/g, " ")} `;
  for (const [uf, name] of Object.entries(STATE_NAMES)) {
    if (normalized.includes(` ${uf} `) || normalized.includes(` ${name} `)) {
      return uf.toUpperCase();
    }
  }
  return null;
}

export function normalizeLocation(cityState, municipalityIndex, separateState = null) {
  const rawCity = cleanText(cityState);
  const rawState = cleanText(separateState);
  const identifiedState = identifyState(rawState || rawCity);
  const normalizedCity = normalizeText(rawCity);
  let matches = [];

  for (const [key, locations] of municipalityIndex.entries()) {
    if (
      normalizedCity === key ||
      normalizedCity.startsWith(`${key} `) ||
      normalizedCity.startsWith(`${key}-`) ||
      normalizedCity.startsWith(`${key}/`) ||
      normalizedCity.startsWith(`${key},`)
    ) {
      matches.push(...locations);
    }
  }

  if (identifiedState) matches = matches.filter((item) => item.uf === identifiedState);
  const unique = matches.filter(
    (item, index, array) =>
      array.findIndex((candidate) => candidate.name === item.name && candidate.uf === item.uf) === index,
  );

  if (unique.length === 1) {
    return { city: unique[0].name, state: unique[0].uf, warnings: [] };
  }

  const warnings = [];
  if (!unique.length) warnings.push("cidade_nao_identificada");
  if (!identifiedState && !unique.length) warnings.push("estado_nao_identificado");
  return { city: null, state: identifiedState, warnings };
}
