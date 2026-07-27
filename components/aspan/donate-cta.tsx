'use client'

import { useState } from 'react'
import {
  Heart,
  HandHeart,
  Utensils,
  Banknote,
  HeartHandshake,
  Copy,
  Check,
} from 'lucide-react'
import { Reveal } from '@/components/reveal'

const PIX_KEY = '08.558.819/0001-80'

const ways = [
  {
    icon: Utensils,
    text: 'Doações de alimentos, fraldas geriátricas, produtos de higiene pessoal e de limpeza.',
  },
  {
    icon: Banknote,
    text: 'Doações financeiras via PIX ou transferência bancária.',
  },
  {
    icon: HeartHandshake,
    text: 'Voluntariado, dedicando seu tempo e carinho aos nossos idosos.',
  },
]

export function DonateCta() {
  const [copied, setCopied] = useState(false)

  const copyPix = async () => {
    try {
      await navigator.clipboard.writeText(PIX_KEY)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <section id="doar" className="px-4 py-16 md:py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] border border-primary/30 bg-primary/10 px-6 py-14 md:px-16 md:py-16">
            <div
              aria-hidden
              className="animate-pulse-soft pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/25 blur-[100px]"
            />
            <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary text-primary-foreground shadow-xl shadow-primary/40">
                  <HandHeart className="h-8 w-8" />
                </span>
                <h2 className="mt-6 font-[family-name:var(--font-poppins)] text-3xl font-bold leading-tight tracking-tight text-balance md:text-4xl">
                  Ajude a ASPAN e torne-se um apoiador
                </h2>
                <p className="mt-4 text-lg leading-relaxed text-muted-foreground text-pretty">
                  Existem várias formas de ajudar a ASPAN. Veja algumas delas e
                  entre em contato conosco para saber mais.
                </p>

                <ul className="mt-6 flex flex-col gap-3">
                  {ways.map((w) => (
                    <li
                      key={w.text}
                      className="flex items-start gap-3 rounded-2xl border border-border bg-card/50 p-4"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                        <w.icon className="h-4 w-4" />
                      </span>
                      <p className="text-sm leading-relaxed text-foreground">
                        {w.text}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>

              {/* PIX card */}
              <div className="rounded-[2rem] border border-border bg-card/70 p-7 backdrop-blur">
                <h3 className="font-[family-name:var(--font-poppins)] text-xl font-bold text-foreground">
                  Doe pelo PIX
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Use a chave PIX (CNPJ) abaixo para fazer sua doação com
                  segurança e rapidez.
                </p>

                <div className="mt-5 rounded-2xl border border-primary/30 bg-primary/10 p-4">
                  <p className="text-xs font-medium uppercase tracking-widest text-primary">
                    Chave PIX (CNPJ)
                  </p>
                  <p className="mt-1 font-[family-name:var(--font-poppins)] text-xl font-bold text-foreground">
                    {PIX_KEY}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={copyPix}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:scale-[1.02]"
                >
                  {copied ? (
                    <>
                      <Check className="h-5 w-5" />
                      Chave copiada!
                    </>
                  ) : (
                    <>
                      <Copy className="h-5 w-5" />
                      Copiar chave PIX
                    </>
                  )}
                </button>

                <a
                  href="#contato"
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-background/60 px-6 py-3.5 text-base font-semibold text-foreground transition-all hover:bg-secondary"
                >
                  <Heart className="h-5 w-5" />
                  Quero ser voluntário
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
