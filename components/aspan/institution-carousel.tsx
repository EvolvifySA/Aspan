'use client'

import { useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Reveal } from '@/components/reveal'
import { cn } from '@/lib/utils'

// Adicione ou substitua as fotos manualmente aqui.
// Coloque os arquivos em /public/images e informe o caminho em `src`.
const photos = [
  { src: '/images/galeria-15.webp', alt: 'Leitura em conjunto' },
  { src: '/images/galeria12.webp', alt: 'Senhora feliz' },
  { src: '/images/galeria4.jpg', alt: '' },
  { src: '/images/galeria3.jpg', alt: '' },
  { src: '/images/galeria5.jpg', alt: 'Dia de benção' },
  { src: '/images/galeria6.jpg', alt: 'Conhecendo o aquário' },
  { src: '/images/galeria7.jpg', alt: 'Torcendo pra copa' },
  { src: '/images/galeria1.jpg', alt: 'Evento especial' },
]

export function InstitutionCarousel() {
  const [current, setCurrent] = useState(0)

  const next = useCallback(
    () => setCurrent((c) => (c + 1) % photos.length),
    [],
  )
  const prev = useCallback(
    () => setCurrent((c) => (c - 1 + photos.length) % photos.length),
    [],
  )

  useEffect(() => {
    const id = setInterval(next, 5000)
    return () => clearInterval(id)
  }, [next])

  return (
    <section id="instituicao" className="px-4 py-16 md:py-24">
      <div className="mx-auto max-w-5xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-primary">
            Conheça
          </span>
          <h2 className="mt-3 font-[family-name:var(--font-poppins)] text-3xl font-bold leading-tight tracking-tight text-balance md:text-4xl">
            Nossa instituição
          </h2>
        </Reveal>

        <Reveal delay={120} className="mt-10">
          <div className="relative overflow-hidden rounded-[2.5rem] border border-border shadow-2xl shadow-accent/15">
            <div className="relative aspect-[16/10] w-full sm:aspect-[16/9]">
              {photos.map((photo, i) => (
                <Image
                  key={photo.src}
                  src={photo.src || '/placeholder.svg'}
                  alt={photo.alt}
                  fill
                  className={cn(
                    'object-cover transition-opacity duration-700',
                    i === current ? 'opacity-100' : 'opacity-0',
                  )}
                  priority={i === 0}
                />
              ))}

              <button
                type="button"
                onClick={prev}
                aria-label="Foto anterior"
                className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card/80 text-foreground backdrop-blur-xl transition-all hover:scale-105 hover:bg-card"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Próxima foto"
                className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card/80 text-foreground backdrop-blur-xl transition-all hover:scale-105 hover:bg-card"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                {photos.map((photo, i) => (
                  <button
                    key={photo.src}
                    type="button"
                    onClick={() => setCurrent(i)}
                    aria-label={`Ir para a foto ${i + 1}`}
                    className={cn(
                      'h-2.5 rounded-full transition-all',
                      i === current
                        ? 'w-8 bg-primary'
                        : 'w-2.5 bg-card/80 hover:bg-card',
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
