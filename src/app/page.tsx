import { Hero } from "@/components/sections/Hero";
import { CategoryGallery } from "@/components/sections/CategoryGallery";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Features } from "@/components/sections/Features";
import { GetInvolved } from "@/components/sections/GetInvolved";
import { Faqs } from "@/components/sections/Faqs";
import { CtaBanner } from "@/components/sections/CtaBanner";

export default function Home() {
  return (
    <>
      <Hero />
      <CategoryGallery />
      <HowItWorks />
      <Features />
      <GetInvolved />
      <Faqs />
      <CtaBanner />
    </>
  );
}
