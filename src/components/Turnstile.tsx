"use client";

import { forwardRef, useEffect, useImperativeHandle, useId, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      ready: (callback: () => void) => void;
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

function loadTurnstileScript(): void {
  if (document.querySelector(`script[src="${SCRIPT_SRC}"]`)) return;
  const script = document.createElement("script");
  script.src = SCRIPT_SRC;
  // Dynamically-created <script> elements are implicitly async by default in every browser
  // unless explicitly set to false - merely omitting `script.async = true` does NOT turn this
  // off. Cloudflare's turnstile.ready() throws if it detects async/defer on its own script tag,
  // so this explicit `false` is required, not just cosmetic.
  script.async = false;
  document.head.appendChild(script);
}

export type TurnstileHandle = {
  reset: () => void;
};

/** Cloudflare Turnstile widget. Renders explicitly once the script loads (SPA-safe), and exposes a `reset()` so a form can clear the token after a failed submit. */
export const Turnstile = forwardRef<
  TurnstileHandle,
  { siteKey: string; onVerify: (token: string) => void; onExpire?: () => void }
>(function Turnstile({ siteKey, onVerify, onExpire }, ref) {
  const containerId = `turnstile-${useId().replace(/:/g, "")}`;
  const widgetIdRef = useRef<string | undefined>(undefined);

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (widgetIdRef.current) window.turnstile?.reset(widgetIdRef.current);
    },
  }));

  useEffect(() => {
    loadTurnstileScript();

    let cancelled = false;
    const tryRender = () => {
      if (cancelled || !window.turnstile) return;
      const container = document.getElementById(containerId);
      if (!container || container.childElementCount > 0) return;

      widgetIdRef.current = window.turnstile.render(container, {
        sitekey: siteKey,
        callback: onVerify,
        "expired-callback": onExpire,
      });
    };

    if (window.turnstile) {
      window.turnstile.ready(tryRender);
    } else {
      const interval = setInterval(() => {
        if (window.turnstile) {
          clearInterval(interval);
          window.turnstile.ready(tryRender);
        }
      }, 100);
      return () => {
        cancelled = true;
        clearInterval(interval);
      };
    }

    return () => {
      cancelled = true;
      if (widgetIdRef.current) window.turnstile?.remove(widgetIdRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerId, siteKey]);

  return <div id={containerId} />;
});
