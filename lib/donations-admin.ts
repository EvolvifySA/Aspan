import { pool } from '@/lib/db'
import { ensureDonationSchema } from '@/lib/db/donations'

export type AdminDonation = {
  id: string
  amount: string
  netAmount: string
  donorName: string | null
  donorPhone: string | null
  status: string
  statusDetail: string | null
  createdAt: Date
  paidAt: Date | null
}

export async function getDonationsAdminData() {
  await ensureDonationSchema()
  const [donationsResult, totalResult, connectionResult] = await Promise.all([
    pool.query<{
      id: string
      amount: string
      net_amount: string
      donor_name: string | null
      donor_phone: string | null
      status: string
      status_detail: string | null
      created_at: Date
      paid_at: Date | null
    }>(`SELECT "id", "amount"::text, "net_amount"::text, "donor_name", "donor_phone",
              "status", "status_detail", "created_at", "paid_at"
       FROM "donations" ORDER BY "created_at" DESC LIMIT 100`),
    pool.query<{ total: string; count: string }>(
      `SELECT COALESCE(SUM("net_amount"), 0)::text AS "total",
              COUNT(*) FILTER (WHERE "net_amount" > 0)::text AS "count"
       FROM "donations" WHERE "status" IN ('paid', 'partially_refunded')`,
    ),
    pool.query<{ seller_id: string; connected_at: Date }>(
      `SELECT "seller_id", "connected_at" FROM "mercadopago_connection" WHERE "id" = 1 LIMIT 1`,
    ),
  ])

  const totals = totalResult.rows[0]
  const connection = connectionResult.rows[0]
  return {
    donations: donationsResult.rows.map((row): AdminDonation => ({
      id: row.id,
      amount: row.amount,
      netAmount: row.net_amount,
      donorName: row.donor_name,
      donorPhone: row.donor_phone,
      status: row.status,
      statusDetail: row.status_detail,
      createdAt: row.created_at,
      paidAt: row.paid_at,
    })),
    total: totals?.total ?? '0.00',
    paidCount: Number(totals?.count ?? 0),
    connectedSellerId: connection?.seller_id ?? null,
    connectedAt: connection?.connected_at ?? null,
  }
}
