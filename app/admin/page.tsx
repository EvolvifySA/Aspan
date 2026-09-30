import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { getPosts } from '@/app/actions/posts'
import { getTransparencyDocuments } from '@/app/actions/transparency'
import { AdminDashboard } from '@/components/aspan/admin-dashboard'
import { isDatabaseConfigured } from '@/lib/demo-posts'
import { getDonationsAdminData } from '@/lib/donations-admin'

export const dynamic = 'force-dynamic'

const mercadoPagoNotices: Record<string, string> = {
  connected: 'Conta ASPAN do Mercado Pago conectada com sucesso.',
  'authorization-denied': 'A autorização no Mercado Pago foi cancelada.',
  'authorization-error': 'Não foi possível concluir a conexão Mercado Pago. Verifique as credenciais e tente novamente.',
  'configuration-error': 'Configure as variáveis Mercado Pago no servidor antes de iniciar a conexão.',
  'wrong-account': 'A conta autorizada não corresponde à conta ASPAN configurada.',
  'wrong-mode': 'A autorização de teste/produção não corresponde ao modo configurado no servidor.',
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: Promise<{ mercadopago?: string }>
}) {
  const params = await searchParams
  const mercadoPagoNotice = params?.mercadopago ? mercadoPagoNotices[params.mercadopago] ?? null : null

  if (!isDatabaseConfigured()) {
    const posts = await getPosts()
    return <AdminDashboard posts={posts} transparencyDocuments={[]} userName="Modo demo" mercadoPagoNotice={mercadoPagoNotice} />
  }

  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/admin/login')

  const posts = await getPosts()
  const transparencyDocuments = await getTransparencyDocuments()
  const donationData = await getDonationsAdminData()

  return (
    <AdminDashboard
      posts={posts}
      transparencyDocuments={transparencyDocuments}
      userName={session.user.name}
      donations={donationData.donations}
      donationTotal={donationData.total}
      paidDonationCount={donationData.paidCount}
      mercadoPagoConnected={Boolean(donationData.connectedSellerId) && donationData.connectedSellerId === process.env.MERCADOPAGO_ASPAN_SELLER_ID?.trim()}
      mercadoPagoConnectedAt={donationData.connectedAt}
      mercadoPagoNotice={mercadoPagoNotice}
      mercadoPagoTestMode={process.env.MERCADOPAGO_TEST_MODE?.trim().toLowerCase() === 'true'}
    />
  )
}
