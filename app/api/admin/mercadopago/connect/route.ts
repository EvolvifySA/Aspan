import { createHash, randomBytes } from 'node:crypto'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { ensureDonationSchema } from '@/lib/db/donations'
import { getAppPublicUrl, getMercadoPagoAppCredentials } from '@/lib/mercadopago'
import { pool } from '@/lib/db'

export const runtime = 'nodejs'

function redirectWithinSite(request: Request, path: string) {
  let origin: string
  try {
    origin = getAppPublicUrl()
  } catch {
    origin = new URL(request.url).origin
  }
  return NextResponse.redirect(new URL(path, origin))
}

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return redirectWithinSite(request, '/admin/login')
  }

  try {
    await ensureDonationSchema()
    const { clientId } = getMercadoPagoAppCredentials()
    const baseUrl = getAppPublicUrl()
    const redirectUri = `${baseUrl}/api/admin/mercadopago/callback`
    const state = randomBytes(32).toString('base64url')
    const verifier = randomBytes(32).toString('base64url')
    const challenge = createHash('sha256').update(verifier).digest('base64url')
    const stateHash = createHash('sha256').update(state).digest('hex')

    await pool.query(
      `DELETE FROM "mercadopago_oauth_states" WHERE "expires_at" < now()`,
    )
    await pool.query(
      `INSERT INTO "mercadopago_oauth_states" ("state_hash", "code_verifier", "user_id", "expires_at")
       VALUES ($1, $2, $3, now() + interval '10 minutes')`,
      [stateHash, verifier, session.user.id],
    )

    const authorizationUrl = new URL('https://auth.mercadopago.com/authorization')
    authorizationUrl.searchParams.set('response_type', 'code')
    authorizationUrl.searchParams.set('client_id', clientId)
    authorizationUrl.searchParams.set('platform_id', 'mp')
    authorizationUrl.searchParams.set('state', state)
    authorizationUrl.searchParams.set('redirect_uri', redirectUri)
    authorizationUrl.searchParams.set('code_challenge', challenge)
    authorizationUrl.searchParams.set('code_challenge_method', 'S256')

    return NextResponse.redirect(authorizationUrl)
  } catch (error) {
    console.error('Não foi possível iniciar OAuth do Mercado Pago:', error instanceof Error ? error.message : 'erro desconhecido')
    return redirectWithinSite(request, '/admin?mercadopago=configuration-error')
  }
}
