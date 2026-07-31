import React, { useMemo, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FileDown, FileText, Table as TableIcon } from "lucide-react";
import jsPDF from "jspdf";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSolicitacoes } from "@/hooks/useSolicitacoes";
import { ABVD_FIELDS, AIVD_FIELDS } from "../../shared/solicitacao.js";

function getRecordDate(item) {
  return item.createdAt || item.created_date || item.data_alteracao || item.updatedAt;
}

function formatDate(value) {
  if (!value) return "-";
  return format(new Date(value), "dd/MM/yyyy HH:mm", { locale: ptBR });
}

function formatBoolean(value) {
  return value ? "Sim" : "Nao";
}

function formatDoencas(item) {
  const doencas = Array.isArray(item.doencas) ? [...item.doencas] : [];
  if (item.doenca_outro && doencas.includes("Outro")) {
    doencas[doencas.indexOf("Outro")] = `Outro: ${item.doenca_outro}`;
  }
  return doencas.length > 0 ? doencas.join(", ") : "-";
}

function formatFunctionalAssessment(values, fields) {
  if (!values || typeof values !== "object") return "-";
  const entries = fields
    .map((field) => {
      const value = values[field.key];
      return value ? `${field.label}: ${value}` : null;
    })
    .filter(Boolean);
  return entries.length > 0 ? entries.join("; ") : "-";
}

function getEndereco(item) {
  return item.endereco || "";
}

function formatParentesco(item) {
  return item.grau_parentesco === "Outros" && item.grau_parentesco_outro
    ? item.grau_parentesco_outro
    : item.grau_parentesco || "-";
}

function formatRenda(item) {
  return item.renda_mensal_faixa === "Outro" && item.renda_mensal_outro
    ? item.renda_mensal_outro
    : item.renda_mensal_faixa || "-";
}

function escapeHtml(value) {
  return String(value ?? "-")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function buildFields(item) {
  return {
    Solicitante: [
      ["Nome", item.nome_solicitante],
      ["E-mail", item.email_solicitante],
      ["Parentesco", formatParentesco(item)],
      ["Telefone", item.telefone_contato],
      ["Endereco", [getEndereco(item), item.cidade, item.estado].filter(Boolean).join(", ")],
    ],
    Idoso: [
      ["Nome", item.nome_idoso],
      ["Idade", item.idade_idoso],
      ["Genero", item.genero_idoso],
      ["Estado conjugal", item.estado_conjugal],
    ],
    Saude: [
      ["Doencas", formatDoencas(item)],
      ["Orientacao", item.nivel_orientacao],
      ["Mobilidade", item.mobilidade],
      ["Medicacoes", item.medicacoes],
    ],
    Funcionalidade: [
      ["ABVD", formatFunctionalAssessment(item.avaliacao_abvd, ABVD_FIELDS)],
      ["AIVD", formatFunctionalAssessment(item.avaliacao_aivd, AIVD_FIELDS)],
    ],
    "Dados legais, familiares e renda": [
      ["Interditado", formatBoolean(item.interdicao)],
      ["Procuracao", formatBoolean(item.procuracao)],
      ["Familiares", item.familiares],
      ["Fonte de renda", item.fonte_renda],
      ["Renda mensal", formatRenda(item)],
      ["Historico de ILPI", formatBoolean(item.historico_lar)],
      ["Detalhes ILPI", item.detalhes_historico_lar],
    ],
    Situacao: [
      ["Grau", `Grau ${item.grau_classificacao ?? "-"}`],
      ["Situacao", item.situacao],
      ["Observacao", item.observacao],
      ["Responsavel", item.usuario_alteracao],
      ["Data", formatDate(getRecordDate(item))],
    ],
  };
}

function buildHtml(item) {
  const sections = Object.entries(buildFields(item))
    .map(
      ([section, fields]) => `
        <div class="section">
          <h2>${escapeHtml(section)}</h2>
          <div class="grid">
            ${fields
              .map(
                ([label, value]) => `
                  <div class="field">
                    <span class="label">${escapeHtml(label)}</span>
                    <div class="value">${escapeHtml(value || "-")}</div>
                  </div>
                `
              )
              .join("")}
          </div>
        </div>
      `
    )
    .join("");

  return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Ficha de Entrevista</title>
        <style>
          :root { color-scheme: light; }
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 40px;
            color: #1f2937;
            background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
          }
          .sheet {
            max-width: 920px;
            margin: 0 auto;
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 24px;
            box-shadow: 0 24px 50px rgba(15, 23, 42, 0.08);
            overflow: hidden;
          }
          .hero {
            background: linear-gradient(135deg, #0f172a 0%, #3a5dab 65%, #e74325 140%);
            color: white;
            padding: 28px 32px;
          }
          .hero h1 { margin: 0; font-size: 28px; }
          .hero p { margin: 8px 0 0; color: rgba(255,255,255,0.8); }
          .content { padding: 28px 32px 32px; }
          .section { margin-bottom: 24px; }
          .section h2 {
            margin: 0 0 14px;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.18em;
            color: #3a5dab;
          }
          .grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px 20px;
          }
          .field {
            border: 1px solid #e5e7eb;
            border-radius: 14px;
            padding: 12px 14px;
            background: #fafcff;
          }
          .label { display: block; font-size: 12px; color: #64748b; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.12em; }
          .value { font-size: 14px; font-weight: 600; color: #0f172a; line-height: 1.45; white-space: pre-wrap; }
        </style>
      </head>
      <body>
        <div class="sheet">
          <div class="hero">
            <h1>ASPAN - Ficha de Entrevista</h1>
            <p>Ficha completa gerada em ${escapeHtml(formatDate(new Date()))}.</p>
          </div>
          <div class="content">${sections}</div>
        </div>
      </body>
      </html>
    `;
}

function buildPdf(item) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const margin = 14;
  let y = margin;

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 34, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("ASPAN - Ficha de Entrevista", margin, 16);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Gerado em ${formatDate(new Date())}`, margin, 24);

  y = 44;
  const writeSection = (title, fields) => {
    if (y > 260) {
      doc.addPage();
      y = margin;
    }

    doc.setTextColor(58, 93, 171);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(title, margin, y);
    y += 7;

    fields.forEach(([label, value]) => {
      const text = `${label}: ${String(value || "-")}`;
      const wrapped = doc.splitTextToSize(text, 176);
      const blockHeight = Math.max(8, wrapped.length * 5);

      if (y + blockHeight > 280) {
        doc.addPage();
        y = margin;
      }

      doc.setDrawColor(229, 231, 235);
      doc.setFillColor(250, 252, 255);
      doc.roundedRect(margin, y - 3, 182, blockHeight + 2, 3, 3, "FD");
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(wrapped, margin + 4, y + 3);
      y += blockHeight + 5;
    });

    y += 3;
  };

  Object.entries(buildFields(item)).forEach(([section, fields]) => writeSection(section, fields));

  doc.save(`ficha_aspan_${String(item.nome_idoso || "cadastro").replace(/\s+/g, "_")}.pdf`);
}

export default function GerarRelatorios() {
  const { solicitacoes, isLoading } = useSolicitacoes();
  const [filtroUsuario, setFiltroUsuario] = useState("");

  const filtradas = useMemo(() => {
    const query = filtroUsuario.toLowerCase().trim();
    if (!query) return solicitacoes;
    return solicitacoes.filter((item) => item.usuario_alteracao?.toLowerCase().includes(query));
  }, [filtroUsuario, solicitacoes]);

  const gerarHtml = (item) => {
    const html = buildHtml(item);
    downloadFile(
      `entrevista_${String(item.nome_idoso || "cadastro").replace(/\s+/g, "_")}_${format(new Date(), "yyyy-MM-dd")}.html`,
      html,
      "text/html;charset=utf-8"
    );
  };

  const gerarPdf = (item) => {
    buildPdf(item);
  };

  const exportarCsv = () => {
    const rows = solicitacoes.map((item) => ({
      "Nome do idoso": item.nome_idoso,
      Solicitante: item.nome_solicitante,
      Parentesco: formatParentesco(item),
      Telefone: item.telefone_contato,
      Email: item.email_solicitante,
      Endereco: [getEndereco(item), item.cidade, item.estado].filter(Boolean).join(", "),
      Idade: item.idade_idoso,
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
      "Renda mensal": formatRenda(item),
      "Historico de ILPI": formatBoolean(item.historico_lar),
      "Detalhes ILPI": item.detalhes_historico_lar || "-",
      ABVD: formatFunctionalAssessment(item.avaliacao_abvd, ABVD_FIELDS),
      AIVD: formatFunctionalAssessment(item.avaliacao_aivd, AIVD_FIELDS),
      Situacao: item.situacao,
      Grau: item.grau_classificacao,
      Responsavel: item.usuario_alteracao || "-",
      Data: formatDate(getRecordDate(item)),
    }));

    const headers = Object.keys(rows[0] || {});
    const csv = [
      headers.join(","),
      ...rows.map((row) => headers.map((header) => `"${String(row[header] ?? "").replaceAll('"', '""')}"`).join(",")),
    ].join("\n");

    downloadFile(`relatorio_aspan_${format(new Date(), "yyyy-MM-dd")}.csv`, csv, "text/csv;charset=utf-8");
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-2xl backdrop-blur">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3a5dab] to-[#e74325] shadow-lg">
              <FileDown className="h-8 w-8 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
                Exportacoes internas
              </p>
              <h1 className="text-3xl font-black tracking-tight text-slate-900">Gerar relatorios</h1>
              <p className="text-slate-600">HTML, PDF e CSV com os dados completos do formulario publico.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-0 shadow-xl">
            <CardHeader className="bg-slate-900 text-white">
              <CardTitle className="flex items-center gap-3">
                <FileText className="h-5 w-5" />
                Fichas completas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <p className="text-slate-600">
                Gere uma ficha HTML ou PDF para baixar e imprimir com todos os blocos do cadastro.
              </p>
              <div className="space-y-2">
                <Label>Filtrar por responsavel</Label>
                <Input
                  placeholder="Digite o usuario..."
                  value={filtroUsuario}
                  onChange={(e) => setFiltroUsuario(e.target.value)}
                />
              </div>

              <div className="max-h-96 space-y-2 overflow-y-auto rounded-2xl border border-slate-200 p-2">
                {isLoading ? (
                  <p className="py-8 text-center text-slate-500">Carregando registros...</p>
                ) : filtradas.length === 0 ? (
                  <p className="py-8 text-center text-slate-500">Nenhum cadastro encontrado</p>
                ) : (
                  filtradas.map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 transition hover:bg-slate-100">
                      <div>
                        <p className="font-semibold text-slate-900">{item.nome_idoso}</p>
                        <p className="text-sm text-slate-600">{item.nome_solicitante}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => gerarHtml(item)} className="gap-2 bg-slate-900 text-white hover:bg-slate-800">
                          <FileDown className="h-4 w-4" />
                          HTML
                        </Button>
                        <Button size="sm" onClick={() => gerarPdf(item)} variant="outline" className="gap-2">
                          <FileDown className="h-4 w-4" />
                          PDF
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardHeader className="bg-[#e74325] text-white">
              <CardTitle className="flex items-center gap-3">
                <TableIcon className="h-5 w-5" />
                Exportacao CSV
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <p className="text-slate-600">
                Exporte um CSV consolidado com os campos de contato, saude, funcionalidade, renda, situacao e grau.
              </p>
              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
                <p className="mb-3 text-sm font-semibold text-blue-900">Colunas incluidas</p>
                <ul className="space-y-1 text-sm text-blue-800">
                  <li>Solicitante e contato</li>
                  <li>Dados da pessoa idosa</li>
                  <li>Doencas, mobilidade e medicacoes</li>
                  <li>ABVD, AIVD, renda e historico de ILPI</li>
                  <li>Situacao, grau e data</li>
                </ul>
              </div>
              <Button onClick={exportarCsv} size="lg" className="w-full gap-2 bg-slate-900 text-white hover:bg-slate-800">
                <FileDown className="h-5 w-5" />
                Gerar CSV local
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
