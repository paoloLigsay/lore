import { Nav } from "@/components/marketing/nav";
import { Hero } from "@/components/marketing/hero";
import { ProductPreview } from "@/components/marketing/product-preview";
import { ValueProps } from "@/components/marketing/value-props";
import { UseCases } from "@/components/marketing/use-cases";
import { FinalCta } from "@/components/marketing/final-cta";
import { Footer } from "@/components/marketing/footer";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-background text-foreground">
      <Nav />
      <Hero />
      <ProductPreview />
      <ValueProps />
      <UseCases />
      <FinalCta />
      <Footer />
    </div>
  );
}
