export const GRAU_PARENTESCO_OPTIONS = ["Filho(a)", "Irmao(a)", "Sobrinho(a)", "Outros"];
export const GENERO_IDOSO_OPTIONS = ["Masculino", "Feminino", "Outro"];
export const ESTADO_CONJUGAL_OPTIONS = ["Casado(a)", "Viuvo(a)", "Solteiro(a)", "Divorciado(a)", "Outro"];
export const DOENCAS_OPTIONS = [
  "Cardiopatia",
  "Infeccao respiratoria",
  "Artrose ou reumatismo",
  "Sequela de AVC",
  "Problema auditivo/surdez",
  "Problema de visao/Cegueira",
  "Hipertensao",
  "Depressao",
  "Infeccao urinaria",
  "Demencia ou Alzheimer",
  "Parkison",
  "Diabetes",
  "Ansiedade",
  "Outro",
];
export const NIVEL_ORIENTACAO_OPTIONS = ["Orientado", "Parcialmente orientado", "Nao orientado"];
export const MOBILIDADE_OPTIONS = ["Sozinho(a)", "Com ajuda", "Nao anda, e acamado"];
export const SIM_NAO_OPTIONS = ["Sim", "Nao"];
export const FONTE_RENDA_OPTIONS = ["BPC", "Pensao", "Aposentadoria"];
export const RENDA_MENSAL_OPTIONS = [
  "ate 1 salario minimo",
  "de 1 a 2 salarios minimos",
  "de 3 a 5 salarios minimos",
  "de 6 a 10 salarios minimos",
  "Outro",
];
export const FUNCIONALIDADE_OPTIONS = ["Independente", "Precisa de ajuda parcial", "Dependente"];
export const ABVD_FIELDS = [
  { key: "banho", label: "Banho" },
  { key: "vestir", label: "Vestir-se" },
  { key: "higiene_pessoal", label: "Higiene pessoal" },
  { key: "transferencia", label: "Transferencia" },
  { key: "continencia", label: "Continencia" },
  { key: "alimentacao", label: "Alimentacao" },
];
export const AIVD_FIELDS = [
  { key: "medicamentos", label: "Administracao de medicamentos" },
  { key: "refeicoes", label: "Preparo de refeicoes" },
  { key: "compras", label: "Compras" },
  { key: "transporte", label: "Transporte" },
  { key: "financeiro", label: "Controle financeiro" },
];
export const SITUACAO_OPTIONS = [
  "Esperando atendimento",
  "Nao acolhimento",
  "Observacoes / Avaliar",
  "Sem contato / Desistencia",
  "Agendado entrevista",
  "Admissao",
];

export const ADMIN_ROLE_OPTIONS = ["ADMIN", "SUPERADMIN"];

export function defaultSituacaoFromGrau(grauClassificacao) {
  return Number(grauClassificacao) === 3 ? "Nao acolhimento" : "Esperando atendimento";
}

function getFunctionalValues(dados, fieldList, property) {
  const source = dados?.[property] && typeof dados[property] === "object" ? dados[property] : {};
  return fieldList.map((field) => source[field.key]).filter(Boolean);
}

function countValues(values, predicate) {
  return values.reduce((total, value) => (predicate(value) ? total + 1 : total), 0);
}

export function hasDemenciaOuAlzheimer(dados) {
  const doencas = Array.isArray(dados?.doencas) ? dados.doencas : [];
  return doencas.includes("Demencia ou Alzheimer");
}

export function calcularGrauClassificacao(dados) {
  const abvdValues = getFunctionalValues(dados, ABVD_FIELDS, "avaliacao_abvd");
  const aivdValues = getFunctionalValues(dados, AIVD_FIELDS, "avaliacao_aivd");
  const abvdDependente = countValues(abvdValues, (value) => value === "Dependente");
  const abvdComAjuda = countValues(abvdValues, (value) => value !== "Independente");
  const aivdDependente = countValues(aivdValues, (value) => value === "Dependente");
  const maioriaAbvd = Math.ceil(ABVD_FIELDS.length / 2);
  const maioriaAivd = Math.ceil(AIVD_FIELDS.length / 2);

  if (dados.mobilidade === "Nao anda, e acamado") {
    return 3;
  }

  if (hasDemenciaOuAlzheimer(dados) && dados.nivel_orientacao === "Nao orientado") {
    return 3;
  }

  if (abvdDependente >= maioriaAbvd || abvdComAjuda === ABVD_FIELDS.length) {
    return 3;
  }

  if (
    abvdComAjuda > 0 ||
    aivdDependente >= maioriaAivd ||
    dados.mobilidade === "Com ajuda" ||
    dados.nivel_orientacao === "Parcialmente orientado"
  ) {
    return 2;
  }

  return 1;
}

function createEmptyFunctionalAssessment(fields) {
  return fields.reduce((acc, field) => {
    acc[field.key] = "";
    return acc;
  }, {});
}

export function createEmptySolicitacao() {
  return {
    nome_solicitante: "",
    email_solicitante: "",
    grau_parentesco: "",
    grau_parentesco_outro: "",
    endereco: "",
    cidade: "",
    estado: "",
    telefone_contato: "",
    nome_idoso: "",
    idade_idoso: "",
    genero_idoso: "",
    estado_conjugal: "",
    doencas: [],
    doenca_outro: "",
    nivel_orientacao: "",
    mobilidade: "",
    avaliacao_abvd: createEmptyFunctionalAssessment(ABVD_FIELDS),
    avaliacao_aivd: createEmptyFunctionalAssessment(AIVD_FIELDS),
    medicacoes: "",
    interdicao: false,
    procuracao: false,
    familiares: "",
    fonte_renda: "",
    renda_mensal_faixa: "",
    renda_mensal_outro: "",
    historico_lar: false,
    detalhes_historico_lar: "",
    observacao: "",
  };
}
