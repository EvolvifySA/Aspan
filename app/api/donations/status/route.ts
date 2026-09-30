import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { ensureDonationSchema } from '@/lib/db/donations'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const reference = new URL(request.url).searchParams.get('reference')
  if (!reference || reference.length > 64) {
    return NextResponse.json({ error: 'Doação não encontrada.' }, { status: 404 })
  }

  await ensureDonationSchema()
  const { rows } = await pool.query<{ amount: string; status: string }>(
    `SELECT "amount", "status" FROM "donations" WHERE "external_reference" = $1 LIMIT 1`,
    [reference],
  )
  const donation = rows[0]
  if (!donation) return NextResponse.json({ error: 'Doação não encontrada.' }, { status: 404 })

  return NextResponse.json({ amount: donation.amount, status: donation.status })
}
