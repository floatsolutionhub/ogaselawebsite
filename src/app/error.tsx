"use client";

import { CloudOff } from "lucide-react";

import { Container } from "@/components/Container";
import { EmptyState } from "@/components/market/Badges";
import { buttonClass } from "@/components/ui/styles";

// Never shows error details - they can contain server internals. The digest lets us find it in logs.
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Container className="py-16">
      <EmptyState
        icon={CloudOff}
        title="Something went wrong"
        action={
          <button type="button" onClick={reset} className={buttonClass("primary")}>
            Try again
          </button>
        }
      >
        The market hit a snag loading this page. Please try again.
        {error.digest && <span className="mt-2 block text-xs text-ink-300">Ref: {error.digest}</span>}
      </EmptyState>
    </Container>
  );
}
