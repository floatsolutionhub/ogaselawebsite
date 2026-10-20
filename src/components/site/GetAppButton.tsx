"use client";

import { ReactNode } from "react";
import { BellRing, Download } from "lucide-react";
import { Button } from "./Button";
import { useLaunch } from "./LaunchProvider";

/**
 * Every "Get the app" on the site. Before launch (NEXT_APP_LIVE=false) it's "Join waiting list"
 * and opens the waiting-list form; after launch it jumps to the store badges on the homepage.
 */
export function GetAppButton({
  variant = "primary",
  className,
  onClick,
  liveLabel = "Get the app",
}: {
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  /** Extra work on click, e.g. closing the mobile menu. */
  onClick?: () => void;
  liveLabel?: ReactNode;
}) {
  const { appLive, openInterestForm } = useLaunch();

  if (appLive) {
    return (
      <Button href="/#download" variant={variant} className={className} onClick={onClick}>
        <Download size={16} /> {liveLabel}
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      className={className}
      onClick={() => {
        onClick?.();
        openInterestForm("waitlist");
      }}
    >
      <BellRing size={16} /> Join waiting list
    </Button>
  );
}
