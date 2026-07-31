import {
  Camera,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Users,
} from 'lucide-react'
import { AspanLogo } from './logo'
import { Reveal } from '@/components/reveal'

const whatsappUrl =
  'https://api.whatsapp.com/send/?phone=5583987948792&text&type=phone_number&app_absent=0'
const emailUrl = 'mailto:contato@aspan.com.br'
const instagramUrl = 'https://www.instagram.com/aspanlardeidosos/'
const facebookUrl =
  'https://www.facebook.com/associacaopromocionaldoanciao/'
const address =
  'R. Antônio Correia de Matos, 55 — Cristo Redentor, João Pessoa — PB, 58071-310'
const mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`

const contacts = [
  { icon: Mail, label: 'contato@aspan.com.br', href: emailUrl },
  { icon: Phone, label: '(83) 98794-8792', href: 'tel:+5583987948792' },
  { icon: Phone, label: '(83) 3223-2163', href: 'tel:+558332232163' },
]

const socialButtons = [
  {
    icon: Camera,
    label: 'Instagram',
    href: instagramUrl,
  },
  {
    icon: Users,
    label: 'Facebook',
    href: facebookUrl,
  },
]

export function Footer() {
  return (
    <footer id="contato" className="px-4 pb-10 pt-16 md:pt-24">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 rounded-[2.5rem] border border-border bg-card/50 p-6 md:p-10 lg:grid-cols-2">
          <Reveal>
            <span className="text-sm font-semibold uppercase tracking-widest text-primary">
              Contato
            </span>
            <h2 className="mt-3 font-[family-name:var(--font-poppins)] text-3xl font-bold leading-tight tracking-tight text-balance md:text-4xl">
              Fale com a gente
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground text-pretty">
              Estamos à disposição para tirar dúvidas, receber doações e acolher
              quem precisa. Entre em contato pelos canais abaixo.
            </p>

            <ul className="mt-8 flex flex-col gap-3">
              {contacts.map((c) => (
                <li key={c.label}>
                  <a
                    href={c.href}
                    className="flex items-center gap-3 rounded-2xl border border-border bg-secondary/40 px-4 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-secondary"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
                      <c.icon className="h-4 w-4" />
                    </span>
                    {c.label}
                  </a>
                </li>
              ))}
              <li className="flex items-start gap-3 rounded-2xl border border-border bg-secondary/40 px-4 py-3 text-sm font-medium text-foreground">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <MapPin className="h-4 w-4" />
                </span>
                {address}
              </li>
            </ul>
          </Reveal>

          <Reveal delay={120}>
            <div className="flex h-full flex-col gap-4 rounded-[2rem] border border-border bg-background/60 p-6 backdrop-blur">
              <h3 className="font-[family-name:var(--font-poppins)] text-lg font-semibold text-foreground">
                Converse com a ASPAN
              </h3>

              <div className="grid gap-3 sm:grid-cols-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:scale-[1.02]"
                >
                  <MessageCircle className="h-5 w-5" />
                  WhatsApp
                </a>
                <a
                  href={emailUrl}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-5 py-3.5 text-sm font-semibold text-foreground transition-all hover:scale-[1.02] hover:border-primary/40"
                >
                  <Mail className="h-5 w-5" />
                  E-mail
                </a>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {socialButtons.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-secondary/40 px-5 py-3.5 text-sm font-semibold text-foreground transition-all hover:scale-[1.02] hover:border-primary/40 hover:bg-secondary"
                  >
                    <social.icon className="h-5 w-5" />
                    {social.label}
                  </a>
                ))}
              </div>

              <div className="mt-2 overflow-hidden rounded-2xl border border-border bg-secondary/40">
                <iframe
                  title="Localização da ASPAN"
                  src={mapUrl}
                  className="h-72 w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </Reveal>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-sm text-muted-foreground md:flex-row">
          <AspanLogo />
          <p className="text-center">
            © {new Date().getFullYear()} ASPAN — Associação Promocional do
            Ancião. Feito por Evolvify.
          </p>
        </div>
      </div>
    </footer>
  )
}
