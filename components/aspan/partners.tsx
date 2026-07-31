import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { Reveal } from '@/components/reveal'

const partners = [
  { name: 'Cidade Viva', logo: '/images/cidadeviva.png' },
  { name: 'CMDI', logo: '/images/CMDI.jpg' },
  { name: 'CNTRL', logo: '/images/cntrl.png' },
  { name: 'Consolacao', logo: '/images/consolacao.png' },
  { name: 'Grau', logo: '/images/grau.webp' },
  { name: 'IFPB', logo: '/images/ifpb.webp' },
  { name: 'La Torre', logo: '/images/latorre-removebg-preview.png' },
  { name: 'Arquidiocese', logo: '/images/logo-arquidiocese.png' },
  { name: 'CACEPA', logo: '/images/logo-cacepa.webp' },
  { name: 'Mesa Brasil', logo: '/images/mesabrasil.png' },
  { name: 'Sicredi', logo: '/images/sicredi.webp' },
  { name: 'Superbox', logo: '/images/superbox-removebg-preview.png' },
  {
    name: 'Supermercado Manaira',
    logo: '/images/supermercadomanaira-removebg-preview.png',
  },
]

export function Partners() {
  return (
    <section id="parceiros" className="px-4 py-16 md:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <span className="text-sm font-semibold uppercase tracking-widest text-primary">
            Empresas parceiras
          </span>
          <h2 className="mt-3 font-[family-name:var(--font-poppins)] text-3xl font-bold leading-tight tracking-tight text-balance md:text-4xl">
            Conheça algumas empresas parceiras da ASPAN
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground text-pretty">
            Você sabia que os serviços e produtos que a sua empresa oferece
            podem trazer mais alegria para os idosos da ASPAN? Se a sua empresa
            oferece serviços referentes a beleza e estética, que tal
            proporcionar um dia de beleza aos nossos idosos? Se você é dono de um
            supermercado, donativos como produtos de higiene pessoal e limpeza
            serão de grande ajuda.
          </p>
          <a
            href="#contato"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition-all hover:scale-105"
          >
            Seja um parceiro
            <ArrowRight className="h-5 w-5" />
          </a>
        </Reveal>

        <Reveal delay={120}>
          <div className="mx-auto grid max-w-md grid-cols-3 gap-3 sm:grid-cols-4 lg:justify-self-end">
            {partners.map((p) => (
              <div
                key={p.name}
                className="flex aspect-square items-center justify-center rounded-2xl border border-border bg-card/50 p-3 transition-all hover:border-accent/40 hover:bg-card"
              >
                <Image
                  src={p.logo}
                  alt={p.name}
                  width={110}
                  height={110}
                  className="h-full w-full object-contain"
                />
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
