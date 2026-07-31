'use server'

import { auth } from '@/lib/auth'
import { db, pool } from '@/lib/db'
import { transparencyDocuments } from '@/lib/db/schema'
import { desc, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { randomUUID } from 'node:crypto'
import { mkdir, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'

export type TransparencyDocumentData = {
  id: number
  title: string
  referenceMonth: string
  fileUrl: string
  originalFilename: string
  fileSize: number
  uploadedBy: string
  createdAt: Date | string
}

const PDF_UPLOAD_PREFIX = '/uploads/'

async function ensureTransparencyTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "transparency_documents" (
      "id" serial PRIMARY KEY,
      "title" text NOT NULL,
      "reference_month" text NOT NULL,
      "file_url" text NOT NULL,
      "original_filename" text NOT NULL,
      "file_size" integer NOT NULL,
      "uploaded_by" text NOT NULL,
      "created_at" timestamp NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS "transparency_documents_reference_month_idx"
      ON "transparency_documents"("reference_month");

    CREATE INDEX IF NOT EXISTS "transparency_documents_created_at_idx"
      ON "transparency_documents"("created_at");
  `)
}

async function getAdminName() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Nao autorizado')
  return session.user.name || session.user.email || 'Administrador'
}

function isReferenceMonth(value: string) {
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(value)
}

function defaultTitle(referenceMonth: string) {
  const [year, month] = referenceMonth.split('-')
  return `Transparencia - ${month}/${year}`
}

async function savePdf(file: File, referenceMonth: string) {
  const fileName = `transparencia-${referenceMonth}-${randomUUID()}.pdf`
  const uploadDir = path.join(process.cwd(), 'public', 'uploads')
  const filePath = path.join(uploadDir, fileName)

  await mkdir(uploadDir, { recursive: true })
  await writeFile(filePath, Buffer.from(await file.arrayBuffer()))

  return `${PDF_UPLOAD_PREFIX}${fileName}`
}

async function deleteLocalUpload(fileUrl: string) {
  if (!fileUrl.startsWith(PDF_UPLOAD_PREFIX)) return

  const uploadDir = path.resolve(process.cwd(), 'public', 'uploads')
  const filePath = path.resolve(uploadDir, path.basename(fileUrl))
  if (!filePath.startsWith(`${uploadDir}${path.sep}`)) return

  await unlink(filePath).catch(() => undefined)
}

export async function getTransparencyDocuments() {
  try {
    await ensureTransparencyTable()
    return await db
      .select()
      .from(transparencyDocuments)
      .orderBy(
        desc(transparencyDocuments.referenceMonth),
        desc(transparencyDocuments.createdAt),
      )
  } catch {
    return []
  }
}

export async function getLatestTransparencyDocument() {
  const documents = await getTransparencyDocuments()
  return documents[0] ?? null
}

export async function uploadTransparencyDocument(formData: FormData) {
  const uploadedBy = await getAdminName()
  await ensureTransparencyTable()

  const file = formData.get('pdf') as File | null
  const referenceMonth = String(formData.get('referenceMonth') || '').trim()
  const title = String(formData.get('title') || '').trim()

  if (!file || file.size === 0) {
    throw new Error('Selecione um arquivo PDF.')
  }

  if (file.type && file.type !== 'application/pdf') {
    throw new Error('Envie apenas arquivos PDF.')
  }

  if (!file.name.toLowerCase().endsWith('.pdf')) {
    throw new Error('Envie apenas arquivos PDF.')
  }

  if (!isReferenceMonth(referenceMonth)) {
    throw new Error('Informe o mes de referencia.')
  }

  const fileUrl = await savePdf(file, referenceMonth)

  await db.insert(transparencyDocuments).values({
    title: title || defaultTitle(referenceMonth),
    referenceMonth,
    fileUrl,
    originalFilename: file.name,
    fileSize: file.size,
    uploadedBy,
  })

  revalidatePath('/')
  revalidatePath('/admin')
}

export async function deleteTransparencyDocument(id: number) {
  await getAdminName()
  await ensureTransparencyTable()

  const [document] = await db
    .select({ fileUrl: transparencyDocuments.fileUrl })
    .from(transparencyDocuments)
    .where(eq(transparencyDocuments.id, id))
    .limit(1)

  await db
    .delete(transparencyDocuments)
    .where(eq(transparencyDocuments.id, id))

  if (document?.fileUrl) await deleteLocalUpload(document.fileUrl)

  revalidatePath('/')
  revalidatePath('/admin')
}
