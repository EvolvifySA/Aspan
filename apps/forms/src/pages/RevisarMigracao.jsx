import React, { useMemo, useState } from "react";
import { AlertTriangle, CalendarClock, CheckCircle2, FileSearch, Loader2, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { solicitacaoApi } from "@/lib/api";
import { legacyWarningLabel } from "@/lib/legacyWarnings";
import { useSolicitacoes } from "@/hooks/useSolicitacoes";
import { SITUACAO_OPTIONS } from "../../shared/solicitacao.js";

const emptyDraft = {
  nome_solicitante: "",
  email_solicitante: "",
  telefone_contato: "",
  nome_idoso: "",
  idade_idoso: "",
  cidade: "",
  estado: "",
  grau_classificacao: "none",
  situacao: "Esperando atendimento",
  interdicao: "unknown",
  procuracao: "unknown",
  historico_lar: "unknown",
  observacao: "",
  created_at: "",
  avisos_migracao: [],
  revisao_concluida: false,
};

function toDateTimeLocal(value) {
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return "";
  const localDate = new Date(date.valueOf() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
}

function nullable(value) {
  const text = String(value ?? "").trim();
  return text || null;
}

function booleanDraft(value) {
  if (value === true) return "true";
  if (value === false) return "false";
  return "unknown";
}

function booleanPayload(value) {
  if (value === "true") return true;
  if (value === "false") return false;
  return null;
}

export default function RevisarMigracao() {
  const { solicitacoes, isLoading, refresh } = useSolicitacoes();
  const [query, setQuery] = useState("");
  const [onlyPending, setOnlyPending] = useState(true);
  const [selected, setSelected] = useState(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [legacy, setLegacy] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const records = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    return solicitacoes.filter((item) => {
      if (!item.origem || item.origem === "formulario_atual") return false;
      if (onlyPending && !item.necessita_revisao) return false;
      return !normalized || [item.nome_idoso, item.nome_solicitante, item.email_solicitante]
        .some((value) => value?.toLowerCase().includes(normalized));
    });
  }, [onlyPending, query, solicitacoes]);

  const openReview = async (item) => {
    setSelected(item);
    setLegacy(null);
    setSaveError("");
    setDraft({
      nome_solicitante: item.nome_solicitante || "",
      email_solicitante: item.email_solicitante || "",
      telefone_contato: item.telefone_contato || "",
      nome_idoso: item.nome_idoso || "",
      idade_idoso: item.idade_idoso ?? "",
      cidade: item.cidade || "",
      estado: item.estado || "",
      grau_classificacao: item.grau_classificacao ? String(item.grau_classificacao) : "none",
      situacao: item.situacao || "Esperando atendimento",
      interdicao: booleanDraft(item.interdicao),
      procuracao: booleanDraft(item.procuracao),
      historico_lar: booleanDraft(item.historico_lar),
      observacao: item.observacao || "",
      created_at: toDateTimeLocal(item.createdAt),
      avisos_migracao: Array.isArray(item.avisos_migracao) ? item.avisos_migracao : [],
      revisao_concluida: !item.necessita_revisao,
    });
    try {
      setLegacy(await solicitacaoApi.legacy(item.id));
    } catch {
      setLegacy({ error: "Nao foi possivel carregar os dados originais." });
    }
  };

  const update = (field, value) => setDraft((current) => ({ ...current, [field]: value }));

  const updateReceivedAt = (value) => {
    setDraft((current) => ({
      ...current,
      created_at: value,
      avisos_migracao: current.avisos_migracao.filter(
        (warning) => warning !== "data_envio_invalida",
      ),
    }));
  };

  const save = async () => {
    setSaving(true);
    setSaveError("");
    const receivedAt = new Date(draft.created_at);
    if (!draft.created_at || Number.isNaN(receivedAt.valueOf())) {
      setSaveError("Informe uma data de recebimento valida.");
      setSaving(false);
      return;
    }
    try {
      await solicitacaoApi.review(selected.id, {
        nome_solicitante: nullable(draft.nome_solicitante),
        email_solicitante: nullable(draft.email_solicitante),
        telefone_contato: nullable(draft.telefone_contato),
        nome_idoso: nullable(draft.nome_idoso),
        idade_idoso: draft.idade_idoso === "" ? null : Number(draft.idade_idoso),
        cidade: nullable(draft.cidade),
        estado: nullable(draft.estado),
        grau_classificacao: draft.grau_classificacao === "none" ? null : Number(draft.grau_classificacao),
        situacao: draft.situacao,
        interdicao: booleanPayload(draft.interdicao),
        procuracao: booleanPayload(draft.procuracao),
        historico_lar: booleanPayload(draft.historico_lar),
        observacao: nullable(draft.observacao),
        created_at: receivedAt.toISOString(),
        avisos_migracao: draft.avisos_migracao,
        revisao_concluida: draft.revisao_concluida,
      });
      await refresh();
      setSelected(null);
    } catch (error) {
      setSaveError(error?.message || "Nao foi possivel salvar a revisao.");
    } finally {
      setSaving(false);
    }
  };

  const booleanSelect = (label, field) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={draft[field]} onValueChange={(value) => update(field, value)}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="unknown">Nao informado</SelectItem>
          <SelectItem value="true">Sim</SelectItem>
          <SelectItem value="false">Nao</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-900 text-white">
              <FileSearch className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Revisar migracao</h1>
              <p className="text-sm text-slate-600">Corrija campos ambiguos sem alterar a fonte original.</p>
            </div>
          </div>
          <Badge variant="outline" className="gap-2 border-amber-300 bg-amber-50 text-amber-800">
            <AlertTriangle className="h-4 w-4" />
            {records.length} pendentes na lista
          </Badge>
        </div>

        <Card>
          <CardHeader><CardTitle>Filtros</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1 space-y-2">
              <Label>Busca</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nome ou e-mail" />
              </div>
            </div>
            <label className="flex h-10 items-center gap-2 text-sm font-medium text-slate-700">
              <input type="checkbox" checked={onlyPending} onChange={(event) => setOnlyPending(event.target.checked)} />
              Somente pendentes
            </label>
          </CardContent>
        </Card>

        <div className="overflow-hidden border border-slate-200 bg-white">
          {isLoading ? (
            <p className="p-8 text-center text-slate-500">Carregando...</p>
          ) : records.length === 0 ? (
            <p className="p-8 text-center text-slate-500">Nenhum registro encontrado.</p>
          ) : records.map((item) => (
            <button key={item.id} type="button" onClick={() => openReview(item)} className="flex w-full items-center justify-between gap-4 border-b border-slate-100 p-4 text-left last:border-0 hover:bg-slate-50">
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-900">{item.nome_idoso || "Nome nao informado"}</p>
                <p className="truncate text-sm text-slate-600">{item.nome_solicitante || "Solicitante nao informado"}</p>
                <p className="text-xs text-slate-400">{item.legacy_source_sheet}, linha {item.legacy_source_row}</p>
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <Badge variant="outline">Legado</Badge>
                {item.necessita_revisao ? <Badge className="bg-amber-100 text-amber-800">Revisao</Badge> : <Badge className="bg-emerald-100 text-emerald-800">Concluido</Badge>}
              </div>
            </button>
          ))}
        </div>
      </div>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader><DialogTitle>Revisar cadastro legado</DialogTitle></DialogHeader>
          <div className="grid gap-4 md:grid-cols-2">
            {[['Solicitante','nome_solicitante'],['E-mail','email_solicitante'],['Telefone','telefone_contato'],['Pessoa idosa','nome_idoso'],['Idade','idade_idoso'],['Cidade','cidade'],['UF','estado']].map(([label, field]) => (
              <div key={field} className="space-y-2">
                <Label>{label}</Label>
                <Input type={field === 'idade_idoso' ? 'number' : 'text'} maxLength={field === 'estado' ? 2 : undefined} value={draft[field]} onChange={(event) => update(field, event.target.value)} />
              </div>
            ))}
            <div className="space-y-2">
              <Label>Grau</Label>
              <Select value={draft.grau_classificacao} onValueChange={(value) => update('grau_classificacao', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem classificacao</SelectItem>
                  <SelectItem value="1">Grau 1</SelectItem><SelectItem value="2">Grau 2</SelectItem><SelectItem value="3">Grau 3</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Situacao</Label>
              <Select value={draft.situacao} onValueChange={(value) => update('situacao', value)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{SITUACAO_OPTIONS.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {booleanSelect('Interditado', 'interdicao')}
            {booleanSelect('Procuracao', 'procuracao')}
            {booleanSelect('Historico de ILPI', 'historico_lar')}
            <div className="space-y-2 md:col-span-2">
              <Label>Data de recebimento</Label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  type="datetime-local"
                  value={draft.created_at}
                  onChange={(event) => updateReceivedAt(event.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="shrink-0 gap-2"
                  onClick={() => updateReceivedAt(toDateTimeLocal(new Date()))}
                >
                  <CalendarClock className="h-4 w-4" />
                  Usar data atual
                </Button>
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Observacao</Label>
              <Textarea rows={5} value={draft.observacao} onChange={(event) => update('observacao', event.target.value)} />
            </div>
          </div>

          <div className="space-y-3 border-t border-slate-200 pt-4">
            <div>
              <p className="text-sm font-semibold text-slate-900">Avisos pendentes</p>
              <p className="text-xs text-slate-500">Dispense avisos que foram conferidos. A auditoria original permanece intacta.</p>
            </div>
            {draft.avisos_migracao.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {draft.avisos_migracao.map((warning) => (
                  <Badge key={warning} variant="outline" className="gap-1 border-amber-300 bg-amber-50 py-1 pl-2 pr-1 text-amber-900">
                    {legacyWarningLabel(warning)}
                    <button
                      type="button"
                      title="Dispensar aviso"
                      aria-label={`Dispensar: ${legacyWarningLabel(warning)}`}
                      className="ml-1 rounded p-0.5 hover:bg-amber-200"
                      onClick={() => update("avisos_migracao", draft.avisos_migracao.filter((item) => item !== warning))}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-emerald-700">Todos os avisos foram conferidos.</p>
            )}
            {legacy?.raw_data && (
              <details className="border border-slate-200 bg-slate-50 p-3">
                <summary className="cursor-pointer text-sm font-semibold text-slate-700">Dados originais da linha</summary>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(legacy.warnings || []).map((warning) => (
                    <Badge key={warning} variant="outline">{legacyWarningLabel(warning)}</Badge>
                  ))}
                </div>
                <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-xs text-slate-600">{JSON.stringify(legacy.raw_data, null, 2)}</pre>
              </details>
            )}
          </div>

          <label className="flex items-center gap-2 border-t border-slate-200 pt-4 text-sm font-medium text-slate-800">
            <input type="checkbox" checked={draft.revisao_concluida} onChange={(event) => update('revisao_concluida', event.target.checked)} />
            Marcar revisao como concluida
          </label>
          {saveError && (
            <p role="alert" className="border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {saveError}
            </p>
          )}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setSelected(null)}>Cancelar</Button>
            <Button onClick={save} disabled={saving} className="gap-2 bg-slate-900 text-white">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Salvar revisao
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
