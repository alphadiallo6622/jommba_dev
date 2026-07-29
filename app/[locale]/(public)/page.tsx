import HeroSection from "@/components/home/HeroSection";
import StatsSection from "@/components/home/StatsSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import PricingSection from "@/components/home/PricingSection";
import IslamicQuoteSection from "@/components/home/IslamicQuoteSection";
import CTASection from "@/components/home/CTASection";
import { getPlatformSettings } from "@/lib/admin/queries";
import { HOME_MONTHLY_PRICE, homeOriginalPrice } from "@/data/pricing";

export default async function Home() {
  // Les limites du plan Free et le tarif de référence Premium affichés dans la
  // section Tarifs viennent du Dashboard Admin — jamais de valeurs en dur ici.
  const { limits, pricing } = await getPlatformSettings();

  return (
    <>
      <HeroSection />
      <StatsSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <PricingSection
        limits={limits}
        monthlyPrice={HOME_MONTHLY_PRICE}
        originalPrice={homeOriginalPrice(pricing.monthlyPrice)}
      />
      <IslamicQuoteSection />
      <CTASection />
    </>
  );
}
