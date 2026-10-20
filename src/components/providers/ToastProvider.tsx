"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import clsx from "clsx";
import { CircleAlert, CircleCheck, Info, X } from "lucide-react";

type Tone = "success" | "error" | "info";
type Toast = { id: number; tone: Tone; title: string; body?: string };

type ToastApi = {
  success: (title: string, body?: string) => void;
  error: (title: string, body?: string) => void;
  info: (title: string, body?: string) => void;
};

const ToastContext = createContext<ToastApi | null>(null);
let nextId = 1;

const ICONS = { success: CircleCheck, error: CircleAlert, info: Info } as const;

/** The app's toast messages, for the web: a stack in the corner that clears itself. */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => setToasts((all) => all.filter((t) => t.id !== id)), []);

  const show = useCallback(
    (tone: Tone, title: string, body?: string) => {
      const id = nextId++;
      setToasts((all) => [...all.slice(-3), { id, tone, title, body }]);
      setTimeout(() => dismiss(id), tone === "error" ? 6500 : 4500);
    },
    [dismiss],
  );

  const api = useMemo<ToastApi>(
    () => ({
      success: (title, body) => show("success", title, body),
      error: (title, body) => show("error", title, body),
      info: (title, body) => show("info", title, body),
    }),
    [show],
  );

  return (
    <ToastContext value={api}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:items-end sm:pr-6"
      >
        {toasts.map((toast) => {
          const Icon = ICONS[toast.tone];
          return (
            <div
              key={toast.id}
              role={toast.tone === "error" ? "alert" : "status"}
              className="animate-rise pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl bg-white p-4 shadow-lift ring-1 ring-canvas-dark/70"
            >
              <Icon
                aria-hidden
                className={clsx(
                  "mt-0.5 size-5 shrink-0",
                  toast.tone === "success" && "text-success",
                  toast.tone === "error" && "text-danger",
                  toast.tone === "info" && "text-brand-600",
                )}
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink-900">{toast.title}</p>
                {toast.body && <p className="mt-0.5 text-sm text-ink-500">{toast.body}</p>}
              </div>
              <button type="button" onClick={() => dismiss(toast.id)} aria-label="Dismiss" className="text-ink-300 hover:text-ink-700">
                <X aria-hidden className="size-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext>
  );
}

export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) throw new Error("useToast must be used within ToastProvider");
  return api;
}
