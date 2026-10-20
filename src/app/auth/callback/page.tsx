import type { Metadata } from "next";

import { Container } from "@/components/Container";
import { SocialCallback } from "./SocialCallback";

export const metadata: Metadata = { title: "Signing you in", robots: { index: false } };

export default function CallbackPage() {
  return (
    <Container className="py-20">
      <SocialCallback />
    </Container>
  );
}
