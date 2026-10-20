import type { Metadata } from "next";

import { ScreenHeader } from "@/components/account/ScreenHeader";
import { Container } from "@/components/Container";
import { settle } from "@/lib/api/client";
import { getMyDocuments } from "@/lib/api/services/me";
import { requireUser } from "@/lib/auth/session";
import { safeHttpUrl } from "@/lib/format";
import { PersonalInfo } from "./PersonalInfo";

export const metadata: Metadata = { title: "Personal info", robots: { index: false } };

export default async function PersonalInfoPage() {
  const user = await requireUser("/account/personal");
  const documents = await settle(getMyDocuments());
  return (
    <Container className="max-w-2xl py-8 sm:py-12">
      <ScreenHeader title="Personal info" />
      <PersonalInfo
        name={user.name ?? ""}
        email={user.email}
        phone={user.phone}
        photoUrl={safeHttpUrl(user.profilePhotoUrl)}
        isVerified={user.sellerProfile?.verificationStatus === "Verified"}
        documents={documents ?? []}
        documentsLoaded={documents !== null}
      />
    </Container>
  );
}
