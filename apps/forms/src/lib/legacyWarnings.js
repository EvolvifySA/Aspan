export const LEGACY_WARNING_LABELS = {
  cidade_nao_identificada: "Cidade nao identificada",
  conteudo_repetido: "Conteudo possivelmente repetido",
  data_envio_invalida: "Data original invalida",
  doencas_nao_coletadas: "Doencas nao coletadas no formulario antigo",
  email_ausente: "E-mail nao informado",
  email_invalido: "E-mail original invalido",
  email_repetido: "E-mail usado em mais de uma solicitacao",
  estado_nao_identificado: "Estado nao identificado",
  grau_indeterminado: "Grau sem classificacao segura",
  historico_lar_invalido: "Historico de ILPI nao identificado",
  idade_ambigua: "Idade original ambigua",
  idade_ausente: "Idade nao informada",
  interdicao_invalida: "Interdicao nao identificada",
  mesmo_idoso_email: "Mesmo e-mail associado a pessoa idosa repetida",
  mobilidade_ausente: "Mobilidade nao informada",
  nome_idoso_ausente: "Nome da pessoa idosa nao informado",
  nome_solicitante_ausente: "Nome do solicitante nao informado",
  procuracao_invalida: "Procuracao nao identificada",
  status_cor_ambigua: "Cor original sem situacao reconhecida",
  telefone_ddd_inferido: "DDD inferido durante a importacao",
  telefone_invalido: "Telefone original invalido",
  telefones_multiplos: "Mais de um telefone no campo original",
};

export function legacyWarningLabel(code) {
  return LEGACY_WARNING_LABELS[code] || code.replaceAll("_", " ");
}
