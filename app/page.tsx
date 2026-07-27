import { Header } from '@/components/aspan/header'
import { Hero } from '@/components/aspan/hero'
import { About } from '@/components/aspan/about'
import { Benefits } from '@/components/aspan/benefits'
import { Services } from '@/components/aspan/services'
import { Transparency } from '@/components/aspan/transparency'
import { Campaign } from '@/components/aspan/campaign'
import { Partners } from '@/components/aspan/partners'
import { VideoSection } from '@/components/aspan/video'
import { InstitutionCarousel } from '@/components/aspan/institution-carousel'
import { Testimonials } from '@/components/aspan/testimonials'
import { DonateCta } from '@/components/aspan/donate-cta'
import { UpdatesCta } from '@/components/aspan/updates-cta'
import { Footer } from '@/components/aspan/footer'
import { WhatsappButton } from '@/components/aspan/whatsapp-button'

export default function Page() {
  return (
    <div className="relative min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <About />
        <Benefits />
        <Services />
        <Transparency />
        <Campaign />
        <Partners />
        <VideoSection />
        <InstitutionCarousel />
        <Testimonials />
        <DonateCta />
        <UpdatesCta />
      </main>
      <Footer />
      <WhatsappButton />
    </div>
  )
}
