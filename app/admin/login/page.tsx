import Link from 'next/link'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { ArrowLeft } from 'lucide-react'
import { auth } from '@/lib/auth'
import { AspanLogo } from '@/components/aspan/logo'
import { AdminAuthForm } from '@/components/aspan/admin-auth-form'

export const dynamic = 'force-dynamic'

function sanitizeRedirect(value: string | undefined) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/admin'
  return value
}

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ redirect?: string }>
}) {
  const params = await searchParams
  const redirectTo = sanitizeRedirect(params?.redirect)
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user) redirect(redirectTo)

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10">
        <Link
          href="/atualizacoes"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Ver atualizações
        </Link>

        <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
          <div className="mb-8 flex flex-col items-center text-center">
            <AspanLogo showWordmark={false} className="scale-125" />
            <h1 className="mt-5 font-[family-name:var(--font-poppins)] text-2xl font-extrabold tracking-tight">
              Painel administrativo
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">
              Acesse para publicar fotos e novidades no feed da ASPAN.
            </p>
          </div>

          <AdminAuthForm redirectTo={redirectTo} />
        </div>
      </div>
    </main>
  )
}
