import Image from 'next/image'
import { Building2, ArrowRight } from 'lucide-react'
import { Reveal } from '@/components/reveal'

// Substitua os itens abaixo pelos logos reais das empresas parceiras.
// Basta colocar a imagem em /public/images e informar o caminho em `logo`.
const partners = [
  { name: 'Parceiro 1', logo: '' },
  { name: 'Parceiro 2', logo: '' },
  { name: 'Parceiro 3', logo: '' },
  { name: 'Parceiro 4', logo: '' },
  { name: 'Parceiro 5', logo: '' },
  { name: 'Parceiro 6', logo: '' },
  { name: 'Parceiro 7', logo: '' },
  { name: 'Parceiro 8', logo: '' },
  { name: 'Parceiro 9', logo: '' },
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
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            {partners.map((p) => (
              <div
                key={p.name}
                className="flex aspect-square items-center justify-center rounded-3xl border border-border bg-card/50 p-4 transition-all hover:border-accent/40 hover:bg-card"
              >
                {p.logo ? (
                  <Image
                    src={p.logo || '/placeholder.svg'}
                    alt={p.name}
                    width={120}
                    height={120}
                    className="h-full w-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Building2 className="h-7 w-7" />
                    <span className="text-center text-[11px] font-medium leading-tight">
                      {p.name}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
