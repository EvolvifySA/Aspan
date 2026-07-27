import { Users2, CalendarHeart, HandHeart, Dumbbell } from 'lucide-react'
import { Reveal } from '@/components/reveal'

const benefits = [
  {
    icon: Users2,
    title: 'Atendimento multiprofissional',
    text: 'Médicos, enfermeiros, fisioterapeutas e cuidadores atuando em conjunto.',
  },
  {
    icon: CalendarHeart,
    title: 'Atividades acompanhadas',
    text: 'Rotina de atividades planejadas e supervisionadas por especialistas.',
  },
  {
    icon: HandHeart,
    title: 'Tratamento digno',
    text: 'Respeito, afeto e cuidado individualizado para cada idoso.',
  },
  {
    icon: Dumbbell,
    title: 'Atividades para desenvolvimento',
    text: 'Estímulos físicos e cognitivos que promovem autonomia e bem-estar.',
  },
]

export function Benefits() {
  return (
    <section className="px-4 py-16 md:py-20">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-accent">
            Benefícios
          </span>
          <h2 className="mt-3 font-[family-name:var(--font-poppins)] text-3xl font-bold leading-tight tracking-tight text-balance md:text-4xl">
            O que a ASPAN oferece
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((b, i) => (
            <Reveal key={b.title} delay={i * 80}>
              <div className="flex h-full flex-col items-center rounded-[2rem] border border-border bg-card/50 p-7 text-center transition-all hover:-translate-y-1 hover:border-accent/40 hover:bg-card">
                <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-accent/15 text-accent">
                  <b.icon className="h-8 w-8" />
                </span>
                <h3 className="mt-5 font-[family-name:var(--font-poppins)] text-base font-semibold leading-snug text-foreground">
                  {b.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {b.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
