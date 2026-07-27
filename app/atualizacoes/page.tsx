import Link from 'next/link'
import type { Metadata } from 'next'
import { ArrowLeft, Camera, Lock } from 'lucide-react'
import { AspanLogo } from '@/components/aspan/logo'
import { FeedPost } from '@/components/aspan/feed-post'
import { getPosts } from '@/app/actions/posts'
import { isDatabaseConfigured } from '@/lib/demo-posts'

export const metadata: Metadata = {
  title: 'Atualizações | ASPAN',
  description:
    'Fotos e novidades do dia a dia da ASPAN — Associação Promocional do Ancião.',
}

export const dynamic = 'force-dynamic'

export default async function AtualizacoesPage() {
  const posts = await getPosts()
  const demoMode = !isDatabaseConfigured()

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-4 py-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Início
          </Link>
          <AspanLogo showWordmark={false} />
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-8 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent">
            <Camera className="h-4 w-4" />
            Nosso dia a dia
          </span>
          <h1 className="mt-4 font-[family-name:var(--font-poppins)] text-3xl font-extrabold tracking-tight text-balance md:text-4xl">
            Atualizações da ASPAN
          </h1>
          <p className="mx-auto mt-3 max-w-md leading-relaxed text-muted-foreground text-pretty">
            Acompanhe momentos, atividades e novidades da nossa casa, como um
            feed de fotos.
          </p>
          {demoMode && (
            <p className="mx-auto mt-4 max-w-md rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-medium text-amber-700">
              Modo demo ativo: os posts exibidos são temporários até o banco ser
              configurado.
            </p>
          )}
        </div>

        {posts.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-3xl border border-dashed border-border bg-card px-6 py-16 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
              <Camera className="h-7 w-7" />
            </span>
            <div>
              <p className="font-semibold text-foreground">
                Ainda não há publicações
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Em breve compartilharemos novidades por aqui.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {posts.map((post) => (
              <FeedPost key={post.id} post={post} />
            ))}
          </div>
        )}

        <div className="mt-12 flex justify-center">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <Lock className="h-3.5 w-3.5" />
            Área administrativa
          </Link>
        </div>
      </div>
    </main>
  )
}
