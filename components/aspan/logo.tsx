import Image from 'next/image'
import { cn } from '@/lib/utils'

export function AspanLogo({
  className,
  showWordmark = true,
}: {
  className?: string
  showWordmark?: boolean
}) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <Image
        src="/images/aspan-logo.webp"
        alt="Logotipo da ASPAN - Associação Promocional do Ancião"
        width={44}
        height={44}
        className="h-10 w-auto"
        priority
      />
      {showWordmark && (
        <span className="flex flex-col leading-none">
          <span className="font-[family-name:var(--font-poppins)] text-xl font-extrabold tracking-tight text-accent">
            ASPAN
          </span>
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Associação Promocional do Ancião
          </span>
        </span>
      )}
    </span>
  )
}
