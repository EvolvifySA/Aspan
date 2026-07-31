'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export function PostImageCarousel({
  alt,
  className,
  imageClassName,
  images,
  sizes,
}: {
  alt: string
  className?: string
  imageClassName?: string
  images: string[]
  sizes: string
}) {
  const safeImages = images.length > 0 ? images : ['/placeholder.svg']
  const [index, setIndex] = useState(0)
  const hasMany = safeImages.length > 1

  function previous() {
    setIndex((current) => (current === 0 ? safeImages.length - 1 : current - 1))
  }

  function next() {
    setIndex((current) => (current === safeImages.length - 1 ? 0 : current + 1))
  }

  return (
    <div className={cn('relative aspect-square w-full overflow-hidden bg-muted', className)}>
      <Image
        src={safeImages[index]}
        alt={alt}
        fill
        sizes={sizes}
        className={cn('object-cover', imageClassName)}
      />

      {hasMany && (
        <>
          <button
            type="button"
            onClick={previous}
            className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-foreground shadow-md transition-colors hover:bg-background"
            aria-label="Foto anterior"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/90 text-foreground shadow-md transition-colors hover:bg-background"
            aria-label="Próxima foto"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {safeImages.map((image, itemIndex) => (
              <button
                key={`${image}-${itemIndex}`}
                type="button"
                onClick={() => setIndex(itemIndex)}
                className={cn(
                  'h-2 rounded-full bg-background/70 transition-all',
                  itemIndex === index ? 'w-5' : 'w-2',
                )}
                aria-label={`Ver foto ${itemIndex + 1}`}
              />
            ))}
          </div>
          <span className="absolute right-3 top-3 rounded-full bg-foreground/75 px-2.5 py-1 text-xs font-semibold text-background">
            {index + 1}/{safeImages.length}
          </span>
        </>
      )}
    </div>
  )
}
