import { createHash } from 'node:crypto'
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { pool } from '@/lib/db'
import { ensureDonationSchema } from '@/lib/db/donations'
import {
  getAppPublicUrl,
  getMercadoPagoAppCredentials,
  getMercadoPagoSellerId,
  getOAuthClient,
  isMercadoPagoTestMode,
  storeMercadoPagoConnection,
} from '@/lib/mercadopago'

export const runtime = 'nodejs'

type OAuthTokens = {
  access_token?: string
  refresh_token?: string
  expires_in?: number
  user_id?: number
  live_mode?: boolean
}

function redirectToAdmin(request: Request, result: string) {
  let origin: string
  try {
    origin = getAppPublicUrl()
  } catch {
    origin = new URL(request.url).origin
  }
  return NextResponse.redirect(new URL(`/admin?mercadopago=${result}`, origin))
}

function redirectToLogin(request: Request) {
  let origin: string
  try {
    origin = getAppPublicUrl()
  } catch {
    origin = new URL(request.url).origin
  }
  return NextResponse.redirect(new URL('/admin/login', origin))
}

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return redirectToLogin(request)

  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  if (url.searchParams.has('error')) return redirectToAdmin(request, 'authorization-denied')
  if (!code || !state || state.length > 256) return redirectToAdmin(request, 'authorization-error')

  try {
    await ensureDonationSchema()
    const stateHash = createHash('sha256').update(state).digest('hex')
    const { rows } = await pool.query<{ code_verifier: string; user_id: string }>(
      `SELECT "code_verifier", "user_id" FROM "mercadopago_oauth_states"
       WHERE "state_hash" = $1 AND "expires_at" > now() LIMIT 1`,
      [stateHash],
    )
    const oauthState = rows[0]
    if (!oauthState || oauthState.user_id !== session.user.id) {
      return redirectToAdmin(request, 'authorization-error')
    }
    await pool.query(`DELETE FROM "mercadopago_oauth_states" WHERE "state_hash" = $1`, [stateHash])

    const { clientId, clientSecret } = getMercadoPagoAppCredentials()
    const redirectUri = `${getAppPublicUrl()}/api/admin/mercadopago/callback`
    const oauthBody = {
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
      code_verifier: oauthState.code_verifier,
      test_token: isMercadoPagoTestMode() ? 'true' : 'false',
    }
    const tokens = await getOAuthClient().create({
      body: oauthBody,
    }) as OAuthTokens

    const sellerId = tokens.user_id ? String(tokens.user_id) : ''
    if (sellerId !== getMercadoPagoSellerId()) {
      return redirectToAdmin(request, 'wrong-account')
    }
    if (tokens.live_mode !== undefined && tokens.live_mode === isMercadoPagoTestMode()) {
      return redirectToAdmin(request, 'wrong-mode')
    }
    if (!tokens.access_token || !tokens.refresh_token) {
      return redirectToAdmin(request, 'authorization-error')
    }

    await storeMercadoPagoConnection({
      sellerId,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresIn: tokens.expires_in ?? 15552000,
      connectedBy: session.user.id,
    })

    return redirectToAdmin(request, 'connected')
  } catch (error) {
    console.error('OAuth Mercado Pago falhou:', error instanceof Error ? error.message : 'erro desconhecido')
    return redirectToAdmin(request, 'authorization-error')
  }
}
