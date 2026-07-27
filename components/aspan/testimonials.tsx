import { Quote } from 'lucide-react'
import { Reveal } from '@/components/reveal'

const testimonials = [
  {
    name: 'Eva',
    role: 'Benfeitora',
    initial: 'E',
    text: 'Contribuir com a ASPAN é ver o amor em ação. Sei exatamente onde a minha doação chega: no sorriso de cada idoso.',
  },
  {
    name: 'Ivone Dutra',
    role: 'Residente',
    initial: 'I',
    text: 'Aqui eu encontrei uma nova família. Sou tratada com respeito e carinho todos os dias. Me sinto em casa.',
  },
  {
    name: 'Mayane Machado',
    role: 'Enfermeira',
    initial: 'M',
    text: 'Trabalhar na ASPAN é uma missão de amor. Ver a evolução e a alegria dos nossos idosos não tem preço.',
  },
  {
    name: 'Irmã Juliana Barros',
    role: 'Missionária religiosa',
    initial: 'J',
    text: 'A dedicação de toda a equipe transforma esse lugar em um verdadeiro lar de acolhimento e esperança.',
  },
  {
    name: 'Fernanda',
    role: 'Fisioterapeuta voluntária',
    initial: 'F',
    text: 'Cada sessão é uma troca. Levo cuidado e recebo de volta histórias e gratidão que enchem o coração.',
  },
]

export function Testimonials() {
  return (
    <section id="depoimentos" className="px-4 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-primary">
            Depoimentos
          </span>
          <h2 className="mt-3 font-[family-name:var(--font-poppins)] text-3xl font-bold leading-tight tracking-tight text-balance md:text-4xl">
            Histórias de quem vive a ASPAN
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={(i % 3) * 90}>
              <figure className="flex h-full flex-col rounded-[2rem] border border-border bg-card/50 p-6 transition-all hover:-translate-y-1 hover:border-primary/40 hover:bg-card hover:shadow-xl hover:shadow-accent/10">
                <Quote className="h-8 w-8 text-primary/40" />
                <blockquote className="mt-4 flex-1 text-base leading-relaxed text-foreground">
                  “{t.text}”
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-5">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 font-[family-name:var(--font-poppins)] font-bold text-primary">
                    {t.initial}
                  </span>
                  <div>
                    <p className="font-[family-name:var(--font-poppins)] text-sm font-semibold text-foreground">
                      {t.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
