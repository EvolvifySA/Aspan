import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Clock3,
  ClipboardList,
  Download,
  Eye,
  FileText,
  Filter,
  Phone,
  Plus,
  Search,
  Trash2,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { solicitacaoApi } from "@/lib/api";
import { legacyWarningLabel } from "@/lib/legacyWarnings";
import { useSolicitacoes } from "@/hooks/useSolicitacoes";
import { ABVD_FIELDS, AIVD_FIELDS } from "../../shared/solicitacao.js";

const situacaoColors = {
  "Esperando atendimento": "bg-yellow-100 text-yellow-800 border-yellow-300",
  "Observacoes / Avaliar": "bg-blue-100 text-blue-800 border-blue-300",
  "Sem contato / Desistencia": "bg-slate-100 text-slate-800 border-slate-300",
  "Agendado entrevista": "bg-purple-100 text-purple-800 border-purple-300",
  Admissao: "bg-green-100 text-green-800 border-green-300",
  "Nao acolhimento": "bg-red-100 text-red-800 border-red-300",
};

const grauColors = {
  1: "bg-green-100 text-green-800",
  2: "bg-yellow-100 text-yellow-800",
  3: "bg-red-100 text-red-800",
};

function getRecordDate(item) {
  return item.createdAt || item.created_date || item.data_alteracao || item.updatedAt;
}

function formatDate(value) {
  if (!value) return "Nao informado";
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return "Nao informado";
  return format(date, "dd/MM/yyyy", { locale: ptBR });
}

function formatDateTime(value) {
  if (!value) return "Nao informado";
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return "Nao informado";
  return format(date, "dd/MM/yyyy HH:mm", { locale: ptBR });
}

function recordTime(item) {
  const time = new Date(getRecordDate(item)).valueOf();
  return Number.isNaN(time) ? 0 : time;
}

function getAgeLabel(item) {
  if (item.idade_idoso == null) return "Nao informado";
  return `${item.idade_idoso} anos`;
}

function formatBoolean(value) {
  if (value === true) return "Sim";
  if (value === false) return "Nao";
  return "Nao informado";
}

function formatDoencas(item) {
  const doencas = Array.isArray(item.doencas) ? [...item.doencas] : [];
  if (item.doenca_outro && doencas.includes("Outro")) {
    doencas[doencas.indexOf("Outro")] = `Outro: ${item.doenca_outro}`;
  }
  return doencas.length > 0 ? doencas.join(", ") : "Nao informado";
}

function formatFunctionalAssessment(values, fields) {
  if (!values || typeof values !== "object") return "Nao informado";
  const entries = fields
    .map((field) => {
      const value = values[field.key];
      return value ? `${field.label}: ${value}` : null;
    })
    .filter(Boolean);
  return entries.length > 0 ? entries.join("; ") : "Nao informado";
}

function getEndereco(item) {
  return item.endereco || "";
}

export default function GerenciarCadastros() {
  const { solicitacoes, isLoading, error, refresh } = useSolicitacoes();
  const [busca, setBusca] = useState("");
  const [situacao, setSituacao] = useState("all");
  const [grau, setGrau] = useState("all");
  const [origem, setOrigem] = useState("all");
  const [revisao, setRevisao] = useState("all");
  const [ordem, setOrdem] = useState("recentes");
  const [detalheSelecionado, setDetalheSelecionado] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filtradas = useMemo(() => {
    const query = busca.toLowerCase().trim();

    return solicitacoes.filter((item) => {
      const matchBusca =
        !query ||
        item.nome_idoso?.toLowerCase().includes(query) ||
        item.nome_solicitante?.toLowerCase().includes(query) ||
        item.cidade?.toLowerCase().includes(query) ||
        item.telefone_contato?.toLowerCase().includes(query);
      const matchSituacao = situacao === "all" || item.situacao === situacao;
      const matchGrau =
        grau === "all" ||
        (grau === "none" ? item.grau_classificacao == null : String(item.grau_classificacao) === grau);
      const matchOrigem =
        origem === "all" ||
        (origem === "legado" ? item.origem !== "formulario_atual" : item.origem === origem);
      const matchRevisao =
        revisao === "all" || String(Boolean(item.necessita_revisao)) === revisao;
      return matchBusca && matchSituacao && matchGrau && matchOrigem && matchRevisao;
    }).sort((left, right) => {
      const difference = recordTime(right) - recordTime(left);
      return ordem === "recentes" ? difference : -difference;
    });
  }, [busca, grau, ordem, origem, revisao, situacao, solicitacoes]);

  const exportarCsv = () => {
    const rows = filtradas.map((item) => ({
      "Nome do idoso": item.nome_idoso,
      Solicitante: item.nome_solicitante,
      Parentesco: item.grau_parentesco === "Outros" && item.grau_parentesco_outro ? item.grau_parentesco_outro : item.grau_parentesco,
      Telefone: item.telefone_contato,
      Email: item.email_solicitante,
      Endereco: getEndereco(item),
      Idade: item.idade_idoso,
      Cidade: item.cidade,
      Estado: item.estado,
      Genero: item.genero_idoso || "-",
      "Estado conjugal": item.estado_conjugal || "-",
      Mobilidade: item.mobilidade || "-",
      Orientacao: item.nivel_orientacao || "-",
      Doencas: formatDoencas(item),
      Medicacoes: item.medicacoes || "-",
      Interditado: formatBoolean(item.interdicao),
      Procuracao: formatBoolean(item.procuracao),
      Familiares: item.familiares || "-",
      "Fonte de renda": item.fonte_renda || "-",
      "Renda mensal": item.renda_mensal_faixa === "Outro" && item.renda_mensal_outro ? item.renda_mensal_outro : item.renda_mensal_faixa || "-",
      "Historico de ILPI": formatBoolean(item.historico_lar),
      "Detalhes ILPI": item.detalhes_historico_lar || "-",
      ABVD: formatFunctionalAssessment(item.avaliacao_abvd, ABVD_FIELDS),
      AIVD: formatFunctionalAssessment(item.avaliacao_aivd, AIVD_FIELDS),
      Situacao: item.situacao,
      Grau: item.grau_classificacao,
      Origem: item.origem === "formulario_atual" ? "Formulario atual" : "Legado",
      "Necessita revisao": item.necessita_revisao ? "Sim" : "Nao",
      "Recebido em": formatDate(getRecordDate(item)),
      "Ultima alteracao": item.usuario_alteracao || "-",
    }));

    const headers = Object.keys(rows[0] || {});
    const csv = [
      headers.join(","),
      ...rows.map((row) => headers.map((header) => `"${String(row[header] ?? "").replaceAll('"', '""')}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `cadastros_aspan_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const confirmarExclusao = async (item) => {
    if (!item) return;

    const confirmed = window.confirm(
      `Tem certeza que deseja apagar o cadastro de ${item.nome_idoso}? Essa acao nao pode ser desfeita.`
    );

    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await solicitacaoApi.remove(item.id);
      if (detalheSelecionado?.id === item.id) {
        setDetalheSelecionado(null);
      }
      await refresh();
    } finally {
      setIsDeleting(false);
    }
  };

  const total = solicitacoes.length;
  const aguardando = solicitacoes.filter((item) => item.situacao === "Esperando atendimento").length;
  const admitidos = solicitacoes.filter((item) => item.situacao === "Admissao").length;
  const grau3 = solicitacoes.filter((item) => item.grau_classificacao === 3).length;

  const destaque = filtradas[0] || solicitacoes[0];

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-none space-y-6">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
          <div className="grid gap-0 md:grid-cols-[1.3fr_0.9fr]">
            <div className="bg-gradient-to-br from-[#0f172a] via-[#18233a] to-[#3a5dab] p-6 text-white md:p-8">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.28em] text-white/70">
                <span className="h-2 w-2 rounded-full bg-[#e74325]" />
                Painel de Controle Interno
              </div>
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 shadow-lg ring-1 ring-white/15">
                  <ClipboardList className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-black tracking-tight md:text-4xl">
                    Gerenciar cadastros
                  </h1>
                  <p className="mt-1 max-w-2xl text-sm text-white/75 md:text-base">
                    Lista, filtros e exportacoes do banco local com foco no fluxo interno da ASPAN.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center gap-3 bg-slate-50 p-6 md:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-400">
                Acoes rapidas
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild className="gap-2 bg-slate-900 text-white hover:bg-slate-800">
                  <Link to="/solicitacao-vaga">
                    <Plus className="h-4 w-4" />
                    Nova solicitacao
                  </Link>
                </Button>
                <Button onClick={exportarCsv} variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Exportar CSV
                </Button>
                <Button onClick={refresh} variant="outline">
                  Atualizar
                </Button>
              </div>
              <div className="grid gap-3 pt-1 text-sm text-slate-600 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Cadastro em destaque</p>
                  <p className="mt-1 font-semibold text-slate-900">{destaque?.nome_idoso || "Sem registros"}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Ultima atualizacao</p>
                  <p className="mt-1 font-semibold text-slate-900">
                    {formatDateTime(destaque?.updatedAt || destaque?.data_alteracao || destaque?.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <p className="text-sm text-slate-500">Total de cadastros</p>
              <p className="mt-2 text-3xl font-black text-slate-900">{total}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <p className="text-sm text-slate-500">Aguardando</p>
              <p className="mt-2 text-3xl font-black text-yellow-600">{aguardando}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <p className="text-sm text-slate-500">Grau 3</p>
              <p className="mt-2 text-3xl font-black text-red-600">{grau3}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <p className="text-sm text-slate-500">Admissoes</p>
              <p className="mt-2 text-3xl font-black text-emerald-600">{admitidos}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-slate-900 text-white">
            <CardTitle className="flex items-center gap-3">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
              <div className="space-y-2">
                <Label>Busca geral</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <Input
                    placeholder="Nome, cidade, telefone..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Situacao</Label>
                <Select value={situacao} onValueChange={setSituacao}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="Esperando atendimento">Esperando atendimento</SelectItem>
                    <SelectItem value="Observacoes / Avaliar">Observacoes / Avaliar</SelectItem>
                    <SelectItem value="Sem contato / Desistencia">Sem contato / Desistencia</SelectItem>
                    <SelectItem value="Agendado entrevista">Agendado entrevista</SelectItem>
                    <SelectItem value="Admissao">Admissao</SelectItem>
                    <SelectItem value="Nao acolhimento">Nao acolhimento</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Grau</Label>
                <Select value={grau} onValueChange={setGrau}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="1">Grau 1</SelectItem>
                    <SelectItem value="2">Grau 2</SelectItem>
                    <SelectItem value="3">Grau 3</SelectItem>
                    <SelectItem value="none">Sem classificacao</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Origem</Label>
                <Select value={origem} onValueChange={setOrigem}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="formulario_atual">Formulario atual</SelectItem>
                    <SelectItem value="legado">Legado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Revisao</Label>
                <Select value={revisao} onValueChange={setRevisao}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="true">Pendente</SelectItem>
                    <SelectItem value="false">Concluida ou dispensada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Ordem</Label>
                <Select value={ordem} onValueChange={setOrdem}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recentes">Mais recentes primeiro</SelectItem>
                    <SelectItem value="antigas">Mais antigas primeiro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl">
          <CardContent className="p-0">
            <div className="grid gap-3 p-3 lg:grid-cols-2 2xl:hidden">
              {isLoading ? (
                <p className="py-12 text-center text-slate-500 lg:col-span-2">Carregando registros...</p>
              ) : error ? (
                <p className="py-12 text-center text-red-600 lg:col-span-2">{error.message || "Erro ao carregar registros"}</p>
              ) : filtradas.length === 0 ? (
                <p className="py-12 text-center text-slate-500 lg:col-span-2">Nenhum cadastro encontrado</p>
              ) : filtradas.map((item) => (
                <article key={item.id} className="border border-slate-200 bg-white p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="break-words font-semibold text-slate-900">{item.nome_idoso || "Nao informado"}</p>
                      <p className="break-words text-sm text-slate-600">{item.nome_solicitante || "Nao informado"}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {item.origem !== "formulario_atual" && <Badge variant="outline">Legado</Badge>}
                        {item.necessita_revisao && <Badge className="bg-amber-100 text-amber-800">Revisao</Badge>}
                      </div>
                    </div>
                    <Badge variant="outline" className={`${situacaoColors[item.situacao] || "bg-slate-100 text-slate-700"} w-fit border`}>
                      {item.situacao}
                    </Badge>
                  </div>

                  <dl className="mt-4 grid gap-x-4 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                    <div><dt className="text-xs text-slate-500">Recebido em</dt><dd className="font-medium text-slate-800">{formatDate(getRecordDate(item))}</dd></div>
                    <div><dt className="text-xs text-slate-500">Telefone</dt><dd className="break-words font-medium text-slate-800">{item.telefone_contato || "Nao informado"}</dd></div>
                    <div><dt className="text-xs text-slate-500">Cidade</dt><dd className="break-words font-medium text-slate-800">{item.cidade || "Nao informado"}</dd></div>
                    <div><dt className="text-xs text-slate-500">Grau</dt><dd className="font-medium text-slate-800">{item.grau_classificacao ? `Grau ${item.grau_classificacao}` : "Sem classificacao"}</dd></div>
                    <div className="sm:col-span-2 lg:col-span-4"><dt className="text-xs text-slate-500">Observacao</dt><dd className="break-words text-slate-700">{item.observacao || "Nao informado"}</dd></div>
                  </dl>

                  <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-3 sm:flex-row sm:justify-end">
                    <Button size="sm" onClick={() => setDetalheSelecionado(item)} className="gap-2 bg-slate-900 text-white hover:bg-slate-800">
                      <Eye className="h-4 w-4" /> Detalhes
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => confirmarExclusao(item)} disabled={isDeleting} className="gap-2">
                      <Trash2 className="h-4 w-4" /> Apagar
                    </Button>
                  </div>
                </article>
              ))}
            </div>

            <div className="hidden 2xl:block">
              <Table className="min-w-[1180px] table-fixed">
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="w-[145px]">Nome do idoso</TableHead>
                    <TableHead className="w-[155px]">Solicitante</TableHead>
                    <TableHead className="w-[90px]">Parentesco</TableHead>
                    <TableHead className="w-[115px]">Telefone</TableHead>
                    <TableHead className="w-[100px]">Cidade</TableHead>
                    <TableHead className="w-[92px]">Recebido</TableHead>
                    <TableHead className="w-[88px]">Grau</TableHead>
                    <TableHead className="w-[115px]">Situacao</TableHead>
                    <TableHead>Observacao</TableHead>
                    <TableHead className="sticky right-0 w-[104px] border-l bg-slate-50 text-center">Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={10} className="py-12 text-center text-slate-500">
                        Carregando registros...
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={10} className="py-12 text-center text-red-600">
                        {error.message || "Erro ao carregar registros"}
                      </TableCell>
                    </TableRow>
                  ) : filtradas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="py-12 text-center text-slate-500">
                        <FileText className="mx-auto mb-3 h-10 w-10 opacity-30" />
                        Nenhum cadastro encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtradas.map((item) => (
                      <TableRow key={item.id} className="hover:bg-slate-50">
                        <TableCell className="font-semibold text-slate-900">
                          <div>{item.nome_idoso || "Nao informado"}</div>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {item.origem !== "formulario_atual" && <Badge variant="outline">Legado</Badge>}
                            {item.necessita_revisao && <Badge className="bg-amber-100 text-amber-800">Revisao</Badge>}
                          </div>
                        </TableCell>
                        <TableCell>{item.nome_solicitante || "Nao informado"}</TableCell>
                        <TableCell>{item.grau_parentesco || "Nao informado"}</TableCell>
                        <TableCell>{item.telefone_contato || "Nao informado"}</TableCell>
                        <TableCell>{item.cidade || "Nao informado"}</TableCell>
                        <TableCell>{formatDate(getRecordDate(item))}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`${grauColors[item.grau_classificacao] || "bg-slate-100 text-slate-700"} border`}>
                            {item.grau_classificacao ? `Grau ${item.grau_classificacao}` : "Sem classificacao"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`${situacaoColors[item.situacao] || "bg-slate-100 text-slate-700"} border`}>
                            {item.situacao}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate text-slate-600">
                          {item.observacao || "Nao informado"}
                        </TableCell>
                        <TableCell className="sticky right-0 border-l bg-white">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="icon"
                              title="Ver detalhes"
                              aria-label="Ver detalhes"
                              onClick={() => setDetalheSelecionado(item)}
                              className="h-8 w-8 bg-slate-900 text-white hover:bg-slate-800"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon"
                              title="Apagar cadastro"
                              aria-label="Apagar cadastro"
                              onClick={() => confirmarExclusao(item)}
                              disabled={isDeleting}
                              className="h-8 w-8"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Dialog open={Boolean(detalheSelecionado)} onOpenChange={(open) => !open && setDetalheSelecionado(null)}>
          <DialogContent className="max-h-[85vh] max-w-4xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-slate-900">
                {detalheSelecionado?.nome_idoso || "Detalhes do cadastro"}
              </DialogTitle>
            </DialogHeader>

            {detalheSelecionado ? (
              <div className="grid gap-4 md:grid-cols-2">
                {detalheSelecionado.origem !== "formulario_atual" && (
                  <div className="flex flex-wrap items-center gap-2 border border-amber-200 bg-amber-50 p-3 md:col-span-2">
                    <Badge variant="outline">Legado</Badge>
                    {detalheSelecionado.necessita_revisao && <Badge className="bg-amber-200 text-amber-900">Revisao necessaria</Badge>}
                    <span className="text-sm text-amber-900">
                      {detalheSelecionado.legacy_source_sheet}, linha {detalheSelecionado.legacy_source_row}
                    </span>
                  </div>
                )}
                <Card className="border-0 bg-slate-50 shadow-none">
                  <CardContent className="space-y-3 p-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Solicitante</p>
                      <p className="font-semibold text-slate-900">{detalheSelecionado.nome_solicitante || "Nao informado"}</p>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <Phone className="h-4 w-4" />
                      {detalheSelecionado.telefone_contato || "Nao informado"}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <UserRound className="h-4 w-4" />
                      {detalheSelecionado.grau_parentesco === "Outros" && detalheSelecionado.grau_parentesco_outro
                        ? detalheSelecionado.grau_parentesco_outro
                        : detalheSelecionado.grau_parentesco || "Nao informado"}
                    </div>
                    <div className="text-sm text-slate-600">E-mail: {detalheSelecionado.email_solicitante || "Nao informado"}</div>
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <Clock3 className="h-4 w-4" />
                      Recebido em {formatDateTime(detalheSelecionado.createdAt)}
                    </div>
                    <div className="text-sm text-slate-600">
                      Ultima alteracao: {formatDateTime(detalheSelecionado.updatedAt || detalheSelecionado.data_alteracao)}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-slate-50 shadow-none">
                  <CardContent className="space-y-3 p-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Idoso</p>
                      <p className="font-semibold text-slate-900">{detalheSelecionado.nome_idoso || "Nao informado"}</p>
                    </div>
                    <div className="text-sm text-slate-600">Idade: {getAgeLabel(detalheSelecionado)}</div>
                    <div className="text-sm text-slate-600">Genero: {detalheSelecionado.genero_idoso || "Nao informado"}</div>
                    <div className="text-sm text-slate-600">Estado conjugal: {detalheSelecionado.estado_conjugal || "Nao informado"}</div>
                    <div className="text-sm text-slate-600">Mobilidade: {detalheSelecionado.mobilidade || "Nao informado"}</div>
                    <div className="text-sm text-slate-600">Orientacao: {detalheSelecionado.nivel_orientacao || "Nao informado"}</div>
                    <div className="text-sm text-slate-600">Doencas: {formatDoencas(detalheSelecionado)}</div>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-slate-50 shadow-none md:col-span-2">
                  <CardContent className="grid gap-3 p-4 md:grid-cols-2">
                    <div className="text-sm text-slate-600">
                      Endereco: {[getEndereco(detalheSelecionado), detalheSelecionado.cidade, detalheSelecionado.estado].filter(Boolean).join(", ") || "Nao informado"}
                    </div>
                    <div className="text-sm text-slate-600">Situacao: {detalheSelecionado.situacao || "-"}</div>
                    <div className="text-sm text-slate-600">Grau de classificacao: {detalheSelecionado.grau_classificacao ? `Grau ${detalheSelecionado.grau_classificacao}` : "Sem classificacao"}</div>
                    <div className="text-sm text-slate-600">Responsavel pela ultima alteracao: {detalheSelecionado.usuario_alteracao || "Nao informado"}</div>
                    <div className="text-sm text-slate-600 md:col-span-2">Medicacoes: {detalheSelecionado.medicacoes || "Nao informado"}</div>
                    <div className="text-sm text-slate-600">Interditado: {formatBoolean(detalheSelecionado.interdicao)}</div>
                    <div className="text-sm text-slate-600">Procuracao: {formatBoolean(detalheSelecionado.procuracao)}</div>
                    <div className="text-sm text-slate-600 md:col-span-2">Familiares: {detalheSelecionado.familiares || "Nao informado"}</div>
                    <div className="text-sm text-slate-600">Fonte de renda: {detalheSelecionado.fonte_renda || "Nao informado"}</div>
                    <div className="text-sm text-slate-600">
                      Renda mensal: {detalheSelecionado.renda_mensal_faixa === "Outro" && detalheSelecionado.renda_mensal_outro ? detalheSelecionado.renda_mensal_outro : detalheSelecionado.renda_mensal_faixa || "Nao informado"}
                    </div>
                    <div className="text-sm text-slate-600">Historico de ILPI: {formatBoolean(detalheSelecionado.historico_lar)}</div>
                    <div className="text-sm text-slate-600">Detalhes ILPI: {detalheSelecionado.detalhes_historico_lar || "Nao informado"}</div>
                    <div className="text-sm text-slate-600 md:col-span-2">ABVD: {formatFunctionalAssessment(detalheSelecionado.avaliacao_abvd, ABVD_FIELDS)}</div>
                    <div className="text-sm text-slate-600 md:col-span-2">AIVD: {formatFunctionalAssessment(detalheSelecionado.avaliacao_aivd, AIVD_FIELDS)}</div>
                    <div className="text-sm text-slate-600 md:col-span-2">Observacao: {detalheSelecionado.observacao || "Nao informado"}</div>
                    {detalheSelecionado.avisos_migracao?.length > 0 && (
                      <div className="md:col-span-2">
                        <p className="mb-2 text-sm font-semibold text-slate-700">Avisos da migracao</p>
                        <div className="flex flex-wrap gap-2">
                          {detalheSelecionado.avisos_migracao.map((warning) => <Badge key={warning} variant="outline">{legacyWarningLabel(warning)}</Badge>)}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="md:col-span-2 flex justify-end">
                  <Button
                    variant="destructive"
                    onClick={() => confirmarExclusao(detalheSelecionado)}
                    disabled={isDeleting}
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Apagar cadastro
                  </Button>
                </div>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
