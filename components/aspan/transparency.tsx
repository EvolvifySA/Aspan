import { FileText, Download, ShieldCheck } from 'lucide-react'
import { Reveal } from '@/components/reveal'

export function Transparency() {
  return (
    <section id="transparencia" className="px-4 py-16 md:py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] border border-border bg-card/50 p-8 md:p-12">
            <div
              aria-hidden
              className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-accent/15 blur-3xl"
            />
            <div className="relative grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-center">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-accent/15 px-4 py-1.5 text-sm font-semibold text-accent">
                  <ShieldCheck className="h-4 w-4" />
                  Transparência
                </span>
                <h2 className="mt-5 font-[family-name:var(--font-poppins)] text-3xl font-bold leading-tight tracking-tight text-balance md:text-4xl">
                  Repasses estaduais
                </h2>
                <div className="mt-5 flex flex-col gap-4 text-base leading-relaxed text-muted-foreground text-pretty">
                  <p>
                    É com satisfação que reforçamos nosso compromisso com a
                    transparência em todas as ações do lar de idosos ASPAN. Este
                    espaço destaca nossos projetos atuais, oferecendo uma visão
                    concisa de cada iniciativa.
                  </p>
                  <p>
                    Baixe nosso arquivo em PDF para acessar a documentação
                    completa de cada projeto, com as informações requeridas pela
                    Lei nº 12.869 de 07 de novembro de 2023.
                  </p>
                  <p>
                    Agradecemos sua confiança e apoio contínuo. Juntos,
                    construímos um futuro mais transparente e participativo.
                  </p>
                </div>
              </div>

              <div className="rounded-[2rem] border border-border bg-background/60 p-7 text-center backdrop-blur">
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-accent/15 text-accent">
                  <FileText className="h-8 w-8" />
                </span>
                <h3 className="mt-5 font-[family-name:var(--font-poppins)] text-lg font-semibold text-foreground">
                  Documentação completa
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Acesse o PDF com todos os detalhes dos repasses e projetos.
                </p>
                <a
                  href="https://www.aspan.com.br/assets/transparencia.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-accent px-6 py-3.5 text-base font-semibold text-accent-foreground shadow-lg shadow-accent/25 transition-all hover:scale-[1.02]"
                >
                  <Download className="h-5 w-5" />
                  Baixar PDF
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
