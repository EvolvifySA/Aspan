import Link from 'next/link'
import { Camera, ArrowRight } from 'lucide-react'
import { Reveal } from '@/components/reveal'

export function UpdatesCta() {
  return (
    <section className="px-4 py-10 md:py-14">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="flex flex-col items-center justify-between gap-6 rounded-[2.5rem] border border-accent/30 bg-accent/10 p-8 text-center md:flex-row md:p-10 md:text-left">
            <div className="flex items-center gap-5">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-accent text-accent-foreground shadow-xl shadow-accent/30">
                <Camera className="h-8 w-8" />
              </span>
              <div>
                <h2 className="font-[family-name:var(--font-poppins)] text-2xl font-bold leading-tight tracking-tight text-balance md:text-3xl">
                  Acompanhe nossas últimas atualizações
                </h2>
                <p className="mt-2 leading-relaxed text-muted-foreground text-pretty">
                  Veja fotos e novidades do dia a dia da ASPAN, como um feed de
                  posts.
                </p>
              </div>
            </div>
            <Link
              href="/atualizacoes"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-accent px-7 py-4 text-base font-semibold text-accent-foreground shadow-lg shadow-accent/25 transition-all hover:scale-105"
            >
              Ver atualizações
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
