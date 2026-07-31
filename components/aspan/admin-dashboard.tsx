'use client'

import { useRef, useState, useTransition } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  ClipboardList,
  FileText,
  ImagePlus,
  Loader2,
  LogOut,
  Trash2,
  Upload,
  X,
} from 'lucide-react'
import { signOut } from '@/lib/auth-client'
import { createPost, deletePost } from '@/app/actions/posts'
import {
  deleteTransparencyDocument,
  uploadTransparencyDocument,
  type TransparencyDocumentData,
} from '@/app/actions/transparency'
import { AspanLogo } from '@/components/aspan/logo'
import type { FeedPostData } from '@/components/aspan/feed-post'

function formatDate(date: Date | string) {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
  }).format(d)
}

function formatReferenceMonth(value: string) {
  const [year, month] = value.split('-')
  return month && year ? `${month}/${year}` : value
}

function formatFileSize(value: number) {
  if (value < 1024 * 1024) return `${Math.max(1, Math.round(value / 1024))} KB`
  return `${(value / 1024 / 1024).toFixed(1)} MB`
}

export function AdminDashboard({
  posts,
  transparencyDocuments,
  userName,
}: {
  posts: FeedPostData[]
  transparencyDocuments: TransparencyDocumentData[]
  userName: string
}) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [caption, setCaption] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [pdfError, setPdfError] = useState<string | null>(null)
  const [pdfUploading, setPdfUploading] = useState(false)
  const [deletingTransparencyId, setDeletingTransparencyId] = useState<number | null>(null)
  const [, startTransition] = useTransition()
  const demoMode = userName === 'Modo demo'

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setPreview(URL.createObjectURL(file))
      setError(null)
    }
  }

  function clearForm() {
    setPreview(null)
    setCaption('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    const file = formData.get('image') as File | null
    if (!file || file.size === 0) {
      setError('Selecione uma imagem para publicar.')
      return
    }
    setUploading(true)
    try {
      await createPost(formData)
      clearForm()
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao publicar.')
    } finally {
      setUploading(false)
    }
  }

  function handleDelete(id: number) {
    setDeletingId(id)
    startTransition(async () => {
      try {
        await deletePost(id)
        router.refresh()
      } finally {
        setDeletingId(null)
      }
    })
  }

  async function handleTransparencySubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPdfError(null)
    const form = e.currentTarget
    const formData = new FormData(form)
    const file = formData.get('pdf') as File | null

    if (!file || file.size === 0) {
      setPdfError('Selecione um arquivo PDF.')
      return
    }

    setPdfUploading(true)
    try {
      await uploadTransparencyDocument(formData)
      form.reset()
      router.refresh()
    } catch (err) {
      setPdfError(err instanceof Error ? err.message : 'Falha ao enviar PDF.')
    } finally {
      setPdfUploading(false)
    }
  }

  function handleTransparencyDelete(id: number) {
    setDeletingTransparencyId(id)
    startTransition(async () => {
      try {
        await deleteTransparencyDocument(id)
        router.refresh()
      } finally {
        setDeletingTransparencyId(null)
      }
    })
  }

  async function handleLogout() {
    await signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3">
          <AspanLogo showWordmark={false} />
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              Olá, <span className="font-medium text-foreground">{userName}</span>
            </span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-8">
        {demoMode && (
          <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-800">
            Modo demo ativo. Você consegue testar a interface, mas publicar e
            excluir posts ainda não persistem sem o banco configurado.
          </div>
        )}
        <h1 className="font-[family-name:var(--font-poppins)] text-2xl font-extrabold tracking-tight md:text-3xl">
          Gerenciar atualizações
        </h1>
        <p className="mt-1 text-muted-foreground">
          Publique fotos e novidades no feed público da ASPAN.
        </p>

        <a
          href="/admin/forms"
          className="mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-secondary"
        >
          <ClipboardList className="h-4 w-4 text-primary" />
          Controle de Forms
        </a>

        {/* Formulário de nova publicação */}
        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-sm"
        >
          <h2 className="flex items-center gap-2 font-[family-name:var(--font-poppins)] text-lg font-bold">
            <ImagePlus className="h-5 w-5 text-accent" />
            Nova publicação
          </h2>

          <div className="mt-5 grid gap-5 md:grid-cols-[240px_1fr]">
            {/* Upload / preview */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                name="image"
                accept="image/*"
                onChange={handleFileChange}
                className="sr-only"
                id="image-input"
              />
              {preview ? (
                <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-border">
                  <Image
                    src={preview || '/placeholder.svg'}
                    alt="Pré-visualização"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={clearForm}
                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-background/90 text-foreground shadow-md transition-colors hover:bg-background"
                    aria-label="Remover imagem"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="image-input"
                  className="flex aspect-square w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-background text-center transition-colors hover:border-accent hover:bg-accent/5"
                >
                  <Upload className="h-7 w-7 text-muted-foreground" />
                  <span className="px-4 text-sm font-medium text-muted-foreground">
                    Selecionar foto
                  </span>
                </label>
              )}
            </div>

            {/* Legenda + submit */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-1 flex-col gap-1.5">
                <label
                  htmlFor="caption"
                  className="text-sm font-medium text-foreground"
                >
                  Legenda
                </label>
                <textarea
                  id="caption"
                  name="caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={5}
                  placeholder="Escreva uma legenda para a publicação..."
                  className="flex-1 resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"
                />
              </div>

              {error && (
                <p className="rounded-xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={uploading}
                className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-lg shadow-accent/25 transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                {uploading ? 'Publicando...' : 'Publicar'}
              </button>
              {demoMode && (
                <p className="text-xs text-muted-foreground">
                  Neste modo, o envio é simulado para permitir testes visuais.
                </p>
              )}
            </div>
          </div>
        </form>

        <section className="mt-8 rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h2 className="flex items-center gap-2 font-[family-name:var(--font-poppins)] text-lg font-bold">
            <FileText className="h-5 w-5 text-accent" />
            Transparência
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Envie os PDFs mensais que aparecem na seção pública de Transparência.
          </p>

          <form onSubmit={handleTransparencySubmit} className="mt-5 grid gap-4 md:grid-cols-[1fr_180px]">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="transparency-pdf" className="text-sm font-medium text-foreground">
                  PDF
                </label>
                <input
                  id="transparency-pdf"
                  name="pdf"
                  type="file"
                  accept="application/pdf,.pdf"
                  required
                  className="rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground file:mr-4 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:text-sm file:font-semibold file:text-accent-foreground"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="referenceMonth" className="text-sm font-medium text-foreground">
                  Mês de referência
                </label>
                <input
                  id="referenceMonth"
                  name="referenceMonth"
                  type="month"
                  required
                  className="rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"
                />
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label htmlFor="transparency-title" className="text-sm font-medium text-foreground">
                  Título
                </label>
                <input
                  id="transparency-title"
                  name="title"
                  placeholder="Transparência - mês/ano"
                  className="rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/30"
                />
              </div>
            </div>

            <div className="flex flex-col justify-end gap-3">
              {pdfError && (
                <p className="rounded-xl bg-destructive/10 px-4 py-2.5 text-sm text-destructive">
                  {pdfError}
                </p>
              )}
              <button
                type="submit"
                disabled={pdfUploading}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-lg shadow-accent/25 transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pdfUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                {pdfUploading ? 'Enviando...' : 'Enviar PDF'}
              </button>
            </div>
          </form>

          <div className="mt-6 space-y-3">
            {transparencyDocuments.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-border bg-background px-5 py-8 text-center text-sm text-muted-foreground">
                Nenhum PDF enviado ainda. A seção pública usará o arquivo padrão.
              </p>
            ) : (
              transparencyDocuments.map((document) => (
                <div
                  key={document.id}
                  className="flex flex-col gap-3 rounded-2xl border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold text-foreground">{document.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatReferenceMonth(document.referenceMonth)} · {formatFileSize(document.fileSize)} · {document.uploadedBy}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={document.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
                    >
                      Abrir
                    </a>
                    <button
                      type="button"
                      onClick={() => handleTransparencyDelete(document.id)}
                      disabled={deletingTransparencyId === document.id}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border text-destructive transition-colors hover:bg-destructive hover:text-background disabled:opacity-60"
                      aria-label="Remover PDF"
                    >
                      {deletingTransparencyId === document.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Lista de publicações */}
        <div className="mt-10">
          <h2 className="font-[family-name:var(--font-poppins)] text-lg font-bold">
            Publicações{' '}
            <span className="text-muted-foreground">({posts.length})</span>
          </h2>

          {posts.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center text-sm text-muted-foreground">
              Nenhuma publicação ainda. Crie a primeira acima.
            </p>
          ) : (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
                >
                  <div className="relative aspect-square w-full bg-muted">
                    <Image
                      src={post.imageUrl || '/placeholder.svg'}
                      alt={post.caption || 'Publicação'}
                      fill
                      sizes="(max-width: 640px) 100vw, 320px"
                      className="object-cover"
                    />
                    <button
                      onClick={() => handleDelete(post.id)}
                      disabled={deletingId === post.id}
                      className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-destructive shadow-md transition-colors hover:bg-destructive hover:text-background disabled:opacity-60"
                      aria-label="Excluir publicação"
                    >
                      {deletingId === post.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <div className="p-3">
                    <p className="line-clamp-2 text-sm text-foreground text-pretty">
                      {post.caption || (
                        <span className="italic text-muted-foreground">
                          Sem legenda
                        </span>
                      )}
                    </p>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      {formatDate(post.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
