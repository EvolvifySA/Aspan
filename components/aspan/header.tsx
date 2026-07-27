'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Menu, X, Heart, Camera } from 'lucide-react'
import { AspanLogo } from './logo'
import { cn } from '@/lib/utils'

const navLinks = [
  { label: 'Início', href: '/#inicio' },
  { label: 'Quem Somos', href: '/#quem-somos' },
  { label: 'Serviços', href: '/#servicos' },
  { label: 'Transparência', href: '/#transparencia' },
  { label: 'Parceiros', href: '/#parceiros' },
  { label: 'Contato', href: '/#contato' },
]

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4">
      <div
        className={cn(
          'mx-auto flex max-w-6xl items-center justify-between rounded-full border border-transparent px-5 py-3 transition-all duration-300 md:px-6',
          scrolled
            ? 'border-border bg-card/80 shadow-lg shadow-accent/5 backdrop-blur-xl'
            : 'bg-transparent',
        )}
      >
        <Link href="/#inicio" aria-label="Início">
          <AspanLogo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/atualizacoes"
            className="hidden items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-2.5 text-sm font-semibold text-accent transition-all hover:scale-105 hover:bg-accent/20 lg:flex"
          >
            <Camera className="h-4 w-4" />
            Atualizações
          </Link>
          <a
            href="/#doar"
            className="hidden items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:scale-105 hover:shadow-primary/50 sm:flex"
          >
            <Heart className="h-4 w-4 fill-current" />
            Doar agora
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-secondary text-foreground transition-colors hover:bg-muted md:hidden"
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          'mx-auto mt-2 max-w-6xl overflow-hidden rounded-3xl border border-border bg-card/95 backdrop-blur-xl transition-all duration-300 md:hidden',
          open ? 'max-h-96 opacity-100' : 'pointer-events-none max-h-0 opacity-0',
        )}
      >
        <nav className="flex flex-col p-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-2xl px-4 py-3 text-base font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/atualizacoes"
            onClick={() => setOpen(false)}
            className="mt-1 flex items-center gap-2 rounded-2xl px-4 py-3 text-base font-medium text-accent transition-colors hover:bg-secondary"
          >
            <Camera className="h-4 w-4" />
            Atualizações
          </Link>
          <a
            href="/#doar"
            onClick={() => setOpen(false)}
            className="mt-2 flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-base font-semibold text-primary-foreground"
          >
            <Heart className="h-4 w-4 fill-current" />
            Doar agora
          </a>
        </nav>
      </div>
    </header>
  )
}
