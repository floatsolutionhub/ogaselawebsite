"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useRef } from "react";

import { signOutForInactivity } from "@/app/actions/auth";

/** The little the browser needs to know about who's signed in - never tokens. */
export type Viewer = {
  id: string;
  name: string | null;
  role: string;
  email: string | null;
  phone: string | null;
  photoUrl: string | null;
  sellerProfileId: string | null;
  businessName: string | null;
};

const SessionContext = createContext<Viewer | null>(null);

const PING_EVERY_MS = 60_000;
const CHECK_EVERY_MS = 15_000;

/**
 * Shares the signed-in viewer with client components, and keeps the auto sign-out honest like
 * the app does: any click or key press counts as activity (pinged to the server at most once a
 * minute), and once the tab has been idle for the limit it signs out.
 */
export function SessionProvider({
  viewer,
  idleMinutes,
  children,
}: {
  viewer: Viewer | null;
  idleMinutes: number;
  children: React.ReactNode;
}) {
  const lastActivity = useRef(0);
  const lastPing = useRef(0);
  const signingOut = useRef(false);
  const router = useRouter();

  useEffect(() => {
    if (!viewer) return;
    lastActivity.current = Date.now();
    lastPing.current = Date.now();

    const onActivity = () => {
      const now = Date.now();
      lastActivity.current = now;
      if (now - lastPing.current >= PING_EVERY_MS) {
        lastPing.current = now;
        fetch("/api/activity", { method: "POST", credentials: "same-origin", keepalive: true }).catch(() => {});
      }
    };
    const events = ["pointerdown", "keydown", "scroll", "touchstart"] as const;
    events.forEach((name) => window.addEventListener(name, onActivity, { passive: true }));

    const timer = setInterval(() => {
      // A hidden tab is still idle - it's the time since the person last did something that counts.
      if (!signingOut.current && Date.now() - lastActivity.current >= idleMinutes * 60_000) {
        signingOut.current = true;
        signOutForInactivity().catch(() => router.replace("/sign-in?reason=idle"));
      }
    }, CHECK_EVERY_MS);

    return () => {
      events.forEach((name) => window.removeEventListener(name, onActivity));
      clearInterval(timer);
    };
  }, [viewer, idleMinutes, router]);

  return <SessionContext value={viewer}>{children}</SessionContext>;
}

export function useViewer(): Viewer | null {
  return useContext(SessionContext);
}
