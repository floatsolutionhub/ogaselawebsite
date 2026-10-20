"use client";

import { useRef, useState, useTransition } from "react";
import clsx from "clsx";
import { FileText, ImagePlus, LoaderCircle, Send, X } from "lucide-react";

import { replyDispute } from "@/app/actions/deals";
import { useToast } from "@/components/providers/ToastProvider";
import type { DisputeEvidence, DisputeThreadMessage } from "@/lib/api/types";
import { compressImage, MAX_EDGE, UploadError } from "@/lib/client/images";
import { safeHttpUrl, timeAgo } from "@/lib/format";

export function Evidence({ evidence, size = "size-20" }: { evidence: DisputeEvidence; size?: string }) {
  const url = safeHttpUrl(evidence.url);
  if (!url) return null;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={clsx("block overflow-hidden rounded-xl ring-1 ring-canvas-dark/60", size)}>
      {evidence.isPdf ? (
        <span className="flex size-full flex-col items-center justify-center bg-brand-50 text-xs text-ink-500">
          <FileText aria-hidden className="size-6 text-brand-600" /> PDF
        </span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="Evidence" referrerPolicy="no-referrer" className="size-full object-cover" />
      )}
    </a>
  );
}

export function DisputeThread({
  disputeId,
  myRole,
  resolved,
  initial,
}: {
  disputeId: string;
  myRole: "Raiser" | "Respondent";
  resolved: boolean;
  initial: DisputeThreadMessage[];
}) {
  const toast = useToast();
  const [messages, setMessages] = useState(initial);
  const [reply, setReply] = useState("");
  const [attachment, setAttachment] = useState<{ file: File; preview: string } | null>(null);
  const [sending, startSending] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  const pick = async (file: File | undefined) => {
    if (!file) return;
    try {
      // Always compressed in the browser before upload.
      const compressed = await compressImage(file, MAX_EDGE.document, "evidence");
      setAttachment({ file: compressed, preview: URL.createObjectURL(compressed) });
    } catch (error) {
      toast.error("Couldn't use that photo", error instanceof UploadError ? error.message : "Choose another photo.");
    }
  };

  const send = () =>
    startSending(async () => {
      const form = new FormData();
      form.append("disputeId", disputeId);
      form.append("body", reply.trim());
      if (attachment) form.append("attachment", attachment.file, attachment.file.name);
      const result = await replyDispute(form);
      if (result.ok) {
        setMessages((prev) => [...prev, result.data]);
        setReply("");
        if (attachment) URL.revokeObjectURL(attachment.preview);
        setAttachment(null);
      } else toast.error("Reply not sent", result.error);
    });

  return (
    <section className="space-y-3">
      <h2 className="font-semibold">Replies</h2>
      {messages.length === 0 ? (
        <p className="text-sm text-ink-500">No replies yet.</p>
      ) : (
        <ul className="space-y-3">
          {messages.map((m) => {
            const mine = m.authorRole === myRole;
            const staff = m.authorRole === "Staff";
            return (
              <li key={m.id} className={clsx("flex flex-col", mine ? "items-end" : "items-start")}>
                <div
                  className={clsx(
                    "max-w-[85%] rounded-2xl px-4 py-3",
                    mine ? "rounded-br-md bg-brand-600 text-white" : staff ? "rounded-bl-md bg-gold-50 ring-1 ring-gold-200" : "rounded-bl-md bg-white ring-1 ring-canvas-dark/60",
                  )}
                >
                  {staff && <p className="mb-1 text-xs font-semibold text-brand-700">{m.authorName}</p>}
                  <p className="whitespace-pre-wrap break-words text-[15px]">{m.body}</p>
                  {m.attachment && (
                    <div className="mt-2">
                      <Evidence evidence={m.attachment} size="size-24" />
                    </div>
                  )}
                </div>
                <span className="mt-1 px-1 text-[11px] text-ink-500">
                  {mine ? "You" : staff ? "" : m.authorName} {timeAgo(m.createdAt)}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {!resolved && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (reply.trim() && !sending) send();
          }}
          className="sticky bottom-16 rounded-2xl bg-white p-3 shadow-lift ring-1 ring-canvas-dark/60 sm:bottom-4"
        >
          {attachment && (
            <div className="mb-2 flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={attachment.preview} alt="" className="size-14 rounded-lg object-cover" />
              <button
                type="button"
                aria-label="Remove attachment"
                onClick={() => {
                  URL.revokeObjectURL(attachment.preview);
                  setAttachment(null);
                }}
                className="text-ink-500 hover:text-ink-900"
              >
                <X aria-hidden className="size-4" />
              </button>
            </div>
          )}
          <div className="flex items-end gap-2">
            <button type="button" onClick={() => fileRef.current?.click()} aria-label="Add a photo" className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600">
              <ImagePlus aria-hidden className="size-5" />
            </button>
            <label htmlFor="dispute-reply" className="sr-only">
              Reply to this dispute
            </label>
            <textarea
              id="dispute-reply"
              rows={1}
              maxLength={2000}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Reply to this dispute"
              className="max-h-32 min-h-11 flex-1 resize-none rounded-2xl border border-ink-300/50 bg-surface px-4 py-2.5 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100"
            />
            <button type="submit" disabled={!reply.trim() || sending} aria-label="Send reply" className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-600 text-white disabled:opacity-50">
              {sending ? <LoaderCircle aria-hidden className="size-5 animate-spin" /> : <Send aria-hidden className="size-5" />}
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/heic,image/heif" hidden onChange={(e) => (pick(e.target.files?.[0]), (e.target.value = ""))} />
        </form>
      )}
    </section>
  );
}
