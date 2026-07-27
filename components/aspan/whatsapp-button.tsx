import { MessageCircle } from 'lucide-react'

export function WhatsappButton() {
  return (
    <a
      href="https://wa.me/5583987948792"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Fale conosco pelo WhatsApp"
      className="group fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-primary px-4 py-3.5 font-semibold text-primary-foreground shadow-xl shadow-primary/40 transition-all hover:scale-105"
    >
      <MessageCircle className="h-6 w-6" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm opacity-0 transition-all duration-300 group-hover:max-w-32 group-hover:opacity-100">
        Fale conosco
      </span>
    </a>
  )
}
