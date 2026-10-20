import Link from "next/link";
import { SearchX } from "lucide-react";

import { Container } from "@/components/Container";
import { EmptyState } from "@/components/market/Badges";
import { buttonClass } from "@/components/ui/styles";

export default function NotFound() {
  return (
    <Container className="py-16">
      <EmptyState
        icon={SearchX}
        title="This stall has packed up"
        action={
          <Link href="/" className={buttonClass("primary")}>
            Back to the market
          </Link>
        }
      >
        The page or item you&apos;re looking for isn&apos;t here any more. It may have been sold or removed.
      </EmptyState>
    </Container>
  );
}
