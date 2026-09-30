import { NextResponse } from 'next/server'
import { WebhookSignatureValidator } from 'mercadopago'
import { pool } from '@/lib/db'
import { ensureDonationSchema } from '@/lib/db/donations'
import {
  getMercadoPagoOrder,
  getMercadoPagoSellerId,
  getMercadoPagoWebhookSecret,
} from '@/lib/mercadopago'

export const runtime = 'nodejs'

type DonationOrder = Awaited<ReturnType<typeof getMercadoPagoOrder>>

function toCents(value: string | undefined) {
  if (!value || !/^\d+(?:\.\d{1,2})?$/.test(value)) return 0
  const [whole, fraction = ''] = value.split('.')
  return Number(whole) * 100 + Number(fraction.padEnd(2, '0'))
}

function fromCents(value: number) {
  return (value / 100).toFixed(2)
}

function getPaymentTotals(order: DonationOrder) {
  const payments = order.transactions?.payments ?? []
  const refunds = order.transactions?.refunds ?? []
  const paidCents = payments.reduce((total, payment) => {
    if (payment.status !== 'approved' && payment.status !== 'processed') return total
    return total + toCents(payment.paid_amount ?? payment.amount)
  }, 0)
  const listedRefunds = refunds.reduce((total, refund) => {
    if (refund.status !== 'approved') return total
    return total + toCents(refund.amount)
  }, 0)
  const refundedCents = listedRefunds || payments.reduce((total, payment) => {
    return total + toCents(payment.refunded_amount)
  }, 0)
  const grossCents = paidCents || toCents(order.total_paid_amount)
  return { grossCents, netCents: Math.max(0, grossCents - refundedCents) }
}

function getLocalStatus(order: DonationOrder, netCents: number, grossCents: number) {
  if (order.status === 'refunded' || order.status_detail === 'refunded' || (grossCents > 0 && netCents === 0)) return 'refunded'
  if (order.status_detail === 'partially_refunded') return 'partially_refunded'
  if (order.status === 'processed' && order.status_detail === 'accredited') return 'paid'
  if (order.status === 'failed') return 'rejected'
  if (order.status === 'canceled' || order.status === 'cancelled') return 'cancelled'
  if (order.status === 'action_required') return 'action_required'
  if (order.status === 'processing') return 'processing'
  return 'pending'
}

export async function POST(request: Request) {
  const url = new URL(request.url)
  const dataId = url.searchParams.get('data.id') ?? url.searchParams.get('id')
  if (!dataId) return NextResponse.json({ error: 'Identificador da order ausente.' }, { status: 400 })

  try {
    WebhookSignatureValidator.validate({
      xSignature: request.headers.get('x-signature'),
      xRequestId: request.headers.get('x-request-id'),
      dataId,
      secret: getMercadoPagoWebhookSecret(),
    })
  } catch {
    return NextResponse.json({ error: 'Assinatura do webhook inválida.' }, { status: 401 })
  }

  try {
    await ensureDonationSchema()
    const { rows } = await pool.query<{ id: string; external_reference: string }>(
      `SELECT "id", "external_reference" FROM "donations" WHERE "mercadopago_order_id" = $1 LIMIT 1`,
      [dataId],
    )
    const donation = rows[0]
    if (!donation) return NextResponse.json({ received: true })

    const order = await getMercadoPagoOrder(dataId)
    if (
      order.user_id !== getMercadoPagoSellerId() ||
      order.external_reference !== donation.external_reference
    ) {
      return NextResponse.json({ error: 'A order não corresponde à doação registrada.' }, { status: 409 })
    }

    const { grossCents, netCents } = getPaymentTotals(order)
    const status = getLocalStatus(order, netCents, grossCents)
    const settledNetCents = status === 'refunded' ? 0 : netCents
    await pool.query(
      `UPDATE "donations" SET
         "status" = $2,
         "status_detail" = $3,
         "net_amount" = $4,
         "paid_at" = CASE WHEN $5 THEN COALESCE("paid_at", now()) ELSE "paid_at" END,
         "updated_at" = now()
       WHERE "id" = $1`,
      [donation.id, status, order.status_detail ?? order.status ?? null, fromCents(settledNetCents), grossCents > 0],
    )
    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Falha ao processar webhook Mercado Pago:', error instanceof Error ? error.message : 'erro desconhecido')
    return NextResponse.json({ error: 'Falha ao processar a notificação.' }, { status: 500 })
  }
}
