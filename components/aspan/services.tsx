import Image from 'next/image'
import { Stethoscope, Activity, Smile, Sparkles } from 'lucide-react'
import { Reveal } from '@/components/reveal'

const services = [
  {
    icon: Stethoscope,
    image: '/images/servico-multiprofissional.png',
    title: 'Atendimento multiprofissional',
    text: 'Equipe de saúde completa acompanhando cada residente de perto, todos os dias.',
  },
  {
    icon: Activity,
    image: '/images/servico-atividades.png',
    title: 'Atividades acompanhadas',
    text: 'Fisioterapia, recreação e estímulos que promovem autonomia e bem-estar.',
  },
  {
    icon: Smile,
    image: '/images/servico-convivio.png',
    title: 'Convívio agradável',
    text: 'Ambiente acolhedor com qualidade de vida, amizade e momentos felizes.',
  },
  {
    icon: Sparkles,
    image: '/images/servico-digno.png',
    title: 'Tratamento digno',
    text: 'Respeito e cuidado individualizado, valorizando a história de cada pessoa.',
  },
]

export function Services() {
  return (
    <section id="servicos" className="px-4 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-primary">
            Nossos serviços
          </span>
          <h2 className="mt-3 font-[family-name:var(--font-poppins)] text-3xl font-bold leading-tight tracking-tight text-balance md:text-4xl">
            Cuidado completo em cada detalhe
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground text-pretty">
            Oferecemos uma estrutura pensada para o conforto, a saúde e a
            felicidade dos nossos idosos.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s, i) => (
            <Reveal key={s.title} delay={i * 80}>
              <article className="group flex h-full flex-col overflow-hidden rounded-[2rem] border border-border bg-card/50 transition-all hover:-translate-y-1 hover:border-primary/40 hover:bg-card hover:shadow-xl hover:shadow-accent/10">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={s.image || '/placeholder.svg'}
                    alt={s.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card/70 to-transparent" />
                  <span className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
                    <s.icon className="h-5 w-5" />
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-[family-name:var(--font-poppins)] text-lg font-semibold leading-snug text-foreground">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {s.text}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
