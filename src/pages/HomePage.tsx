import { Navbar } from "../components/layout/Navbar";
import { Footer } from "../components/layout/Footer";
import { Hero } from "../components/sections/Hero";
import { Trust } from "../components/sections/Trust";
import { Portfolio } from "../components/sections/Portfolio";
import { WhyChooseUs } from "../components/sections/WhyChooseUs";
import { HowItWorks } from "../components/sections/HowItWorks";
import { Pricing } from "../components/sections/Pricing";
import { Testimonials } from "../components/sections/Testimonials";
import { Founder } from "../components/sections/Founder";
import { About } from "../components/sections/About";
import { FAQ } from "../components/sections/FAQ";
import { FinalCTA } from "../components/sections/FinalCTA";

export function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Trust />
        <Portfolio />
        <WhyChooseUs />
        <HowItWorks />
        <Pricing />
        <Testimonials />
        {/* <Founder /> */}
        <About />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
