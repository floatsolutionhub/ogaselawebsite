"use client";

import { createContext, ReactNode, useContext, useMemo, useState } from "react";
import type { LaunchConfig } from "@/config/launch";
import { Modal } from "./Modal";
import { InterestForm, InterestKind } from "./InterestForm";

interface LaunchContextValue extends LaunchConfig {
  /** Opens the "Join waiting list" or "Join our testers" form from anywhere on the site. */
  openInterestForm: (kind: InterestKind) => void;
}

const LaunchContext = createContext<LaunchContextValue | null>(null);

/** Gets the server-read launch settings into client components, and owns the site-wide signup modals. */
export function LaunchProvider({ config, children }: { config: LaunchConfig; children: ReactNode }) {
  const [openForm, setOpenForm] = useState<InterestKind | null>(null);
  const value = useMemo(() => ({ ...config, openInterestForm: setOpenForm }), [config]);

  return (
    <LaunchContext.Provider value={value}>
      {children}
      <Modal open={openForm === "waitlist"} onClose={() => setOpenForm(null)} title="Join the waiting list">
        <InterestForm kind="waitlist" />
      </Modal>
      <Modal open={openForm === "tester"} onClose={() => setOpenForm(null)} title="Join our testers">
        <InterestForm kind="tester" />
      </Modal>
    </LaunchContext.Provider>
  );
}

export function useLaunch(): LaunchContextValue {
  const value = useContext(LaunchContext);
  if (!value) throw new Error("useLaunch must be used inside LaunchProvider");
  return value;
}
