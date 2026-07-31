import Image from 'next/image'
import { Heart, ArrowRight, Sparkles } from 'lucide-react'
import { Reveal } from '@/components/reveal'

export function Hero() {
  return (
    <section
      id="inicio"
      className="relative overflow-hidden px-4 pb-16 pt-32 md:pb-24 md:pt-40"
    >
      {/* soft glows */}
      <div
        aria-hidden
        className="animate-pulse-soft pointer-events-none absolute -left-32 top-24 h-96 w-96 rounded-full bg-primary/20 blur-[120px]"
      />
      <div
        aria-hidden
        className="animate-pulse-soft pointer-events-none absolute -right-24 top-52 h-80 w-80 rounded-full bg-accent/20 blur-[120px]"
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <div>
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-4 py-1.5 text-sm font-medium text-muted-foreground backdrop-blur">
              <Sparkles className="h-4 w-4 text-primary" />
              Cuidado e dignidade desde 1994
            </span>
          </Reveal>

          <Reveal delay={80}>
            <h1 className="mt-6 font-[family-name:var(--font-poppins)] text-4xl font-extrabold leading-[1.05] tracking-tight text-balance md:text-6xl">
              Ajudar faz toda a{' '}
              <span className="text-primary">diferença</span>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground text-pretty">
              A ASPAN acolhe idosos com amor, oferecendo atendimento
              multiprofissional, atividades e um convívio de qualidade. Junte-se
              a nós e transforme vidas.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#doar"
                className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground shadow-xl shadow-primary/30 transition-all hover:scale-105 hover:shadow-primary/50"
              >
                <Heart className="h-5 w-5 fill-current" />
                Quero doar
              </a>
              <a
                href="/solicitacao-vaga"
                className="group inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-6 py-3.5 text-base font-semibold text-foreground backdrop-blur transition-all hover:bg-secondary"
              >
                Solicitar uma vaga
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </Reveal>

          <Reveal delay={320}>
            <dl className="mt-12 grid max-w-md grid-cols-3 gap-4">
              {[
                { n: '+30', l: 'anos de história' },
                { n: '+120', l: 'idosos acolhidos' },
                { n: '+40', l: 'voluntários ativos' },
              ].map((s) => (
                <div key={s.l}>
                  <dt className="font-[family-name:var(--font-poppins)] text-3xl font-bold text-foreground">
                    {s.n}
                  </dt>
                  <dd className="mt-1 text-sm text-muted-foreground">{s.l}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <Reveal delay={200} className="relative">
          <div className="animate-float-slow relative overflow-hidden rounded-[2.5rem] border border-border shadow-2xl shadow-accent/15">
            <Image
              src="/images/hero.jpg"
              alt="Cuidadora sorrindo e segurando as mãos de uma idosa em um lar acolhedor"
              width={720}
              height={820}
              priority
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
          </div>

          <div className="absolute -bottom-5 -left-4 flex items-center gap-3 rounded-3xl border border-border bg-card/90 px-5 py-4 shadow-xl backdrop-blur-xl md:-left-8">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <Heart className="h-6 w-6 fill-current" />
            </span>
            <div>
              <p className="font-[family-name:var(--font-poppins)] text-sm font-bold text-foreground">
                Feito com amor
              </p>
              <p className="text-xs text-muted-foreground">
                Cada gesto conta muito
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
