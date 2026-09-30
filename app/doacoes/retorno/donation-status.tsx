'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { CheckCircle2, CircleDollarSign, Clock3, Loader2, XCircle } from 'lucide-react'

type DonationState = { amount: string; status: string }

const statusCopy: Record<string, { title: string; detail: string; kind: 'success' | 'pending' | 'error' }> = {
  paid: { title: 'Doação confirmada', detail: 'Obrigado por apoiar a ASPAN!', kind: 'success' },
  partially_refunded: { title: 'Doação recebida', detail: 'O Mercado Pago registrou uma devolução parcial para este pagamento.', kind: 'success' },
  refunded: { title: 'Pagamento devolvido', detail: 'O Mercado Pago confirmou a devolução deste pagamento.', kind: 'error' },
  rejected: { title: 'Pagamento não aprovado', detail: 'Você pode tentar novamente ou escolher o PIX manual.', kind: 'error' },
  cancelled: { title: 'Checkout encerrado', detail: 'Nenhum pagamento foi confirmado. Você pode tentar novamente.', kind: 'error' },
  checkout_error: { title: 'Não foi possível iniciar o checkout', detail: 'Volte à página inicial e tente novamente.', kind: 'error' },
  pending: { title: 'Pagamento em confirmação', detail: 'O Mercado Pago ainda não confirmou o pagamento. Esta página consulta o estado automaticamente.', kind: 'pending' },
  processing: { title: 'Pagamento em processamento', detail: 'O Mercado Pago está processando a doação. A confirmação pode levar alguns instantes.', kind: 'pending' },
  action_required: { title: 'Pagamento aguardando confirmação', detail: 'Conclua qualquer etapa pendente no Mercado Pago e aguarde a atualização.', kind: 'pending' },
  creating: { title: 'Preparando doação', detail: 'Estamos aguardando a resposta do Mercado Pago.', kind: 'pending' },
}

const terminalStatuses = new Set(['paid', 'partially_refunded', 'refunded', 'rejected', 'cancelled', 'checkout_error'])

export function DonationStatus({ reference }: { reference: string }) {
  const [donation, setDonation] = useState<DonationState | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let stopped = false
    let timer: ReturnType<typeof setTimeout> | undefined
    let attempts = 0

    const refresh = async () => {
      try {
        const response = await fetch(`/api/donations/status?reference=${encodeURIComponent(reference)}`, { cache: 'no-store' })
        if (!response.ok) {
          if (!stopped && response.status === 404) setNotFound(true)
          return
        }
        const result = await response.json() as DonationState
        if (stopped) return
        setDonation(result)
        if (!terminalStatuses.has(result.status) && attempts++ < 20) timer = setTimeout(refresh, 3000)
      } catch {
        if (!stopped && attempts++ < 20) timer = setTimeout(refresh, 3000)
      }
    }

    void refresh()
    return () => {
      stopped = true
      if (timer) clearTimeout(timer)
    }
  }, [reference])

  const state = donation ? statusCopy[donation.status] : null
  const Icon = state?.kind === 'success' ? CheckCircle2 : state?.kind === 'error' ? XCircle : Clock3

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <section className="w-full max-w-lg rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          {donation ? <Icon className="h-8 w-8" /> : <Loader2 className="h-8 w-8 animate-spin" />}
        </span>
        <h1 className="mt-6 font-[family-name:var(--font-poppins)] text-2xl font-bold">
          {notFound ? 'Doação não encontrada' : state?.title ?? 'Consultando pagamento'}
        </h1>
        <p className="mt-3 text-muted-foreground">
          {notFound ? 'Não encontramos essa tentativa de doação.' : state?.detail ?? 'A confirmação será exibida assim que o Mercado Pago atualizar o pagamento.'}
        </p>
        {donation && (
          <p className="mt-5 flex items-center justify-center gap-2 font-semibold text-foreground">
            <CircleDollarSign className="h-5 w-5 text-primary" />
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(donation.amount))}
          </p>
        )}
        <Link
          href="/#doar"
          className="mt-8 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Voltar às doações
        </Link>
      </section>
    </main>
  )
}
