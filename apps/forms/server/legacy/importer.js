import ExcelJS from "exceljs";
import {
  classifyLegacyGrade,
  cleanText,
  createMunicipalityIndex,
  needsReview,
  normalizeBoolean,
  normalizeDiseases,
  normalizeEmail,
  normalizeFunctionalValue,
  normalizeGender,
  normalizeIncomeRange,
  normalizeIncomeSource,
  normalizeLocation,
  normalizeMaritalStatus,
  normalizeMobility,
  normalizeOrientation,
  normalizePhones,
  normalizeRelationship,
  normalizeText,
  parseAge,
  statusFromColor,
} from "./normalization.js";

const SHEET_CONFIGS = [
  {
    name: "Respostas ao formul\u00e1rio 2",
    headerRow: 1,
    firstDataRow: 2,
    expectedRows: 7,
    origin: "legado_formulario_2",
    kind: "short",
    headers: {
      A: "carimbo de data/hora",
      B: "nome completo",
      C: "idade",
      D: "sexo",
      Q: "nome completo",
      R: "telefone para contato",
      S: "grau de parentesco",
    },
  },
  {
    name: "Respostas ao formul\u00e1rio 1",
    headerRow: 4,
    firstDataRow: 5,
    expectedRows: 961,
    origin: "legado_formulario_1",
    kind: "main",
    headers: {
      A: "carimbo de data/hora",
      B: "nome completo do solicitante",
      C: "e-mail do solicitante",
      D: "grau de parentesco",
      E: "endereco, numero, bairro",
      F: "ciade - estado",
      G: "telefone para contato",
      I: "idade do (a) idoso",
      J: "genero",
      L: "quais doencas acometem",
      N: "anda sozinho",
    },
  },
];

const FALLBACK_MUNICIPALITIES = [
  ["Joao Pessoa", "PB"],
  ["Bayeux", "PB"],
  ["Santa Rita", "PB"],
  ["Cabedelo", "PB"],
  ["Conde", "PB"],
  ["Sape", "PB"],
  ["Mamanguape", "PB"],
  ["Guarabira", "PB"],
  ["Campina Grande", "PB"],
  ["Recife", "PE"],
  ["Natal", "RN"],
].map(([nome, uf]) => ({ nome, uf }));

function columnNumber(column) {
  return column
    .split("")
    .reduce((total, letter) => total * 26 + letter.charCodeAt(0) - 64, 0);
}

function cellValue(cell) {
  const value = cell.value;
  if (value && typeof value === "object" && !(value instanceof Date)) {
    if ("result" in value) return value.result;
    if ("text" in value) return value.text;
    if (Array.isArray(value.richText)) return value.richText.map((item) => item.text).join("");
  }
  return value;
}

function serializableCellValue(cell) {
  const value = cellValue(cell);
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return cleanText(value);
}

function rowValue(row, column) {
  return cellValue(row.getCell(columnNumber(column)));
}

function rowText(row, column) {
  return cleanText(rowValue(row, column));
}

function fillColor(cell) {
  const fill = cell.fill;
  if (!fill || fill.type !== "pattern" || fill.pattern !== "solid") return null;
  if (fill.fgColor?.argb) return fill.fgColor.argb.toUpperCase();
  if (fill.fgColor?.theme != null) return `THEME_${fill.fgColor.theme}`;
  if (fill.fgColor?.indexed != null) return `INDEXED_${fill.fgColor.indexed}`;
  return null;
}

function rowColor(row) {
  const colors = [];
  for (let column = 1; column <= 22; column += 1) {
    const color = fillColor(row.getCell(column));
    if (color) colors.push(color);
  }
  if (!colors.length) return null;
  return [...new Set(colors)].sort(
    (left, right) =>
      colors.filter((color) => color === right).length -
      colors.filter((color) => color === left).length,
  )[0];
}

function rawRow(row) {
  const cells = {};
  for (let column = 1; column <= 25; column += 1) {
    const value = serializableCellValue(row.getCell(column));
    if (value !== null && value !== "") {
      let number = column;
      let label = "";
      while (number > 0) {
        number -= 1;
        label = String.fromCharCode(65 + (number % 26)) + label;
        number = Math.floor(number / 26);
      }
      cells[label] = value;
    }
  }
  return cells;
}

function rowHasData(row) {
  return Object.keys(rawRow(row)).length > 0;
}

function parseSubmittedAt(value) {
  if (value instanceof Date && !Number.isNaN(value.valueOf())) return value;
  if (typeof value === "number" && Number.isFinite(value)) {
    const date = new Date(Date.UTC(1899, 11, 30) + value * 86400000);
    if (!Number.isNaN(date.valueOf())) return date;
  }
  const text = cleanText(value);
  if (!text) return null;
  const brazilian = text.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/,
  );
  if (brazilian) {
    const year = Number(brazilian[3]) < 100 ? 2000 + Number(brazilian[3]) : Number(brazilian[3]);
    const date = new Date(
      year,
      Number(brazilian[2]) - 1,
      Number(brazilian[1]),
      Number(brazilian[4] || 0),
      Number(brazilian[5] || 0),
      Number(brazilian[6] || 0),
    );
    if (!Number.isNaN(date.valueOf())) return date;
  }
  const parsed = new Date(text);
  return Number.isNaN(parsed.valueOf()) ? null : parsed;
}

function assertHeaders(worksheet, config) {
  const row = worksheet.getRow(config.headerRow);
  for (const [column, expected] of Object.entries(config.headers)) {
    const actual = normalizeText(rowValue(row, column));
    if (!actual.includes(expected)) {
      throw new Error(
        `Cabecalho inesperado em ${config.name}!${column}${config.headerRow}. Importacao abortada.`,
      );
    }
  }
}

function addWarning(warnings, warning) {
  if (warning && !warnings.includes(warning)) warnings.push(warning);
}

function baseRecord(row, config, municipalityIndex, importedAt) {
  const raw = rawRow(row);
  const warnings = [];
  const submittedAt = parseSubmittedAt(rowValue(row, "A"));
  if (!submittedAt) addWarning(warnings, "data_envio_invalida");

  const color = rowColor(row);
  const status = statusFromColor(color);
  addWarning(warnings, status.warning);

  const applicantColumn = config.kind === "short" ? "Q" : "B";
  const elderColumn = config.kind === "short" ? "B" : "H";
  const applicant = rowText(row, applicantColumn);
  const elder = rowText(row, elderColumn);
  if (!applicant) addWarning(warnings, "nome_solicitante_ausente");
  if (!elder) addWarning(warnings, "nome_idoso_ausente");

  const email =
    config.kind === "short"
      ? { value: null, warning: "email_ausente" }
      : normalizeEmail(rowValue(row, "C"));
  addWarning(warnings, email.warning);

  const relationship = normalizeRelationship(
    rowValue(row, config.kind === "short" ? "S" : "D"),
  );
  const location =
    config.kind === "short"
      ? normalizeLocation(rowValue(row, "O"), municipalityIndex, rowValue(row, "P"))
      : normalizeLocation(rowValue(row, "F"), municipalityIndex);
  location.warnings.forEach((warning) => addWarning(warnings, warning));

  const phone = normalizePhones(rowValue(row, config.kind === "short" ? "R" : "G"), {
    defaultAreaCode: location.state === "PB" ? "83" : null,
  });
  phone.warnings.forEach((warning) => addWarning(warnings, warning));

  const age = parseAge(rowValue(row, config.kind === "short" ? "C" : "I"), submittedAt);
  addWarning(warnings, age.warning);

  const diseases = normalizeDiseases(rowValue(row, config.kind === "short" ? "J" : "L"), {
    mentalDiagnosis: config.kind === "short",
  });
  addWarning(warnings, diseases.warning);

  const mobility = normalizeMobility(rowValue(row, config.kind === "short" ? "I" : "N"), {
    legacyShortForm: config.kind === "short",
  });
  if (!mobility) addWarning(warnings, "mobilidade_ausente");

  const orientation =
    config.kind === "short" ? null : normalizeOrientation(rowValue(row, "M"));
  const income = normalizeIncomeRange(
    rowValue(row, config.kind === "short" ? "L" : "T"),
    { rawAmount: config.kind === "short" },
  );

  const interdiction = config.kind === "short" ? null : normalizeBoolean(rowValue(row, "P"));
  const procuration = config.kind === "short" ? null : normalizeBoolean(rowValue(row, "Q"));
  const history = config.kind === "short" ? null : normalizeBoolean(rowValue(row, "U"));
  if (config.kind === "main" && rowText(row, "P") && interdiction === null) {
    addWarning(warnings, "interdicao_invalida");
  }
  if (config.kind === "main" && rowText(row, "Q") && procuration === null) {
    addWarning(warnings, "procuracao_invalida");
  }
  if (config.kind === "main" && history === null) {
    addWarning(warnings, "historico_lar_invalido");
  }

  const abvd = {};
  if (config.kind === "short") {
    const feeding = normalizeFunctionalValue(rowValue(row, "G"), "alimentacao");
    const bathing = normalizeFunctionalValue(rowValue(row, "H"), "banho");
    if (feeding) abvd.alimentacao = feeding;
    if (bathing) abvd.banho = bathing;
  }

  const notes =
    config.kind === "main"
      ? ["W", "X", "Y"].map((column) => rowText(row, column)).filter(Boolean).join("\n\n")
      : null;

  const data = {
    nome_solicitante: applicant,
    email_solicitante: email.value,
    grau_parentesco: relationship.value,
    grau_parentesco_outro: relationship.other,
    endereco:
      config.kind === "short"
        ? [rowText(row, "M"), rowText(row, "N")].filter(Boolean).join(", ") || null
        : rowText(row, "E"),
    cidade: location.city,
    estado: location.state,
    telefone_contato: phone.primary,
    nome_idoso: elder,
    idade_idoso: age.value,
    genero_idoso: normalizeGender(rowValue(row, config.kind === "short" ? "D" : "J")),
    estado_conjugal: normalizeMaritalStatus(
      rowValue(row, config.kind === "short" ? "E" : "K"),
    ),
    doencas: diseases.values,
    doenca_outro: diseases.other,
    nivel_orientacao: orientation,
    mobilidade: mobility,
    avaliacao_abvd: abvd,
    avaliacao_aivd: {},
    medicacoes: config.kind === "short" ? "" : rowText(row, "O") || "",
    interdicao: interdiction,
    procuracao: procuration,
    familiares:
      config.kind === "short"
        ? rowText(row, "F")
          ? `Possui filhos: ${rowText(row, "F")}`
          : null
        : rowText(row, "R"),
    fonte_renda: normalizeIncomeSource(rowValue(row, config.kind === "short" ? "K" : "S")),
    renda_mensal_faixa: income.range,
    renda_mensal_outro: income.other,
    historico_lar: history,
    detalhes_historico_lar: config.kind === "short" ? null : rowText(row, "V"),
    grau_classificacao: null,
    situacao: status.value,
    observacao: notes,
    usuario_alteracao: "Importacao legada",
    data_alteracao: importedAt.toISOString(),
    createdAt: (submittedAt || importedAt).toISOString(),
    updatedAt: importedAt.toISOString(),
    origem: config.origin,
    telefones_adicionais: phone.additional,
  };

  data.grau_classificacao = classifyLegacyGrade(data);
  if (data.grau_classificacao === null) addWarning(warnings, "grau_indeterminado");

  return {
    sourceSheet: config.name,
    sourceRow: row.number,
    styleColor: color,
    rawData: raw,
    data,
    warnings,
    needsReview: needsReview(warnings),
  };
}

function applyDuplicateWarnings(records) {
  const addForGroups = (keyFor, warning) => {
    const groups = new Map();
    for (const record of records) {
      const key = keyFor(record);
      if (!key) continue;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(record);
    }
    for (const group of groups.values()) {
      if (group.length < 2) continue;
      for (const record of group) addWarning(record.warnings, warning);
    }
  };

  addForGroups((record) => record.data.email_solicitante, "email_repetido");
  addForGroups((record) => {
    if (!record.data.email_solicitante || !record.data.nome_idoso) return null;
    return `${record.data.email_solicitante}|${normalizeText(record.data.nome_idoso)}`;
  }, "mesmo_idoso_email");
  addForGroups((record) => {
    const cells = Object.fromEntries(
      Object.entries(record.rawData).filter(([column]) => column !== "A"),
    );
    return JSON.stringify(cells);
  }, "conteudo_repetido");

  for (const record of records) record.needsReview = needsReview(record.warnings);
}

export async function loadMunicipalityIndex(fetchImpl = globalThis.fetch) {
  try {
    const response = await fetchImpl(
      "https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome",
      { signal: AbortSignal.timeout(15000) },
    );
    if (!response.ok) throw new Error(`IBGE respondeu ${response.status}`);
    return {
      index: createMunicipalityIndex(await response.json()),
      source: "ibge",
    };
  } catch {
    return {
      index: createMunicipalityIndex(FALLBACK_MUNICIPALITIES),
      source: "fallback",
    };
  }
}

function summarize(records, skippedEmpty, municipalitySource) {
  const bySheet = {};
  const byStatus = {};
  const warnings = {};
  for (const record of records) {
    bySheet[record.sourceSheet] = (bySheet[record.sourceSheet] || 0) + 1;
    byStatus[record.data.situacao] = (byStatus[record.data.situacao] || 0) + 1;
    for (const warning of record.warnings) warnings[warning] = (warnings[warning] || 0) + 1;
  }
  return {
    totalRows: records.length,
    reviewRows: records.filter((record) => record.needsReview).length,
    skippedEmpty,
    bySheet,
    byStatus,
    warnings,
    municipalitySource,
  };
}

export async function readLegacyWorkbook(filePath, options = {}) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const municipality = options.municipalityIndex
    ? { index: options.municipalityIndex, source: "provided" }
    : await loadMunicipalityIndex(options.fetchImpl);
  const importedAt = options.importedAt || new Date();
  const records = [];
  let skippedEmpty = 0;

  for (const config of SHEET_CONFIGS) {
    const worksheet = workbook.getWorksheet(config.name);
    if (!worksheet) throw new Error(`Aba obrigatoria ausente: ${config.name}`);
    assertHeaders(worksheet, config);

    let sheetRows = 0;
    for (let rowNumber = config.firstDataRow; rowNumber <= worksheet.rowCount; rowNumber += 1) {
      const row = worksheet.getRow(rowNumber);
      if (!rowHasData(row)) {
        skippedEmpty += 1;
        continue;
      }
      if (normalizeText(rowValue(row, "A")) === "carimbo de data/hora") continue;
      records.push(baseRecord(row, config, municipality.index, importedAt));
      sheetRows += 1;
    }

    if (sheetRows !== config.expectedRows) {
      throw new Error(
        `Aba ${config.name}: esperados ${config.expectedRows} registros, encontrados ${sheetRows}.`,
      );
    }
  }

  const answered = workbook.getWorksheet("J\u00e1 respondidos");
  if (!answered) throw new Error("Aba obrigatoria ausente: Ja respondidos");
  if (answered.actualRowCount > 0) {
    throw new Error("A aba Ja respondidos deixou de estar vazia. Revise o importador.");
  }

  applyDuplicateWarnings(records);
  return {
    records,
    summary: summarize(records, skippedEmpty, municipality.source),
  };
}
