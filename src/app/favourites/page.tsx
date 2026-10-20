import type { Metadata } from "next";

import { Container } from "@/components/Container";
import { SectionHeading } from "@/components/market/Badges";
import { FavouritesList } from "./FavouritesList";

export const metadata: Metadata = { title: "Saved items", robots: { index: false } };

export default function FavouritesPage() {
  return (
    <Container className="py-8 sm:py-12">
      <SectionHeading eyebrow="Your basket" title="Saved items" />
      <FavouritesList />
    </Container>
  );
}
