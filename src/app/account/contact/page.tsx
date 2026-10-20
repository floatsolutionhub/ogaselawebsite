import type { Metadata } from "next";

import { ScreenHeader } from "@/components/account/ScreenHeader";
import { Container } from "@/components/Container";
import { settle } from "@/lib/api/client";
import { getMyChangeRequests } from "@/lib/api/services/me";
import { requireUser } from "@/lib/auth/session";
import { ChangeContact } from "./ChangeContact";

export const metadata: Metadata = { title: "Change contact", robots: { index: false } };

export default async function ChangeContactPage({ searchParams }: PageProps<"/account/contact">) {
  const kind = (await searchParams).type === "email" ? "Email" : "Phone";
  const user = await requireUser(`/account/contact?type=${kind.toLowerCase()}`);
  const changes = await settle(getMyChangeRequests());
  return (
    <Container className="max-w-2xl py-8 sm:py-12">
      <ScreenHeader title={kind === "Phone" ? "Change phone number" : "Change email"} />
      <ChangeContact
        key={kind}
        kind={kind}
        current={kind === "Phone" ? user.phone : user.email}
        change={(changes ?? []).find((c) => c.type === kind)}
      />
    </Container>
  );
}
