"use client";

import { useEffect, useRef } from "react";
import clsx from "clsx";
import { X } from "lucide-react";

/**
 * A modal built on the native <dialog>: the browser handles focus trapping, Escape and the
 * backdrop. On phones it sits at the bottom like the app's sheets; on wider screens it centres.
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  dismissible = true,
  placement = "auto",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  /** False while something is in flight, so it can't be closed halfway. */
  dismissible?: boolean;
  /** "sheet" stays at the bottom on every screen and slides up into view. */
  placement?: "auto" | "sheet";
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onCancel={(event) => {
        event.preventDefault();
        if (dismissible) onClose();
      }}
      onClick={(event) => {
        // A click on the backdrop lands on the <dialog> itself.
        if (event.target === ref.current && dismissible) onClose();
      }}
      className={clsx(
        "m-0 mt-auto max-h-[92dvh] w-full max-w-none overflow-hidden rounded-t-3xl bg-white p-0 text-ink-900 shadow-lift backdrop:bg-ink-900/50 backdrop:backdrop-blur-[2px]",
        placement === "auto" ? "sm:m-auto sm:rounded-3xl" : "animate-sheet-up sm:mx-auto sm:mb-0 sm:mt-auto",
        size === "sm" && "sm:max-w-md",
        size === "md" && "sm:max-w-lg",
        size === "lg" && "sm:max-w-2xl",
      )}
    >
      {open && (
        <div className="flex max-h-[92dvh] flex-col">
          <div className="flex items-start justify-between gap-4 px-6 pb-2 pt-5">
            <div>
              <h2 className="text-lg font-semibold">{title}</h2>
              {description && <div className="mt-1 text-sm text-ink-500">{description}</div>}
            </div>
            {dismissible && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="-mr-2 grid size-9 shrink-0 place-items-center rounded-full text-ink-500 hover:bg-canvas"
              >
                <X aria-hidden className="size-5" />
              </button>
            )}
          </div>
          <div className="overflow-y-auto px-6 pb-5 pt-2">{children}</div>
          {footer && <div className="border-t border-canvas-dark/60 bg-surface px-6 py-4">{footer}</div>}
        </div>
      )}
    </dialog>
  );
}
