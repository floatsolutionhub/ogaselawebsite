import type { Metadata } from "next";

import { ScreenHeader } from "@/components/account/ScreenHeader";
import { Container } from "@/components/Container";
import { requireUser } from "@/lib/auth/session";
import { PasswordForm } from "./PasswordForm";

export const metadata: Metadata = { title: "Update password", robots: { index: false } };

export default async function PasswordPage() {
  await requireUser("/account/password");
  return (
    <Container className="max-w-2xl py-8 sm:py-12">
      <ScreenHeader title="Update password" />
      <PasswordForm />
    </Container>
  );
}
