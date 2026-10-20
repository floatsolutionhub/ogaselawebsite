import type { Metadata } from "next";

import { ScreenHeader } from "@/components/account/ScreenHeader";
import { Container } from "@/components/Container";
import { requireUser } from "@/lib/auth/session";
import { DeleteAccountForm } from "./DeleteAccountForm";

export const metadata: Metadata = { title: "Delete account", robots: { index: false } };

export default async function DeleteAccountPage() {
  await requireUser("/account/delete");
  return (
    <Container className="max-w-2xl py-8 sm:py-12">
      <ScreenHeader title="Delete account" back="/account" backLabel="Profile" />
      <DeleteAccountForm />
    </Container>
  );
}
