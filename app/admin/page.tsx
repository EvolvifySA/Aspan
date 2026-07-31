import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { getPosts } from '@/app/actions/posts'
import { getTransparencyDocuments } from '@/app/actions/transparency'
import { AdminDashboard } from '@/components/aspan/admin-dashboard'
import { isDatabaseConfigured } from '@/lib/demo-posts'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  if (!isDatabaseConfigured()) {
    const posts = await getPosts()
    return <AdminDashboard posts={posts} transparencyDocuments={[]} userName="Modo demo" />
  }

  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect('/admin/login')

  const posts = await getPosts()
  const transparencyDocuments = await getTransparencyDocuments()

  return (
    <AdminDashboard
      posts={posts}
      transparencyDocuments={transparencyDocuments}
      userName={session.user.name}
    />
  )
}
