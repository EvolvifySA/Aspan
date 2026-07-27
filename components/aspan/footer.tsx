'use client'

import { useState } from 'react'
import { Mail, Phone, MapPin, Globe, Send, Play, Share2 } from 'lucide-react'
import { AspanLogo } from './logo'
import { Reveal } from '@/components/reveal'

const contacts = [
  { icon: Mail, label: 'contato@aspan.com.br', href: 'mailto:contato@aspan.com.br' },
  { icon: Phone, label: '(83) 98794-8792', href: 'tel:+5583987948792' },
  { icon: Phone, label: '(83) 3223-2163', href: 'tel:+558332232163' },
]

const socials = [
  { icon: Share2, label: 'Instagram @aspanassociacao', href: '#' },
  { icon: Globe, label: 'Facebook @associacaopromocionaldoanciao', href: '#' },
  { icon: Play, label: 'ASPAN no YouTube', href: '#' },
]

export function Footer() {
  const [sent, setSent] = useState(false)

  return (
    <footer id="contato" className="px-4 pb-10 pt-16 md:pt-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 rounded-[2.5rem] border border-border bg-card/50 p-6 md:p-10 lg:grid-cols-2">
          {/* Contact info */}
          <Reveal>
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">
              Contato
            </span>
            <h2 className="mt-3 font-[family-name:var(--font-poppins)] text-3xl font-bold leading-tight tracking-tight text-balance md:text-4xl">
              Fale com a gente
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground text-pretty">
              Estamos à disposição para tirar dúvidas, receber doações e acolher
              quem precisa. Entre em contato pelos canais abaixo.
            </p>

            <ul className="mt-8 flex flex-col gap-3">
              {contacts.map((c) => (
                <li key={c.label}>
                  <a
                    href={c.href}
                    className="flex items-center gap-3 rounded-2xl border border-border bg-secondary/40 px-4 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-secondary"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
                      <c.icon className="h-4 w-4" />
                    </span>
                    {c.label}
                  </a>
                </li>
              ))}
              <li className="flex items-start gap-3 rounded-2xl border border-border bg-secondary/40 px-4 py-3 text-sm font-medium text-foreground">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <MapPin className="h-4 w-4" />
                </span>
                R. Antônio Correia de Matos, 55 — Cristo Redentor, João Pessoa —
                PB, 58071-310
              </li>
            </ul>

            <div className="mt-6 flex flex-wrap gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-secondary/40 text-muted-foreground transition-all hover:scale-105 hover:border-primary/40 hover:text-primary"
                >
                  <s.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </Reveal>

          {/* Contact form */}
          <Reveal delay={120}>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                setSent(true)
              }}
              className="flex flex-col gap-4 rounded-[2rem] border border-border bg-background/60 p-6 backdrop-blur"
            >
              <h3 className="font-[family-name:var(--font-poppins)] text-lg font-semibold text-foreground">
                Envie uma mensagem
              </h3>
              <input
                required
                type="text"
                placeholder="Seu nome"
                className="rounded-2xl border border-border bg-secondary/40 px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
              />
              <input
                required
                type="email"
                placeholder="Seu e-mail"
                className="rounded-2xl border border-border bg-secondary/40 px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
              />
              <input
                required
                type="text"
                placeholder="Assunto"
                className="rounded-2xl border border-border bg-secondary/40 px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
              />
              <textarea
                required
                rows={4}
                placeholder="Sua mensagem"
                className="resize-none rounded-2xl border border-border bg-secondary/40 px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:scale-[1.02]"
              >
                <Send className="h-4 w-4" />
                {sent ? 'Mensagem enviada!' : 'Enviar mensagem'}
              </button>
              {sent && (
                <p className="text-center text-sm text-muted-foreground">
                  Obrigado! Em breve entraremos em contato.
                </p>
              )}
            </form>
          </Reveal>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-sm text-muted-foreground md:flex-row">
          <AspanLogo />
          <p className="text-center">
            © {new Date().getFullYear()} ASPAN — Associação Promocional do
            Ancião. Feito com amor.
          </p>
        </div>
      </div>
    </footer>
  )
}
