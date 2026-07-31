import React, { useMemo, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, Edit3, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SITUACAO_OPTIONS } from "../../shared/solicitacao.js";
import { solicitacaoApi } from "@/lib/api";
import { useSolicitacoes } from "@/hooks/useSolicitacoes";

const situacaoColors = {
  "Esperando atendimento": "bg-yellow-100 text-yellow-800 border-yellow-300",
  "Observacoes / Avaliar": "bg-blue-100 text-blue-800 border-blue-300",
  "Sem contato / Desistencia": "bg-slate-100 text-slate-800 border-slate-300",
  "Agendado entrevista": "bg-purple-100 text-purple-800 border-purple-300",
  Admissao: "bg-green-100 text-green-800 border-green-300",
  "Nao acolhimento": "bg-red-100 text-red-800 border-red-300",
};

const grauColors = {
  1: "bg-green-100 text-green-800 border-green-300",
  2: "bg-yellow-100 text-yellow-800 border-yellow-300",
  3: "bg-red-100 text-red-800 border-red-300",
};

function getRecordDate(item) {
  return item.createdAt || item.created_date || item.data_alteracao || item.updatedAt;
}

function formatDate(value) {
  if (!value) return "-";
  return format(new Date(value), "dd/MM/yyyy", { locale: ptBR });
}

export default function EditarSituacao() {
  const { solicitacoes, isLoading, error, refresh } = useSolicitacoes();
  const [busca, setBusca] = useState("");
  const [filtroSituacao, setFiltroSituacao] = useState("all");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [editando, setEditando] = useState(null);
  const [novaSituacao, setNovaSituacao] = useState("");
  const [novoGrau, setNovoGrau] = useState("1");
  const [observacao, setObservacao] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const filtradas = useMemo(() => {
    const query = busca.toLowerCase().trim();

    return solicitacoes.filter((item) => {
      const matchBusca =
        !query ||
        item.nome_idoso?.toLowerCase().includes(query) ||
        item.nome_solicitante?.toLowerCase().includes(query) ||
        item.cidade?.toLowerCase().includes(query);

      const matchSituacao = filtroSituacao === "all" || item.situacao === filtroSituacao;

      let matchData = true;
      if (dataInicio) {
        const created = new Date(getRecordDate(item));
        matchData = created >= new Date(dataInicio);
      }
      if (matchData && dataFim) {
        const created = new Date(getRecordDate(item));
        const end = new Date(dataFim);
        end.setHours(23, 59, 59, 999);
        matchData = created <= end;
      }

      return matchBusca && matchSituacao && matchData;
    });
  }, [busca, dataFim, dataInicio, filtroSituacao, solicitacoes]);

  const abrirEdicao = (item) => {
    setEditando(item);
    setNovaSituacao(item.situacao);
    setNovoGrau(String(item.grau_classificacao || 1));
    setObservacao(item.observacao || "");
  };

  const salvarEdicao = async () => {
    if (!editando) return;

    setIsSaving(true);
    try {
      await solicitacaoApi.update(editando.id, {
        situacao: novaSituacao,
        grau_classificacao: Number(novoGrau),
        observacao,
      });
      await refresh();
      setEditando(null);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-2xl backdrop-blur">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3a5dab] to-[#e74325] shadow-lg">
              <Edit3 className="h-8 w-8 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                Ajuste interno
              </p>
              <h1 className="text-3xl font-black tracking-tight text-slate-900">
                Editar situacao
              </h1>
              <p className="text-slate-600">Atualize o status e a observacao de cada cadastro.</p>
            </div>
          </div>
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-slate-900 text-white">
            <CardTitle className="flex items-center gap-3">
              <Search className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label>Buscar por nome</Label>
                <Input placeholder="Nome do idoso ou solicitante..." value={busca} onChange={(e) => setBusca(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Situacao</Label>
                <Select value={filtroSituacao} onValueChange={setFiltroSituacao}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {SITUACAO_OPTIONS.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Data inicio</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="pl-10" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Data fim</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="pl-10" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Nome do idoso</TableHead>
                    <TableHead>Solicitante</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Grau</TableHead>
                    <TableHead>Situacao atual</TableHead>
                    <TableHead>Observacao</TableHead>
                    <TableHead>Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-12 text-center text-slate-500">
                        Carregando registros...
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-12 text-center text-red-600">
                        {error.message || "Erro ao carregar registros"}
                      </TableCell>
                    </TableRow>
                  ) : filtradas.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-12 text-center text-slate-500">
                        Nenhum cadastro encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtradas.map((item) => (
                      <TableRow key={item.id} className="hover:bg-slate-50">
                        <TableCell className="font-semibold text-slate-900">{item.nome_idoso}</TableCell>
                        <TableCell>{item.nome_solicitante}</TableCell>
                        <TableCell>{formatDate(getRecordDate(item))}</TableCell>
                        <TableCell>
                          <Badge className={`${grauColors[item.grau_classificacao] || grauColors[1]} border`}>
                            Grau {item.grau_classificacao || 1}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${situacaoColors[item.situacao] || "bg-slate-100 text-slate-700"} border`}>
                            {item.situacao}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate text-slate-600">{item.observacao || "-"}</TableCell>
                        <TableCell>
                          <Button onClick={() => abrirEdicao(item)} className="gap-2 bg-slate-900 text-white hover:bg-slate-800">
                            <Edit3 className="h-4 w-4" />
                            Editar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Dialog open={Boolean(editando)} onOpenChange={(open) => !open && setEditando(null)}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Editar situacao</DialogTitle>
              <DialogDescription>Altere a situacao, o grau e a observacao. A data de alteracao sera atualizada no servidor.</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Grau de classificacao</Label>
                <Select value={novoGrau} onValueChange={setNovoGrau}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Grau 1 - Independente</SelectItem>
                    <SelectItem value="2">Grau 2 - Dependencia parcial</SelectItem>
                    <SelectItem value="3">Grau 3 - Dependencia total</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Nova situacao</Label>
                <Select value={novaSituacao} onValueChange={setNovaSituacao}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SITUACAO_OPTIONS.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Observacao</Label>
                <Textarea value={observacao} onChange={(e) => setObservacao(e.target.value)} rows={5} />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditando(null)}>
                Cancelar
              </Button>
              <Button onClick={salvarEdicao} className="gap-2 bg-slate-900 text-white hover:bg-slate-800" disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
