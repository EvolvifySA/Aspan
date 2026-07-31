'use client'

import { Fragment, useState } from 'react'
import Image from 'next/image'
import { PlayCircle, Quote } from 'lucide-react'
import { Reveal } from '@/components/reveal'
import { cn } from '@/lib/utils'

const testimonials = [
  {
    name: 'Eva',
    role: 'Benfeitora',
    text: 'Contribuir com a ASPAN é ver o amor em ação. Sei exatamente onde a minha doação chega: no sorriso de cada idoso.',
    photo: '/images/eva.webp',
    videoId: 'K2bN-simzZQ',
  },
  {
    name: 'Ivone Dutra',
    role: 'Residente',
    text: 'Aqui eu encontrei uma nova família. Sou tratada com respeito e carinho todos os dias. Me sinto em casa.',
    photo: '/images/ivone.webp',
    videoId: '9Olmi-yqsIc',
  },
  {
    name: 'Mayane Machado',
    role: 'Enfermeira',
    text: 'Trabalhar na ASPAN é uma missão de amor. Ver a evolução e a alegria dos nossos idosos não tem preço.',
    photo: '/images/mayane.webp',
    videoId: 'u1yQbe8yTIo',
  },
  {
    name: 'Irmã Juliana Barros',
    role: 'Missionária religiosa',
    text: 'A dedicação de toda a equipe transforma esse lugar em um verdadeiro lar de acolhimento e esperança.',
    photo: '/images/irmajuliana.webp',
    videoId: 'DEDC2n8pCSA',
  },
  {
    name: 'Fernanda',
    role: 'Fisioterapeuta voluntária',
    text: 'Cada sessão é uma troca. Levo cuidado e recebo de volta histórias e gratidão que enchem o coração.',
    photo: '/images/fernanda.webp',
    videoId: 'QRouF3KnDwA',
  },
]

export function Testimonials() {
  const [openVideo, setOpenVideo] = useState<string | null>(null)

  function toggleVideo(name: string) {
    setOpenVideo((current) => (current === name ? null : name))
  }

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
          {testimonials.map((t, i) => {
            const isOpen = openVideo === t.name

            return (
              <Fragment key={t.name}>
                <Reveal delay={(i % 3) * 90}>
                  <article
                    className={cn(
                      'relative flex h-full flex-col rounded-[2rem] border border-border bg-card/50 p-6 transition-all hover:-translate-y-1 hover:border-primary/40 hover:bg-card hover:shadow-xl hover:shadow-accent/10',
                      isOpen &&
                        'z-10 -translate-y-1 border-primary/50 bg-card shadow-xl shadow-primary/10',
                    )}
                  >
                    {isOpen && (
                      <span className="animate-video-bridge pointer-events-none absolute left-1/2 -bottom-5 h-5 w-1 rounded-full bg-gradient-to-b from-primary/60 to-accent/30" />
                    )}

                    <button
                      type="button"
                      onClick={() => toggleVideo(t.name)}
                      className="flex w-full flex-1 flex-col text-left"
                      aria-expanded={isOpen}
                      aria-controls={`video-${t.videoId}`}
                    >
                      <Quote className="h-8 w-8 text-primary/40" />
                      <blockquote className="mt-4 flex-1 text-base leading-relaxed text-foreground">
                        "{t.text}"
                      </blockquote>
                      <div className="mt-6 flex items-center gap-3 border-t border-border pt-5">
                        <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-primary/15 bg-primary/10">
                          <Image
                            src={t.photo}
                            alt={`Foto de ${t.name}`}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="font-[family-name:var(--font-poppins)] text-sm font-semibold text-foreground">
                            {t.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {t.role}
                          </p>
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleVideo(t.name)}
                      className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:scale-105"
                      aria-expanded={isOpen}
                      aria-controls={`video-${t.videoId}`}
                    >
                      <PlayCircle className="h-4 w-4" />
                      {isOpen ? 'Ocultar depoimento' : 'Veja o depoimento'}
                    </button>
                  </article>
                </Reveal>

                {isOpen && (
                  <Reveal
                    key={`${t.name}-video`}
                    className="md:col-span-2 lg:col-span-3"
                  >
                    <div
                      id={`video-${t.videoId}`}
                      className="animate-video-drop-open mx-auto w-full max-w-5xl overflow-hidden rounded-[2rem] border border-primary/20 bg-black shadow-2xl shadow-accent/10"
                    >
                      <iframe
                        className="aspect-video w-full"
                        src={`https://www.youtube.com/embed/${t.videoId}?controls=0&modestbranding=1&rel=0&playsinline=1`}
                        title={`Depoimento de ${t.name}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  </Reveal>
                )}
              </Fragment>
            )
          })}
        </div>
      </div>
    </section>
  )
}
