import { BottomCta } from "@/components/homepage/BottomCta";
import {
  ApplyConfidenceSection,
  ManageSearchSection,
} from "@/components/homepage/FeatureSection";
import { Hero } from "@/components/homepage/Hero";
import { Testimonial } from "@/components/homepage/Testimonial";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

export function Homepage() {
  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <main className="mx-auto max-w-[1268px] border-x border-border bg-surface">
        <Hero />
        <ManageSearchSection />
        <div className="landing-grid-bg h-16 border-b border-border" />
        <ApplyConfidenceSection />
        <div className="landing-grid-bg h-16 border-b border-border" />
        <Testimonial />
        <div className="landing-grid-bg h-16 border-b border-border" />
        <BottomCta />
        <div className="landing-grid-bg h-16" />
      </main>
      <Footer />
    </div>
  );
}
