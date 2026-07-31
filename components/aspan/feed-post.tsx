import Image from 'next/image'
import { PostImageCarousel } from '@/components/aspan/post-image-carousel'

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'long',
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
  }).format(date)
}

export type FeedPostData = {
  id: number
  imageUrl: string
  imageUrls?: unknown
  caption: string
  createdAt: Date | string
}

export function FeedPost({ post }: { post: FeedPostData }) {
  const created =
    typeof post.createdAt === 'string' ? new Date(post.createdAt) : post.createdAt
  const images = Array.isArray(post.imageUrls)
    ? post.imageUrls.filter((image): image is string => typeof image === 'string')
    : [post.imageUrl].filter(Boolean)

  return (
    <article className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
      <header className="flex items-center gap-3 px-4 py-3">
        <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-border bg-background">
          <Image
            src="/images/aspan-logo.webp"
            alt=""
            width={40}
            height={40}
            className="h-8 w-auto"
          />
        </span>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold text-foreground">ASPAN</span>
          <span className="text-xs text-muted-foreground">
            {formatDate(created)}
          </span>
        </div>
      </header>

      <PostImageCarousel
        alt={post.caption || 'Atualizacao da ASPAN'}
        images={images}
        sizes="(max-width: 640px) 100vw, 600px"
      />

      {post.caption && (
        <div className="px-4 py-4">
          <p className="text-sm leading-relaxed text-foreground text-pretty">
            <span className="font-semibold">ASPAN</span> {post.caption}
          </p>
        </div>
      )}
    </article>
  )
}
