import React, { useMemo } from "react";
import { BarChart3, MapPin, TrendingUp, Users } from "lucide-react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSolicitacoes } from "@/hooks/useSolicitacoes";

const COLORS = ["#3a5dab", "#e74325", "#4a6dbb", "#f75435", "#5a7dcb", "#ff6345"];

export default function Graficos() {
  const { solicitacoes, isLoading } = useSolicitacoes();

  const data = useMemo(() => {
    const cidades = Object.entries(
      solicitacoes.reduce((acc, item) => {
        if (item.cidade) acc[item.cidade] = (acc[item.cidade] || 0) + 1;
        return acc;
      }, {})
    )
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6)
      .map(([cidade, total]) => ({ cidade, total }));

    const doencas = Object.entries(
      solicitacoes.reduce((acc, item) => {
        item.doencas?.forEach((doenca) => {
          acc[doenca] = (acc[doenca] || 0) + 1;
        });
        return acc;
      }, {})
    )
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([doenca, total]) => ({ doenca, total }));

    const situacao = Object.entries(
      solicitacoes.reduce((acc, item) => {
        if (item.situacao) acc[item.situacao] = (acc[item.situacao] || 0) + 1;
        return acc;
      }, {})
    ).map(([name, value]) => ({ name, value }));

    const graus = [1, 2, 3].map((grau) => ({
      grau: `Grau ${grau}`,
      total: solicitacoes.filter((item) => Number(item.grau_classificacao) === grau).length,
    }));

    const mobilidade = Object.entries(
      solicitacoes.reduce((acc, item) => {
        if (item.mobilidade) acc[item.mobilidade] = (acc[item.mobilidade] || 0) + 1;
        return acc;
      }, {})
    ).map(([name, value]) => ({ name, value }));

    const fonteRenda = Object.entries(
      solicitacoes.reduce((acc, item) => {
        const fonte = item.fonte_renda || "Nao informado";
        acc[fonte] = (acc[fonte] || 0) + 1;
        return acc;
      }, {})
    ).map(([fonte, total]) => ({ fonte, total }));

    const rendaMensal = Object.entries(
      solicitacoes.reduce((acc, item) => {
        const renda = item.renda_mensal_faixa || "Nao informado";
        acc[renda] = (acc[renda] || 0) + 1;
        return acc;
      }, {})
    ).map(([renda, total]) => ({ renda, total }));

    const faixas = [
      { faixa: "60-69", min: 60, max: 69 },
      { faixa: "70-79", min: 70, max: 79 },
      { faixa: "80-89", min: 80, max: 89 },
      { faixa: "90+", min: 90, max: 150 },
    ].map(({ faixa, min, max }) => ({
      faixa,
      total: solicitacoes.filter((item) => item.idade_idoso >= min && item.idade_idoso <= max).length,
    }));

    return { cidades, doencas, situacao, faixas, graus, mobilidade, fonteRenda, rendaMensal };
  }, [solicitacoes]);

  const idadesValidas = solicitacoes
    .map((item) => Number(item.idade_idoso))
    .filter((idade) => Number.isFinite(idade) && idade > 0);
  const idadeMedia = idadesValidas.length
    ? (idadesValidas.reduce((sum, idade) => sum + idade, 0) / idadesValidas.length).toFixed(1)
    : "0";

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-3xl border border-white/70 bg-white/80 p-6 shadow-2xl backdrop-blur">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3a5dab] to-[#e74325] shadow-lg">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Analise interna</p>
              <h1 className="text-3xl font-black tracking-tight text-slate-900">Graficos</h1>
              <p className="text-slate-600">Indicadores montados a partir dos dados coletados.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900/10">
                  <Users className="h-6 w-6 text-slate-900" />
                </div>
                <TrendingUp className="h-5 w-5 text-emerald-500" />
              </div>
              <p className="text-sm font-medium text-slate-500">Total de cadastros</p>
              <p className="text-4xl font-black text-slate-900">{isLoading ? "-" : solicitacoes.length}</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#e74325]/10">
                  <Users className="h-6 w-6 text-[#e74325]" />
                </div>
                <TrendingUp className="h-5 w-5 text-emerald-500" />
              </div>
              <p className="text-sm font-medium text-slate-500">Idade media</p>
              <p className="text-4xl font-black text-[#e74325]">{isLoading ? "-" : idadeMedia}</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-100">
                  <BarChart3 className="h-6 w-6 text-yellow-700" />
                </div>
                <span className="text-xs font-medium text-slate-500">Pendente</span>
              </div>
              <p className="text-sm font-medium text-slate-500">Aguardando</p>
              <p className="text-4xl font-black text-yellow-600">
                {isLoading ? "-" : solicitacoes.filter((item) => item.situacao === "Esperando atendimento").length}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100">
                  <BarChart3 className="h-6 w-6 text-emerald-700" />
                </div>
                <TrendingUp className="h-5 w-5 text-emerald-500" />
              </div>
              <p className="text-sm font-medium text-slate-500">Admissoes</p>
              <p className="text-4xl font-black text-emerald-600">
                {isLoading ? "-" : solicitacoes.filter((item) => item.situacao === "Admissao").length}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-0 shadow-xl">
            <CardHeader className="border-b border-slate-200">
              <CardTitle className="flex items-center gap-3 text-slate-900">
                <BarChart3 className="h-5 w-5" />
                Distribuicao por grau
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={data.graus}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="grau" tick={{ fill: "#64748b" }} />
                  <YAxis tick={{ fill: "#64748b" }} />
                  <Tooltip />
                  <Bar dataKey="total" fill="#0f766e" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardHeader className="border-b border-slate-200">
              <CardTitle className="flex items-center gap-3 text-slate-900">
                <BarChart3 className="h-5 w-5" />
                Mobilidade
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={data.mobilidade}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${String(name).slice(0, 18)}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    dataKey="value"
                  >
                    {data.mobilidade.map((entry, index) => (
                      <Cell key={`mobilidade-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-0 shadow-xl">
            <CardHeader className="border-b border-slate-200">
              <CardTitle className="flex items-center gap-3 text-slate-900">
                <MapPin className="h-5 w-5" />
                Cidades que mais solicitam
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={data.cidades}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="cidade" tick={{ fill: "#64748b" }} />
                  <YAxis tick={{ fill: "#64748b" }} />
                  <Tooltip />
                  <Bar dataKey="total" fill="#3a5dab" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardHeader className="border-b border-slate-200">
              <CardTitle className="flex items-center gap-3 text-slate-900">
                <BarChart3 className="h-5 w-5" />
                Distribuicao por faixa etaria
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={data.faixas}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="faixa" tick={{ fill: "#64748b" }} />
                  <YAxis tick={{ fill: "#64748b" }} />
                  <Tooltip />
                  <Bar dataKey="total" fill="#e74325" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-0 shadow-xl">
            <CardHeader className="border-b border-slate-200">
              <CardTitle className="flex items-center gap-3 text-slate-900">
                <BarChart3 className="h-5 w-5" />
                Fonte de renda
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={data.fonteRenda}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="fonte" tick={{ fill: "#64748b" }} />
                  <YAxis tick={{ fill: "#64748b" }} />
                  <Tooltip />
                  <Bar dataKey="total" fill="#7c2d12" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardHeader className="border-b border-slate-200">
              <CardTitle className="flex items-center gap-3 text-slate-900">
                <BarChart3 className="h-5 w-5" />
                Renda mensal
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={data.rendaMensal} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" tick={{ fill: "#64748b" }} />
                  <YAxis dataKey="renda" type="category" width={150} tick={{ fill: "#64748b" }} />
                  <Tooltip />
                  <Bar dataKey="total" fill="#e74325" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-0 shadow-xl">
            <CardHeader className="border-b border-slate-200">
              <CardTitle className="flex items-center gap-3 text-slate-900">
                <BarChart3 className="h-5 w-5" />
                Doencas mais frequentes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={data.doencas} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" tick={{ fill: "#64748b" }} />
                  <YAxis dataKey="doenca" type="category" width={120} tick={{ fill: "#64748b" }} />
                  <Tooltip />
                  <Bar dataKey="total" fill="#4a6dbb" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl">
            <CardHeader className="border-b border-slate-200">
              <CardTitle className="flex items-center gap-3 text-slate-900">
                <BarChart3 className="h-5 w-5" />
                Situacao dos cadastros
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={data.situacao}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${String(name).split(" ")[0]}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    dataKey="value"
                  >
                    {data.situacao.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
