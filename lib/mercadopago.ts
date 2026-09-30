import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'
import { MercadoPagoConfig, OAuth, Order } from 'mercadopago'
import { pool } from '@/lib/db'
import { ensureDonationSchema } from '@/lib/db/donations'

type OAuthTokens = {
  access_token?: string
  refresh_token?: string
  expires_in?: number
  user_id?: number
  live_mode?: boolean
}

function requiredEnv(name: string) {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`A configuração ${name} não foi preenchida no servidor.`)
  return value
}

export function getMercadoPagoAppCredentials() {
  return {
    clientId: requiredEnv('MERCADOPAGO_CLIENT_ID'),
    clientSecret: requiredEnv('MERCADOPAGO_CLIENT_SECRET'),
  }
}

export function getMercadoPagoEncryptionKey() {
  const encoded = requiredEnv('MERCADOPAGO_TOKEN_ENCRYPTION_KEY')
  const key = Buffer.from(encoded, 'base64')
  if (key.length !== 32) {
    throw new Error('MERCADOPAGO_TOKEN_ENCRYPTION_KEY deve ser uma chave Base64 de 32 bytes.')
  }
  return key
}

export function getMercadoPagoWebhookSecret() {
  return requiredEnv('MERCADOPAGO_WEBHOOK_SECRET')
}

export function getMercadoPagoSellerId() {
  return requiredEnv('MERCADOPAGO_ASPAN_SELLER_ID')
}

export function isMercadoPagoTestMode() {
  return process.env.MERCADOPAGO_TEST_MODE?.trim().toLowerCase() === 'true'
}

export function getAppPublicUrl() {
  const configured = process.env.APP_PUBLIC_URL?.trim()
  if (!configured) throw new Error('Configure APP_PUBLIC_URL com o endereço HTTPS público do site.')
  let parsed: URL
  try {
    parsed = new URL(configured)
  } catch {
    throw new Error('APP_PUBLIC_URL precisa ser um endereço HTTPS válido.')
  }
  if (parsed.protocol !== 'https:') {
    throw new Error('APP_PUBLIC_URL precisa usar HTTPS público para o Mercado Pago.')
  }
  return configured.replace(/\/$/, '')
}

export function getOAuthClient() {
  const { clientSecret } = getMercadoPagoAppCredentials()
  return new OAuth(new MercadoPagoConfig({ accessToken: clientSecret }))
}

export function encryptMercadoPagoToken(value: string) {
  const key = getMercadoPagoEncryptionKey()
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key, iv)
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()])
  return `${iv.toString('base64url')}.${cipher.getAuthTag().toString('base64url')}.${encrypted.toString('base64url')}`
}

export function decryptMercadoPagoToken(value: string) {
  const [encodedIv, encodedTag, encodedData] = value.split('.')
  if (!encodedIv || !encodedTag || !encodedData) throw new Error('Credencial Mercado Pago inválida.')
  const decipher = createDecipheriv(
    'aes-256-gcm',
    getMercadoPagoEncryptionKey(),
    Buffer.from(encodedIv, 'base64url'),
  )
  decipher.setAuthTag(Buffer.from(encodedTag, 'base64url'))
  return Buffer.concat([
    decipher.update(Buffer.from(encodedData, 'base64url')),
    decipher.final(),
  ]).toString('utf8')
}

export async function storeMercadoPagoConnection({
  sellerId,
  accessToken,
  refreshToken,
  expiresIn,
  connectedBy,
}: {
  sellerId: string
  accessToken: string
  refreshToken: string
  expiresIn: number
  connectedBy: string
}) {
  await ensureDonationSchema()
  await pool.query(
    `INSERT INTO "mercadopago_connection"
      ("id", "seller_id", "access_token_encrypted", "refresh_token_encrypted", "expires_at", "connected_by", "connected_at", "updated_at")
     VALUES (1, $1, $2, $3, now() + ($4::text || ' seconds')::interval, $5, now(), now())
     ON CONFLICT ("id") DO UPDATE SET
       "seller_id" = EXCLUDED."seller_id",
       "access_token_encrypted" = EXCLUDED."access_token_encrypted",
       "refresh_token_encrypted" = EXCLUDED."refresh_token_encrypted",
       "expires_at" = EXCLUDED."expires_at",
       "connected_by" = EXCLUDED."connected_by",
       "connected_at" = now(),
       "updated_at" = now()`,
    [
      sellerId,
      encryptMercadoPagoToken(accessToken),
      encryptMercadoPagoToken(refreshToken),
      Math.max(60, expiresIn),
      connectedBy,
    ],
  )
}

export async function getMercadoPagoAccessToken() {
  await ensureDonationSchema()
  const client = await pool.connect()

  try {
    await client.query('BEGIN')
    const { rows } = await client.query<{
      seller_id: string
      access_token_encrypted: string
      refresh_token_encrypted: string
      expires_at: Date
    }>(`SELECT "seller_id", "access_token_encrypted", "refresh_token_encrypted", "expires_at"
       FROM "mercadopago_connection" WHERE "id" = 1 FOR UPDATE`)
    const connection = rows[0]
    if (!connection) throw new Error('Conecte a conta ASPAN do Mercado Pago pelo painel administrativo.')
    if (connection.seller_id !== getMercadoPagoSellerId()) {
      throw new Error('A conta Mercado Pago conectada não corresponde à conta ASPAN configurada.')
    }

    let accessToken = decryptMercadoPagoToken(connection.access_token_encrypted)
    if (connection.expires_at.getTime() <= Date.now() + 5 * 60 * 1000) {
      const { clientId, clientSecret } = getMercadoPagoAppCredentials()
      const refreshToken = decryptMercadoPagoToken(connection.refresh_token_encrypted)
      const refreshBody = {
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        test_token: isMercadoPagoTestMode() ? 'true' : 'false',
      }
      const tokens = await getOAuthClient().refresh({
        body: refreshBody,
      }) as OAuthTokens

      if (!tokens.access_token || !tokens.refresh_token) {
        throw new Error('O Mercado Pago não retornou novas credenciais ao renovar a conexão.')
      }

      accessToken = tokens.access_token
      await client.query(
        `UPDATE "mercadopago_connection" SET
           "access_token_encrypted" = $1,
           "refresh_token_encrypted" = $2,
           "expires_at" = now() + ($3::text || ' seconds')::interval,
           "updated_at" = now()
         WHERE "id" = 1`,
        [
          encryptMercadoPagoToken(tokens.access_token),
          encryptMercadoPagoToken(tokens.refresh_token),
          Math.max(60, tokens.expires_in ?? 15552000),
        ],
      )
    }

    await client.query('COMMIT')
    return accessToken
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined)
    throw error
  } finally {
    client.release()
  }
}

export async function createMercadoPagoDonationOrder({
  amount,
  reference,
}: {
  amount: string
  reference: string
}) {
  const accessToken = await getMercadoPagoAccessToken()
  const baseUrl = getAppPublicUrl()
  const orderClient = new Order(new MercadoPagoConfig({ accessToken, options: { timeout: 10000 } }))
  const response = await orderClient.create({
    body: {
      type: 'online',
      processing_mode: 'manual',
      total_amount: amount,
      currency: 'BRL',
      external_reference: reference,
      description: 'Doação para a ASPAN',
      items: [{
        title: 'Doação para a ASPAN',
        quantity: 1,
        unit_measure: 'unit',
        unit_price: amount,
      }],
      config: {
        online: {
          callback_url: `${baseUrl}/api/mercadopago/webhook`,
          success_url: `${baseUrl}/doacoes/retorno?reference=${encodeURIComponent(reference)}`,
          failure_url: `${baseUrl}/doacoes/retorno?reference=${encodeURIComponent(reference)}`,
          pending_url: `${baseUrl}/doacoes/retorno?reference=${encodeURIComponent(reference)}`,
          auto_return: 'approved',
        },
      },
    },
    requestOptions: { idempotencyKey: reference },
  })

  if (!response.id || !response.checkout_url) {
    throw new Error('O Mercado Pago não retornou a URL para iniciar o checkout.')
  }
  return { id: response.id, checkoutUrl: response.checkout_url }
}

export async function getMercadoPagoOrder(orderId: string) {
  const accessToken = await getMercadoPagoAccessToken()
  const orderClient = new Order(new MercadoPagoConfig({ accessToken, options: { timeout: 10000 } }))
  return orderClient.get({ id: orderId })
}

