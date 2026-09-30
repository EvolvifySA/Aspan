import { NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { pool } from '@/lib/db'
import { ensureDonationSchema } from '@/lib/db/donations'
import { createMercadoPagoDonationOrder } from '@/lib/mercadopago'

export const runtime = 'nodejs'

function optionalText(value: unknown, maxLength: number) {
  if (typeof value !== 'string') return null
  const text = value.trim()
  if (!text) return null
  return text.slice(0, maxLength)
}

function safeCheckoutError(error: unknown) {
  const message = error instanceof Error ? error.message : ''
  const publicPrefixes = [
    'A configuração ',
    'MERCADOPAGO_TOKEN_ENCRYPTION_KEY ',
    'MERCADOPAGO_TOKEN_ENCRYPTION_KEY deve',
    'Conecte a conta ASPAN ',
    'A conta Mercado Pago conectada ',
    'Configure APP_PUBLIC_URL ',
    'APP_PUBLIC_URL precisa ',
  ]
  return publicPrefixes.some((prefix) => message.startsWith(prefix))
    ? message
    : 'Não foi possível iniciar o pagamento. Tente novamente mais tarde.'
}

export async function POST(request: Request) {
  let donationId: string | undefined
  let body: { amount?: unknown; name?: unknown; phone?: unknown }

  try {
    body = await request.json() as { amount?: unknown; name?: unknown; phone?: unknown }
  } catch {
    return NextResponse.json({ error: 'Não foi possível ler os dados da doação.' }, { status: 400 })
  }

  try {
    const rawAmount = typeof body.amount === 'number' || typeof body.amount === 'string'
      ? String(body.amount).trim().replace(',', '.')
      : ''
    if (!/^\d{1,10}(?:\.\d{1,2})?$/.test(rawAmount)) {
      return NextResponse.json({ error: 'Informe um valor válido, com até duas casas decimais.' }, { status: 400 })
    }
    const [wholePart, centsPart = ''] = rawAmount.split('.')
    const whole = Number(wholePart)
    const cents = Number(centsPart.padEnd(2, '0'))
    if (!Number.isSafeInteger(whole) || (whole === 0 && cents === 0) || whole < 1) {
      return NextResponse.json({ error: 'O valor mínimo para doar é R$ 1,00.' }, { status: 400 })
    }
    if (whole > 9999999999) {
      return NextResponse.json({ error: 'O valor informado excede o limite permitido.' }, { status: 400 })
    }
    const amount = `${whole}.${String(cents).padStart(2, '0')}`
    const donorName = optionalText(body.name, 120)
    const rawPhone = optionalText(body.phone, 30)
    const donorPhone = rawPhone?.replace(/[^\d+().\s-]/g, '').trim() || null
    if (donorPhone && (donorPhone.replace(/\D/g, '').length < 10 || donorPhone.replace(/\D/g, '').length > 13)) {
      return NextResponse.json({ error: 'Informe um telefone válido ou deixe o campo em branco.' }, { status: 400 })
    }

    await ensureDonationSchema()
    donationId = randomUUID()
    await pool.query(
      `INSERT INTO "donations" ("id", "amount", "donor_name", "donor_phone", "external_reference", "status")
       VALUES ($1, $2, $3, $4, $1, 'creating')`,
      [donationId, amount, donorName, donorPhone],
    )

    const order = await createMercadoPagoDonationOrder({ amount, reference: donationId })
    await pool.query(
      `UPDATE "donations" SET "mercadopago_order_id" = $2, "checkout_url" = $3,
         "status" = 'pending', "updated_at" = now()
       WHERE "id" = $1`,
      [donationId, order.id, order.checkoutUrl],
    )

    return NextResponse.json({ checkoutUrl: order.checkoutUrl })
  } catch (error) {
    if (donationId) {
      await pool.query(
        `UPDATE "donations" SET "status" = 'checkout_error', "updated_at" = now() WHERE "id" = $1`,
        [donationId],
      ).catch(() => undefined)
    }
    console.error('Falha ao iniciar doação Mercado Pago:', error instanceof Error ? error.message : 'erro desconhecido')
    return NextResponse.json({ error: safeCheckoutError(error) }, { status: 503 })
  }
}
