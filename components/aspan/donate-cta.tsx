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
  Loader2,
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
  const [amount, setAmount] = useState('')
  const [donorName, setDonorName] = useState('')
  const [donorPhone, setDonorPhone] = useState('')
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [startingCheckout, setStartingCheckout] = useState(false)

  const copyPix = async () => {
    try {
      await navigator.clipboard.writeText(PIX_KEY)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  const startCheckout = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setCheckoutError(null)
    setStartingCheckout(true)
    try {
      const response = await fetch('/api/donations/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, name: donorName, phone: donorPhone }),
      })
      const result = await response.json() as { checkoutUrl?: string; error?: string }
      if (!response.ok || !result.checkoutUrl) {
        throw new Error(result.error || 'Não foi possível iniciar o checkout.')
      }
      window.location.assign(result.checkoutUrl)
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : 'Não foi possível iniciar o checkout.')
      setStartingCheckout(false)
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
                  Doe online com o Mercado Pago
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Informe o valor que deseja doar. Nome e telefone são opcionais.
                </p>
                <form onSubmit={startCheckout} className="mt-5 flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="donation-amount" className="text-sm font-medium text-foreground">
                      Valor da doação
                    </label>
                    <div className="flex items-center rounded-xl border border-input bg-background px-4 focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30">
                      <span className="text-sm text-muted-foreground">R$</span>
                      <input
                        id="donation-amount"
                        type="number"
                        min="1.00"
                        max="9999999999.99"
                        step="0.01"
                        required
                        value={amount}
                        onChange={(event) => setAmount(event.target.value)}
                        placeholder="50,00"
                        className="w-full border-0 bg-transparent px-2 py-3 text-base text-foreground outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="donor-name" className="text-sm font-medium text-foreground">
                        Nome <span className="font-normal text-muted-foreground">(opcional)</span>
                      </label>
                      <input
                        id="donor-name"
                        type="text"
                        maxLength={120}
                        autoComplete="name"
                        value={donorName}
                        onChange={(event) => setDonorName(event.target.value)}
                        className="rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="donor-phone" className="text-sm font-medium text-foreground">
                        Telefone <span className="font-normal text-muted-foreground">(opcional)</span>
                      </label>
                      <input
                        id="donor-phone"
                        type="tel"
                        maxLength={30}
                        autoComplete="tel"
                        value={donorPhone}
                        onChange={(event) => setDonorPhone(event.target.value)}
                        className="rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
                      />
                    </div>
                  </div>
                  {checkoutError && (
                    <p role="alert" className="rounded-xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
                      {checkoutError}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={startingCheckout}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:scale-[1.02] disabled:cursor-wait disabled:opacity-60"
                  >
                    {startingCheckout && <Loader2 className="h-5 w-5 animate-spin" />}
                    {startingCheckout ? 'Preparando checkout...' : 'Continuar para o checkout'}
                  </button>
                </form>
                <div className="my-6 flex items-center gap-3 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  <span className="h-px flex-1 bg-border" />
                  ou doe pelo PIX
                  <span className="h-px flex-1 bg-border" />
                </div>
                <h3 className="font-[family-name:var(--font-poppins)] text-xl font-bold text-foreground">
                  PIX pela chave CNPJ
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
