import { Reveal } from '@/components/reveal'

export function VideoSection() {
  return (
    <section id="video" className="px-4 py-16 md:py-24">
      <div className="mx-auto max-w-5xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-widest text-primary">
            Um recado especial
          </span>
          <h2 className="mt-3 font-[family-name:var(--font-poppins)] text-3xl font-bold leading-tight tracking-tight text-balance md:text-4xl">
            Conheça a ASPAN de perto
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground text-pretty">
            Assista ao vídeo e veja como é o dia a dia da nossa casa e o carinho
            que dedicamos a cada idoso.
          </p>
        </Reveal>

        <Reveal delay={120} className="mt-10">
          <div className="overflow-hidden rounded-[2.5rem] border border-border shadow-2xl shadow-accent/15">
            <div className="relative aspect-video w-full">
              <iframe
                className="absolute inset-0 h-full w-full"
                src="https://www.youtube.com/embed/tSd5c7hSQk0"
                title="Vídeo institucional da ASPAN"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
