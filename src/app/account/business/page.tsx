import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ScreenHeader } from "@/components/account/ScreenHeader";
import { Container } from "@/components/Container";
import { settle } from "@/lib/api/client";
import { getMyChangeRequests, getMyDocuments } from "@/lib/api/services/me";
import { requireUser } from "@/lib/auth/session";
import { BusinessInfo } from "./BusinessInfo";

export const metadata: Metadata = { title: "Business info", robots: { index: false } };

export default async function BusinessInfoPage() {
  const user = await requireUser("/account/business");
  if (!user.sellerProfile) redirect("/account/settings");
  const [changes, documents] = await Promise.all([settle(getMyChangeRequests()), settle(getMyDocuments())]);
  return (
    <Container className="max-w-2xl py-8 sm:py-12">
      <ScreenHeader title="Business info" />
      <BusinessInfo
        businessName={user.sellerProfile.businessName}
        storeAddress={user.sellerProfile.storeAddress ?? ""}
        isBusinessVerified={!!user.sellerProfile.businessVerifiedAt}
        change={(changes ?? []).find((c) => c.type === "BusinessInfo")}
        documents={documents ?? []}
      />
    </Container>
  );
}
