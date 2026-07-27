'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  ShieldCheck,
  HeartHandshake,
  Users,
  ChevronDown,
} from 'lucide-react'
import { Reveal } from '@/components/reveal'
import { cn } from '@/lib/utils'

const pillars = [
  {
    icon: HeartHandshake,
    title: 'Acolhimento humano',
    text: 'Tratamos cada idoso com respeito, carinho e a dignidade que merecem.',
  },
  {
    icon: ShieldCheck,
    title: 'Transparência total',
    text: 'Prestação de contas clara dos repasses e doações recebidas.',
  },
  {
    icon: Users,
    title: 'Equipe dedicada',
    text: 'Profissionais e voluntários comprometidos com o bem-estar de todos.',
  },
]

export function About() {
  const [expanded, setExpanded] = useState(false)

  return (
    <section id="quem-somos" className="px-4 py-20 md:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <Reveal className="relative order-2 lg:order-1">
          <div className="overflow-hidden rounded-[2.5rem] border border-border shadow-2xl shadow-accent/15">
            <Image
              src="/images/quem-somos.png"
              alt="Grupo de idosos participando de uma atividade em grupo com uma enfermeira"
              width={700}
              height={560}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="absolute -right-3 -top-5 rounded-3xl border border-border bg-card/90 px-5 py-4 shadow-xl backdrop-blur-xl md:-right-6">
            <p className="font-[family-name:var(--font-poppins)] text-2xl font-bold text-primary">
              1983
            </p>
            <p className="text-xs text-muted-foreground">fundação da ASPAN</p>
          </div>
        </Reveal>

        <div className="order-1 lg:order-2">
          <Reveal>
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">
              Quem somos
            </span>
            <h2 className="mt-3 font-[family-name:var(--font-poppins)] text-3xl font-bold leading-tight tracking-tight text-balance md:text-4xl">
              Uma casa cheia de amor para quem tanto cuidou de nós
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground text-pretty">
              A Associação Promocional do Ancião Dr. João Meira de Menezes —
              ASPAN foi fundada em 10 de março de 1983 para prestar serviços de
              apoio ao idoso na cidade de João Pessoa, Paraíba. Somos uma
              Instituição de Longa Permanência para Idosos (ILPI), pessoa
              jurídica de direito privado sem fins lucrativos.
            </p>
          </Reveal>

          <div
            className={cn(
              'grid transition-all duration-500 ease-out',
              expanded
                ? 'grid-rows-[1fr] opacity-100'
                : 'grid-rows-[0fr] opacity-0',
            )}
          >
            <div className="overflow-hidden">
              <div className="mt-4 flex flex-col gap-4 text-base leading-relaxed text-muted-foreground text-pretty">
                <p>
                  A ASPAN tem como principal objetivo atender a população idosa
                  de baixa renda da cidade de João Pessoa, com caráter
                  filantrópico, organizacional, assistencial e promocional, sem
                  qualquer caráter político ou partidário.
                </p>
                <p>
                  Ao longo de sua existência, tendo atendido mais de 1500
                  pessoas idosas, a ASPAN conquistou a credibilidade da
                  sociedade civil e dos Poderes Instituídos. Sua qualidade na
                  prestação dos serviços conferiu à organização o reconhecimento
                  de utilidade pública estadual e municipal.
                </p>
                <p>
                  Suas atividades inscritas no CMDI-JP, no CMAS-JP e
                  certificada pelo CEBAS (Ministério da Cidadania) viabilizaram
                  sólidas parcerias, que possibilitam o funcionamento
                  ininterrupto da instituição.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-5 py-2.5 text-sm font-semibold text-foreground transition-all hover:border-primary/40 hover:bg-secondary"
          >
            {expanded ? 'Ler menos' : 'Saiba mais'}
            <ChevronDown
              className={cn(
                'h-4 w-4 transition-transform duration-300',
                expanded && 'rotate-180',
              )}
            />
          </button>

          <div className="mt-8 flex flex-col gap-4">
            {pillars.map((p, i) => (
              <Reveal key={p.title} delay={i * 100}>
                <div className="flex items-start gap-4 rounded-3xl border border-border bg-card/50 p-5 transition-colors hover:border-primary/40 hover:bg-card">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                    <p.icon className="h-6 w-6" />
                  </span>
                  <div>
                    <h3 className="font-[family-name:var(--font-poppins)] text-lg font-semibold text-foreground">
                      {p.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {p.text}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
