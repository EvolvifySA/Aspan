'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { posts } from '@/lib/db/schema'
import { demoPosts, isDatabaseConfigured } from '@/lib/demo-posts'
import { put } from '@vercel/blob'
import { desc, eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Não autorizado')
  return session.user.id
}

// Feed público — retorna todos os posts institucionais da ASPAN.
export async function getPosts() {
  if (!isDatabaseConfigured()) {
    return demoPosts
  }

  try {
    return await db.select().from(posts).orderBy(desc(posts.createdAt))
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

  const file = formData.get('image') as File | null
  const caption = (formData.get('caption') as string | null)?.trim() ?? ''

  if (!file || file.size === 0) {
    throw new Error('Selecione uma imagem para publicar.')
  }

  const blob = await put(`atualizacoes/${Date.now()}-${file.name}`, file, {
    access: 'public',
    addRandomSuffix: true,
  })

  await db.insert(posts).values({
    userId,
    imageUrl: blob.url,
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
  await db.delete(posts).where(eq(posts.id, id))

  revalidatePath('/atualizacoes')
  revalidatePath('/admin')
}
