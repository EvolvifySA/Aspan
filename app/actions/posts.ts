'use server'

import { auth } from '@/lib/auth'
import { db, pool } from '@/lib/db'
import { posts } from '@/lib/db/schema'
import { demoPosts, isDatabaseConfigured } from '@/lib/demo-posts'
import { del, put } from '@vercel/blob'
import { desc, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { randomUUID } from 'node:crypto'
import { mkdir, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'

const LOCAL_UPLOAD_PREFIX = '/uploads/'
const ALLOWED_IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif'])

async function ensurePostsImageUrlsColumn() {
  await pool.query('ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "imageUrls" jsonb')
}

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Não autorizado')
  return session.user.id
}

function getSafeImageExtension(fileName: string) {
  const extension = path.extname(fileName).toLowerCase()
  return ALLOWED_IMAGE_EXTENSIONS.has(extension) ? extension : '.jpg'
}

async function uploadPostImage(file: File) {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`atualizacoes/${Date.now()}-${file.name}`, file, {
      access: 'public',
      addRandomSuffix: true,
    })

    return blob.url
  }

  const uploadDir = path.join(process.cwd(), 'public', 'uploads')
  const filename = `${Date.now()}-${randomUUID()}${getSafeImageExtension(file.name)}`
  const filePath = path.join(uploadDir, filename)

  await mkdir(uploadDir, { recursive: true })
  await writeFile(filePath, Buffer.from(await file.arrayBuffer()))

  return `${LOCAL_UPLOAD_PREFIX}${filename}`
}

async function deletePostImage(imageUrl: string) {
  if (imageUrl.startsWith(LOCAL_UPLOAD_PREFIX)) {
    const uploadDir = path.resolve(process.cwd(), 'public', 'uploads')
    const filePath = path.resolve(uploadDir, path.basename(imageUrl))

    if (!filePath.startsWith(`${uploadDir}${path.sep}`)) return

    await unlink(filePath).catch(() => undefined)
    return
  }

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    await del(imageUrl).catch(() => undefined)
  }
}

// Feed público — retorna todos os posts institucionais da ASPAN.
export async function getPosts() {
  if (!isDatabaseConfigured()) {
    return demoPosts
  }

  try {
    await ensurePostsImageUrlsColumn()
    const records = await db.select().from(posts).orderBy(desc(posts.createdAt))
    return records.map((post) => ({
      ...post,
      imageUrls: Array.isArray(post.imageUrls) ? post.imageUrls : [post.imageUrl],
    }))
  } catch {
    return demoPosts
  }
}

export async function createPost(formData: FormData) {
  if (!isDatabaseConfigured()) {
    revalidatePath('/atualizacoes')
    revalidatePath('/admin')
    return
  }

  const userId = await getUserId()
  await ensurePostsImageUrlsColumn()

  const files = formData
    .getAll('images')
    .filter((value): value is File => value instanceof File && value.size > 0)
  const caption = (formData.get('caption') as string | null)?.trim() ?? ''

  if (files.length === 0) {
    throw new Error('Selecione pelo menos uma imagem para publicar.')
  }

  const imageUrls = await Promise.all(files.map((file) => uploadPostImage(file)))

  await db.insert(posts).values({
    userId,
    imageUrl: imageUrls[0],
    imageUrls,
    caption,
  })

  revalidatePath('/atualizacoes')
  revalidatePath('/admin')
}

export async function deletePost(id: number) {
  if (!isDatabaseConfigured()) {
    revalidatePath('/atualizacoes')
    revalidatePath('/admin')
    return
  }

  // Conteúdo institucional gerenciado coletivamente: qualquer admin
  // autenticado pode remover um post.
  await getUserId()
  await ensurePostsImageUrlsColumn()
  const [post] = await db
    .select({ imageUrl: posts.imageUrl, imageUrls: posts.imageUrls })
    .from(posts)
    .where(eq(posts.id, id))
    .limit(1)
  await db.delete(posts).where(eq(posts.id, id))
  const imageUrls = Array.isArray(post?.imageUrls) ? post.imageUrls : []
  const uniqueUrls = [...new Set([post?.imageUrl, ...imageUrls].filter(Boolean))]
  await Promise.all(uniqueUrls.map((imageUrl) => deletePostImage(String(imageUrl))))

  revalidatePath('/atualizacoes')
  revalidatePath('/admin')
}
