import React, { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ClipboardList, Loader2, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ABVD_FIELDS,
  AIVD_FIELDS,
  calcularGrauClassificacao,
  createEmptySolicitacao,
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
} from "../../shared/solicitacao.js";
import { solicitacaoApi } from "@/lib/api";

const EMAIL_DOMAINS = [
  "gmail.com",
  "icloud.com",
  "hotmail.com",
  "outlook.com",
  "yahoo.com",
  "yahoo.com.br",
  "uol.com.br",
  "bol.com.br",
];

const FALLBACK_UFS = [
  { id: 12, sigla: "AC", nome: "Acre" },
  { id: 27, sigla: "AL", nome: "Alagoas" },
  { id: 16, sigla: "AP", nome: "Amapa" },
  { id: 13, sigla: "AM", nome: "Amazonas" },
  { id: 29, sigla: "BA", nome: "Bahia" },
  { id: 23, sigla: "CE", nome: "Ceara" },
  { id: 53, sigla: "DF", nome: "Distrito Federal" },
  { id: 32, sigla: "ES", nome: "Espirito Santo" },
  { id: 52, sigla: "GO", nome: "Goias" },
  { id: 21, sigla: "MA", nome: "Maranhao" },
  { id: 51, sigla: "MT", nome: "Mato Grosso" },
  { id: 50, sigla: "MS", nome: "Mato Grosso do Sul" },
  { id: 31, sigla: "MG", nome: "Minas Gerais" },
  { id: 15, sigla: "PA", nome: "Para" },
  { id: 25, sigla: "PB", nome: "Paraiba" },
  { id: 41, sigla: "PR", nome: "Parana" },
  { id: 26, sigla: "PE", nome: "Pernambuco" },
  { id: 22, sigla: "PI", nome: "Piaui" },
  { id: 33, sigla: "RJ", nome: "Rio de Janeiro" },
  { id: 24, sigla: "RN", nome: "Rio Grande do Norte" },
  { id: 43, sigla: "RS", nome: "Rio Grande do Sul" },
  { id: 11, sigla: "RO", nome: "Rondonia" },
  { id: 14, sigla: "RR", nome: "Roraima" },
  { id: 42, sigla: "SC", nome: "Santa Catarina" },
  { id: 35, sigla: "SP", nome: "Sao Paulo" },
  { id: 28, sigla: "SE", nome: "Sergipe" },
  { id: 17, sigla: "TO", nome: "Tocantins" },
];

function maskCellPhone(value) {
  const digits = String(value || "").replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function isValidCellPhone(value) {
  return /^\d{2}9\d{8}$/.test(String(value || "").replace(/\D/g, ""));
}

function Section({ title, description, children, accent = "#3a5dab" }) {
  return (
    <Card className="overflow-hidden border-0 shadow-xl">
      <CardHeader style={{ background: `linear-gradient(135deg, ${accent}, #1f2937)` }} className="text-white">
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription className="text-white/80">{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="space-y-5 p-6">{children}</CardContent>
    </Card>
  );
}

function Field({ label, children, hint = null }) {
  return (
    <div className="space-y-2">
      <Label className="text-slate-700">{label}</Label>
      {children}
      {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

function SelectInput({ value, onChange, options, placeholder = "Selecione", required = false }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      required={required}
      className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500"
    >
      <option value="">{placeholder}</option>
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

function BooleanSelect({ value, onChange }) {
  return (
    <select
      value={value === true ? "Sim" : value === false ? "Nao" : ""}
      onChange={(event) => {
        if (!event.target.value) onChange("");
        else onChange(event.target.value === "Sim");
      }}
      required
      className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500"
    >
      <option value="">Selecione</option>
      <option value="Nao">Nao</option>
      <option value="Sim">Sim</option>
    </select>
  );
}

function FunctionalAssessment({ title, fields, values, onChange }) {
  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="font-semibold text-slate-900">{title}</p>
      <div className="grid gap-3 md:grid-cols-2">
        {fields.map((field) => (
          <Field key={field.key} label={field.label}>
            <SelectInput
              value={values[field.key] || ""}
              onChange={(value) => onChange(field.key, value)}
              options={FUNCIONALIDADE_OPTIONS}
              required
            />
          </Field>
        ))}
      </div>
    </div>
  );
}

export default function NovaSolicitacao() {
  const [form, setForm] = useState(createEmptySolicitacao());
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ufs, setUfs] = useState(FALLBACK_UFS);
  const [cidades, setCidades] = useState([]);
  const [isIbgeFallback, setIsIbgeFallback] = useState(false);
  const [isLoadingCidades, setIsLoadingCidades] = useState(false);

  const grauPrevisto = useMemo(() => calcularGrauClassificacao(form), [form]);
  const situacaoPrevista = defaultSituacaoFromGrau(grauPrevisto);
  const precisaOrientacao = hasDemenciaOuAlzheimer(form);
  const usaDoencaOutro = form.doencas.includes("Outro");
  const emailSuggestions = useMemo(() => {
    const [name, domain = ""] = form.email_solicitante.split("@");
    if (!form.email_solicitante.includes("@") || !name.trim()) return [];
    return EMAIL_DOMAINS.filter((item) => item.startsWith(domain.toLowerCase())).map(
      (item) => `${name}@${item}`,
    );
  }, [form.email_solicitante]);

  useEffect(() => {
    let isActive = true;

    async function loadUfs() {
      try {
        const response = await fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome");
        if (!response.ok) throw new Error("IBGE indisponivel");
        const data = await response.json();
        if (isActive) {
          setUfs(data.map((item) => ({ id: item.id, sigla: item.sigla, nome: item.nome })));
          setIsIbgeFallback(false);
        }
      } catch {
        if (isActive) {
          setUfs(FALLBACK_UFS);
          setIsIbgeFallback(true);
        }
      }
    }

    loadUfs();
    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    let isActive = true;
    const selectedUf = ufs.find((uf) => uf.sigla === form.estado);

    async function loadCidades() {
      if (!selectedUf || isIbgeFallback) {
        setCidades([]);
        return;
      }

      setIsLoadingCidades(true);
      try {
        const response = await fetch(
          `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf.id}/municipios?orderBy=nome`,
        );
        if (!response.ok) throw new Error("IBGE indisponivel");
        const data = await response.json();
        if (isActive) setCidades(data.map((item) => item.nome));
      } catch {
        if (isActive) {
          setCidades([]);
          setIsIbgeFallback(true);
        }
      } finally {
        if (isActive) setIsLoadingCidades(false);
      }
    }

    loadCidades();
    return () => {
      isActive = false;
    };
  }, [form.estado, isIbgeFallback, ufs]);

  const setValue = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const setEstado = (value) => {
    setForm((current) => ({ ...current, estado: value, cidade: "" }));
  };

  const setFunctionalValue = (property, key, value) => {
    setForm((current) => ({
      ...current,
      [property]: {
        ...current[property],
        [key]: value,
      },
    }));
  };

  const validateBeforeSubmit = () => {
    const requiredTextFields = [
      ["nome_solicitante", "Informe o nome completo do solicitante."],
      ["email_solicitante", "Informe o e-mail do solicitante."],
      ["grau_parentesco", "Informe o grau de parentesco."],
      ["endereco", "Informe endereco, numero e bairro."],
      ["estado", "Selecione o estado."],
      ["cidade", "Informe a cidade."],
      ["telefone_contato", "Informe um telefone celular para contato."],
      ["nome_idoso", "Informe o nome completo do(a) idoso(a)."],
      ["idade_idoso", "Informe a idade do(a) idoso(a)."],
      ["genero_idoso", "Selecione o genero do(a) idoso(a)."],
      ["estado_conjugal", "Selecione o estado conjugal."],
      ["mobilidade", "Informe a mobilidade do(a) idoso(a)."],
      ["familiares", "Informe os familiares do(a) idoso(a)."],
      ["fonte_renda", "Selecione a fonte de renda."],
      ["renda_mensal_faixa", "Selecione a renda mensal."],
    ];

    for (const [key, label] of requiredTextFields) {
      if (!String(form[key] ?? "").trim()) return label;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email_solicitante)) {
      return "Informe um e-mail valido.";
    }

    if (!isValidCellPhone(form.telefone_contato)) {
      return "Informe um celular valido com DDD, no formato (DD) 9XXXX-XXXX.";
    }

    if (Number(form.idade_idoso) <= 0) {
      return "Informe uma idade valida para o(a) idoso(a).";
    }

    if (form.doencas.length === 0) {
      return "Selecione pelo menos uma doenca.";
    }

    if (form.grau_parentesco === "Outros" && !form.grau_parentesco_outro.trim()) {
      return "Informe o grau de parentesco quando selecionar Outros.";
    }

    if (usaDoencaOutro && !form.doenca_outro.trim()) {
      return "Informe qual doenca quando selecionar Outro.";
    }

    if (precisaOrientacao && !form.nivel_orientacao) {
      return "Informe o nivel de orientacao quando Demencia ou Alzheimer estiver marcado.";
    }

    if (form.renda_mensal_faixa === "Outro" && !form.renda_mensal_outro.trim()) {
      return "Informe a renda mensal quando selecionar Outro.";
    }

    if (form.historico_lar === true && !form.detalhes_historico_lar.trim()) {
      return "Informe em qual lar o(a) idoso(a) morou e por que saiu.";
    }

    if (form.interdicao === "" || form.procuracao === "" || form.historico_lar === "") {
      return "Responda todos os campos de Sim/Nao.";
    }

    const missingAbvd = ABVD_FIELDS.some((field) => !form.avaliacao_abvd[field.key]);
    const missingAivd = AIVD_FIELDS.some((field) => !form.avaliacao_aivd[field.key]);
    if (missingAbvd || missingAivd) {
      return "Preencha todos os campos de funcionalidade ABVD e AIVD.";
    }

    return null;
  };

  const toggleDoenca = (doenca) => {
    setForm((current) => {
      const nextDoencas = current.doencas.includes(doenca)
        ? current.doencas.filter((item) => item !== doenca)
        : [...current.doencas, doenca];

      return {
        ...current,
        doencas: nextDoencas,
        nivel_orientacao: nextDoencas.includes("Demencia ou Alzheimer") ? current.nivel_orientacao : "",
        doenca_outro: nextDoencas.includes("Outro") ? current.doenca_outro : "",
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setMessage(null);

    const validationMessage = validateBeforeSubmit();
    if (validationMessage) {
      setError(validationMessage);
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      await solicitacaoApi.create(form);
      setMessage("Solicitacao enviada com sucesso. Em breve a equipe responsavel fara a analise.");
      setForm(createEmptySolicitacao());
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err.message || "Nao foi possivel enviar a solicitacao.");
      if (err.status === 401) {
        window.location.href = "/admin/login";
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(58,93,171,0.16),_transparent_35%),linear-gradient(180deg,#f8fbff_0%,#fff_100%)] p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-2xl backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3a5dab] to-[#e74325] shadow-lg">
                <ClipboardList className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                  Formulario publico
                </p>
                <h1 className="text-3xl font-black tracking-tight text-slate-900">Nova solicitacao</h1>
                <p className="text-slate-600">Preencha os dados da familia e da pessoa idosa.</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Previsao interna</p>
              <p className="text-2xl font-bold text-slate-900">Grau {grauPrevisto}</p>
              <p className="text-sm text-slate-500">{situacaoPrevista}</p>
            </div>
          </div>
        </div>

        {message ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5" />
              <p>{message}</p>
            </div>
          </div>
        ) : null}

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">
            <div className="flex items-start gap-3">
              <ShieldAlert className="mt-0.5 h-5 w-5" />
              <p>{error}</p>
            </div>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Section title="Dados do solicitante" description="Responsavel pela pessoa idosa e pelo contato inicial." accent="#3a5dab">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Qual o nome completo do solicitante?">
                <Input value={form.nome_solicitante} onChange={(e) => setValue("nome_solicitante", e.target.value)} required />
              </Field>
              <Field label="E-mail do solicitante">
                <Input
                  type="email"
                  list="email-suggestions"
                  value={form.email_solicitante}
                  onChange={(e) => setValue("email_solicitante", e.target.value)}
                  required
                />
                <datalist id="email-suggestions">
                  {emailSuggestions.map((email) => (
                    <option key={email} value={email} />
                  ))}
                </datalist>
              </Field>
              <Field label="Qual seu grau de parentesco com o(a) idoso(a)?">
                <SelectInput value={form.grau_parentesco} onChange={(value) => setValue("grau_parentesco", value)} options={GRAU_PARENTESCO_OPTIONS} required />
              </Field>
              {form.grau_parentesco === "Outros" ? (
                <Field label="Informe o grau de parentesco">
                  <Input value={form.grau_parentesco_outro} onChange={(e) => setValue("grau_parentesco_outro", e.target.value)} required />
                </Field>
              ) : null}
              <Field label="Endereco, numero, bairro">
                <Input value={form.endereco} onChange={(e) => setValue("endereco", e.target.value)} required />
              </Field>
              <Field label="Cidade - Estado">
                <div className="grid gap-3 sm:grid-cols-[1fr_120px]">
                  {isIbgeFallback ? (
                    <Input
                      placeholder="Cidade"
                      value={form.cidade}
                      onChange={(e) => setValue("cidade", e.target.value)}
                      required
                    />
                  ) : (
                    <select
                      value={form.cidade}
                      onChange={(event) => setValue("cidade", event.target.value)}
                      required
                      disabled={!form.estado || isLoadingCidades}
                      className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500 disabled:bg-slate-100"
                    >
                      <option value="">{isLoadingCidades ? "Carregando cidades..." : "Cidade"}</option>
                      {cidades.map((cidade) => (
                        <option key={cidade} value={cidade}>
                          {cidade}
                        </option>
                      ))}
                    </select>
                  )}
                  <select
                    value={form.estado}
                    onChange={(event) => setEstado(event.target.value)}
                    required
                    className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500"
                  >
                    <option value="">UF</option>
                    {ufs.map((uf) => (
                      <option key={uf.sigla} value={uf.sigla}>
                        {uf.sigla}
                      </option>
                    ))}
                  </select>
                </div>
                {isIbgeFallback ? (
                  <p className="mt-2 text-xs text-amber-700">
                    Lista de cidades indisponivel no momento. Informe a cidade manualmente.
                  </p>
                ) : null}
              </Field>
              <Field label="Telefone para contato">
                <Input
                  inputMode="tel"
                  maxLength={15}
                  placeholder="(83) 98765-4321"
                  value={form.telefone_contato}
                  onChange={(e) => setValue("telefone_contato", maskCellPhone(e.target.value))}
                  required
                />
              </Field>
            </div>
          </Section>

          <Section
            title="Dados da pessoa idosa"
            description="Nesta secao, coloque os dados do(a) idoso(a) que deseja residir na ASPAN."
            accent="#e74325"
          >
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Field label="Nome completo do(a) idoso(a)">
                <Input value={form.nome_idoso} onChange={(e) => setValue("nome_idoso", e.target.value)} required />
              </Field>
              <Field label="Idade do(a) idoso(a)">
                <Input type="number" min="0" value={form.idade_idoso} onChange={(e) => setValue("idade_idoso", e.target.value)} required />
              </Field>
              <Field label="Genero">
                <SelectInput value={form.genero_idoso} onChange={(value) => setValue("genero_idoso", value)} options={GENERO_IDOSO_OPTIONS} required />
              </Field>
              <Field label="Estado conjugal">
                <SelectInput value={form.estado_conjugal} onChange={(value) => setValue("estado_conjugal", value)} options={ESTADO_CONJUGAL_OPTIONS} required />
              </Field>
            </div>
          </Section>

          <Section title="Saude e mobilidade" description="Informacoes clinicas e funcionais usadas na classificacao inicial." accent="#475569">
            <div>
              <p className="mb-3 text-sm font-medium text-slate-700">Quais doencas acometem o(a) idoso(a)?</p>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {DOENCAS_OPTIONS.map((doenca) => (
                  <label key={doenca} className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
                    <Checkbox checked={form.doencas.includes(doenca)} onCheckedChange={() => toggleDoenca(doenca)} />
                    <span>{doenca}</span>
                  </label>
                ))}
              </div>
            </div>

            {usaDoencaOutro ? (
              <Field label="Informe outra doenca">
                <Input value={form.doenca_outro} onChange={(e) => setValue("doenca_outro", e.target.value)} required />
              </Field>
            ) : null}

            {precisaOrientacao ? (
              <Field label='Caso tenha marcado "Demencia ou Alzheimer", como voce avalia o(a) idoso(a)?'>
                <SelectInput
                  value={form.nivel_orientacao}
                  onChange={(value) => setValue("nivel_orientacao", value)}
                  options={NIVEL_ORIENTACAO_OPTIONS}
                  required
                />
              </Field>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2">
              <Field label="O(a) idoso(a) anda sozinho(a) ou com ajuda?">
                <SelectInput value={form.mobilidade} onChange={(value) => setValue("mobilidade", value)} options={MOBILIDADE_OPTIONS} required />
              </Field>
              <Field label="Qual(is) medicacoes o(a) idoso(a) faz uso?">
                <Textarea value={form.medicacoes} onChange={(e) => setValue("medicacoes", e.target.value)} rows={4} />
              </Field>
            </div>
          </Section>

          <Section title="Funcionalidade" description="Avaliacao objetiva de ABVD e AIVD para estimar Grau I, II ou III." accent="#0f766e">
            <FunctionalAssessment
              title="ABVD - atividades basicas da vida diaria"
              fields={ABVD_FIELDS}
              values={form.avaliacao_abvd}
              onChange={(key, value) => setFunctionalValue("avaliacao_abvd", key, value)}
            />
            <FunctionalAssessment
              title="AIVD - atividades instrumentais da vida diaria"
              fields={AIVD_FIELDS}
              values={form.avaliacao_aivd}
              onChange={(key, value) => setFunctionalValue("avaliacao_aivd", key, value)}
            />
          </Section>

          <Section title="Dados legais, familiares e renda" description="Informacoes complementares para analise interna." accent="#334155">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="O(a) idoso(a) e interditado(a)?">
                <BooleanSelect value={form.interdicao} onChange={(value) => setValue("interdicao", value)} />
              </Field>
              <Field label="Tem procuracao para o representante legal?">
                <BooleanSelect value={form.procuracao} onChange={(value) => setValue("procuracao", value)} />
              </Field>
              <Field label="Possui familiares? Quais?">
                <Textarea value={form.familiares} onChange={(e) => setValue("familiares", e.target.value)} rows={4} required />
              </Field>
              <Field label="Fonte de renda">
                <SelectInput value={form.fonte_renda} onChange={(value) => setValue("fonte_renda", value)} options={FONTE_RENDA_OPTIONS} required />
              </Field>
              <Field label="Qual a sua ultima renda mensal?">
                <SelectInput value={form.renda_mensal_faixa} onChange={(value) => setValue("renda_mensal_faixa", value)} options={RENDA_MENSAL_OPTIONS} required />
              </Field>
              {form.renda_mensal_faixa === "Outro" ? (
                <Field label="Informe a renda mensal">
                  <Input value={form.renda_mensal_outro} onChange={(e) => setValue("renda_mensal_outro", e.target.value)} required />
                </Field>
              ) : null}
            </div>
          </Section>

          <Section title="Historico de longa permanencia" description="Registro de experiencia anterior em ILPI ou lar similar." accent="#7c2d12">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="O(a) idoso(a) ja morou ou mora em algum lar de longa permanencia?">
                <BooleanSelect value={form.historico_lar} onChange={(value) => setValue("historico_lar", value)} />
              </Field>
              {form.historico_lar ? (
                <Field label="Se sim, em qual e por que saiu?">
                  <Textarea value={form.detalhes_historico_lar} onChange={(e) => setValue("detalhes_historico_lar", e.target.value)} rows={4} required />
                </Field>
              ) : null}
            </div>
            <Field label="Observacao adicional">
              <Textarea value={form.observacao} onChange={(e) => setValue("observacao", e.target.value)} rows={4} />
            </Field>
          </Section>

          <Card className="border-0 shadow-2xl">
            <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-slate-500">Classificacao estimada pelas respostas funcionais</p>
                <p className="text-3xl font-black text-slate-900">Grau {grauPrevisto}</p>
                <p className="text-sm text-slate-500">{situacaoPrevista}</p>
              </div>

              <Button type="submit" size="lg" className="gap-2 bg-slate-900 px-8 text-white hover:bg-slate-800" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Enviar solicitacao
              </Button>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
