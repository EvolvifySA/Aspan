import { Droplets, Check } from 'lucide-react'
import { Reveal } from '@/components/reveal'

const steps = [
  'Ligue para a Central de Atendimento da CAGEPA',
  'Ou utilize o aplicativo da CAGEPA',
  'Assine o termo de adesão e faça sua doação mensal',
]

export function Campaign() {
  return (
    <section className="px-4 py-10 md:py-16">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] border border-accent/30 bg-accent/10 p-8 md:p-12">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-accent/20 blur-3xl"
            />
            <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-accent/15 px-4 py-1.5 text-sm font-semibold text-accent">
                  <Droplets className="h-4 w-4 text-accent" />
                  Campanha Seja uma Gota
                </span>
                <h2 className="mt-5 font-[family-name:var(--font-poppins)] text-3xl font-bold leading-tight tracking-tight text-balance md:text-4xl">
                  Faça a diferença na sua conta de água
                </h2>
                <p className="mt-4 text-lg leading-relaxed text-muted-foreground text-pretty">
                  Uma pequena contribuição mensal na sua conta da CAGEPA se
                  transforma em cuidado, alimento e carinho para os idosos da
                  ASPAN. Cada gota conta.
                </p>
                <a
                  href="#doar"
                  className="mt-7 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3.5 text-base font-semibold text-accent-foreground shadow-lg shadow-accent/25 transition-all hover:scale-105"
                >
                  <Droplets className="h-5 w-5" />
                  Quero ser uma gota
                </a>
              </div>

              <ol className="flex flex-col gap-3">
                {steps.map((step, i) => (
                  <Reveal as="li" key={step} delay={i * 100}>
                    <div className="flex items-center gap-4 rounded-3xl border border-border bg-card/60 p-5 backdrop-blur">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-accent/20 font-[family-name:var(--font-poppins)] text-sm font-bold text-accent">
                        {i + 1}
                      </span>
                      <p className="text-sm font-medium text-foreground">
                        {step}
                      </p>
                      <Check className="ml-auto h-5 w-5 shrink-0 text-accent" />
                    </div>
                  </Reveal>
                ))}
              </ol>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
