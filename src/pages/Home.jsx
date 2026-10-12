import { About } from "../components/About";
import { Cta } from "../components/Cta";
import { Features } from "../components/Features";
import { Footer } from "../components/Footer";
import { Hero } from "../components/Hero";
import { HowItWorks } from "../components/HowItWorks";
import { Navbar } from "../components/Navbar";
import { Newsletter } from "../components/Newsletter";
import { ScrollToTop } from "../components/ScrollToTop";
import { Services } from "../components/Services";
import { Team } from "../components/Team";
import { ThemeProvider } from "../components/theme-provider";
import "../App.css";

export default function Home() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="imupilot-light-theme">
      <>
        <Navbar />
        <Hero />
        <About />
        <HowItWorks />
        <Features />
        <Team />
        <Newsletter />
        <Services />
        <Cta />
        <Footer />
        <ScrollToTop />
      </>
    </ThemeProvider>
  );
}