"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Cookie } from "lucide-react";
import Link from "next/link";

const STORAGE_KEY = "ogasela_cookie_consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // localStorage doesn't exist during SSR, so this has to be a client-only effect rather than
    // computed during render - that's also why the initial `visible` state above is `false`
    // (matching what the server rendered) rather than deciding synchronously here.
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      // Private-browsing/blocked storage - fall back to not showing rather than crashing.
    }
  }, []);

  function accept() {
    try {
      localStorage.setItem(STORAGE_KEY, "accepted");
    } catch {
      // Ignore - the banner will simply reappear next visit if storage isn't available.
    }
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          transition={{ duration: 0.3, ease: [0.21, 0.47, 0.32, 0.98] }}
          className="fixed inset-x-0 bottom-0 z-[90] p-4 sm:p-6"
        >
          <div className="mx-auto flex max-w-3xl flex-col items-start gap-4 rounded-3xl bg-ink-900 p-6 text-white shadow-2xl sm:flex-row sm:items-center">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/10">
              <Cookie size={20} className="text-gold-400" />
            </div>
            <p className="flex-1 text-sm leading-relaxed text-white/80">
              We only use essential cookies to keep the site working. See our{" "}
              <Link href="/privacy-policy#cookies" className="font-semibold text-white hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
            <button
              type="button"
              onClick={accept}
              className="w-full flex-shrink-0 rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-400 sm:w-auto"
            >
              Accept
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
