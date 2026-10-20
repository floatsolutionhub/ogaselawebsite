"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import clsx from "clsx";
import { Camera, FileText, ImagePlus, LoaderCircle, MessageCircle, Paperclip, X } from "lucide-react";

import { openDispute } from "@/app/actions/deals";
import { useToast } from "@/components/providers/ToastProvider";
import { buttonClass, cardClass, inputClass } from "@/components/ui/styles";
import type { DisputeReason } from "@/lib/api/types";
import { MAX_EDGE, prepareFile, UploadError } from "@/lib/client/images";
import { safeHttpUrl, shortDate } from "@/lib/format";
import { BUYER_REASONS, DISPUTE_REASON_LABELS, SELLER_REASONS } from "@/lib/statuses";

const MIN_DESCRIPTION = 20;
const MAX_FILES = 4;

export function NewDisputeForm({
  listing,
  isSeller,
  conversationId: fixedConversation,
  chats,
}: {
  listing: { id: string; title: string; image: string | null; sellerName: string };
  isSeller: boolean;
  conversationId: string | null;
  chats: { id: string; at: string }[];
}) {
  const router = useRouter();
  const toast = useToast();
  const [conversationId, setConversationId] = useState(fixedConversation);
  const [reason, setReason] = useState<DisputeReason | null>(null);
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<{ file: File; preview: string | null }[]>([]);
  const [preparing, setPreparing] = useState(false);
  const [submitting, startSubmitting] = useTransition();
  const photoRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const pdfRef = useRef<HTMLInputElement>(null);

  const reasons = isSeller ? SELLER_REASONS : BUYER_REASONS;
  const canSubmit = !!reason && description.trim().length >= MIN_DESCRIPTION && (!isSeller || !!conversationId) && !submitting && !preparing;
  const image = safeHttpUrl(listing.image);

  const add = async (picked: FileList | null) => {
    if (!picked?.length) return;
    setPreparing(true);
    try {
      // Evidence photos are compressed in the browser; PDFs are capped at 10MB.
      const prepared = await Promise.all(Array.from(picked).slice(0, MAX_FILES - files.length).map((f) => prepareFile(f, MAX_EDGE.document, true)));
      setFiles((prev) =>
        [...prev, ...prepared.map((file) => ({ file, preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null }))].slice(0, MAX_FILES),
      );
    } catch (error) {
      toast.error("Couldn't use that file", error instanceof UploadError ? error.message : "Choose another file.");
    } finally {
      setPreparing(false);
    }
  };

  const submit = () =>
    startSubmitting(async () => {
      if (!reason) return;
      const form = new FormData();
      form.append("listingId", listing.id);
      if (conversationId) form.append("conversationId", conversationId);
      form.append("reason", reason);
      form.append("description", description.trim());
      files.forEach(({ file }) => form.append("evidence", file, file.name));
      const result = await openDispute(form);
      if (result.ok) {
        toast.success(`Dispute ${result.data.reference} opened`, "We've told the other party. Our team will review it.");
        router.replace(`/disputes/${result.data.id}`);
      } else toast.error("Couldn't open the dispute", result.error);
    });

  return (
    <div className="mt-6 space-y-5">
      <div className={`${cardClass} flex items-center gap-4 p-4`}>
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" referrerPolicy="no-referrer" className="size-14 rounded-xl object-cover" />
        ) : (
          <span className="size-14 rounded-xl bg-brand-50" />
        )}
        <div className="min-w-0">
          <p className="line-clamp-2 font-semibold">{listing.title}</p>
          <p className="text-sm text-ink-500">{isSeller ? "Your ad" : `Sold by ${listing.sellerName}`}</p>
        </div>
      </div>

      {isSeller && !fixedConversation && (
        <section className={`${cardClass} p-5`}>
          <h2 className="font-semibold">Which buyer?</h2>
          <p className="mb-3 mt-0.5 text-sm text-ink-500">Choose your chat with the buyer this is about.</p>
          {chats.length === 0 ? (
            <p className="text-sm text-ink-500">No buyer has chatted with you about this ad yet.</p>
          ) : (
            <div role="radiogroup" className="space-y-2">
              {chats.map((chat, index) => (
                <button
                  key={chat.id}
                  type="button"
                  role="radio"
                  aria-checked={conversationId === chat.id}
                  onClick={() => setConversationId(chat.id)}
                  className={clsx(
                    "flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left",
                    conversationId === chat.id ? "border-brand-600 bg-brand-50" : "border-canvas-dark/60",
                  )}
                >
                  <MessageCircle aria-hidden className="size-4 text-brand-600" />
                  <span className="flex-1 font-medium">Buyer chat {index + 1}</span>
                  <span className="text-sm text-ink-500">{shortDate(chat.at)}</span>
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      <section className={`${cardClass} p-5`}>
        <h2 className="mb-3 font-semibold">What went wrong?</h2>
        <div role="radiogroup" className="flex flex-wrap gap-2">
          {reasons.map((r) => (
            <button
              key={r}
              type="button"
              role="radio"
              aria-checked={reason === r}
              onClick={() => setReason(r)}
              className={clsx(
                "rounded-full border px-4 py-2 text-sm font-medium transition",
                reason === r ? "border-brand-600 bg-brand-600 text-white" : "border-canvas-dark hover:border-brand-300",
              )}
            >
              {DISPUTE_REASON_LABELS[r]}
            </button>
          ))}
        </div>
      </section>

      <section className={`${cardClass} p-5`}>
        <label htmlFor="dispute-description" className="font-semibold">
          Tell us what happened
        </label>
        <p className="mb-3 mt-0.5 text-sm text-ink-500">Include dates, amounts paid and how you paid. The other party will see this.</p>
        <textarea
          id="dispute-description"
          rows={6}
          maxLength={2000}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. I paid ₦45,000 by transfer on 12 March and the phone hasn't been delivered."
          className={inputClass}
        />
        <p className="mt-1 text-right text-xs text-ink-500">
          {description.trim().length < MIN_DESCRIPTION ? `${MIN_DESCRIPTION - description.trim().length} more characters needed` : `${description.length}/2000`}
        </p>
      </section>

      <section className={`${cardClass} p-5`}>
        <h2 className="font-semibold">Evidence (optional)</h2>
        <p className="mb-3 mt-0.5 text-sm text-ink-500">Up to {MAX_FILES} photos or PDFs: receipts, transfer screenshots, photos of the item.</p>
        {files.length > 0 && (
          <ul className="mb-3 flex flex-wrap gap-2">
            {files.map(({ file, preview }, index) => (
              <li key={`${file.name}-${index}`} className="relative size-20">
                {preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview} alt="" className="size-full rounded-xl object-cover" />
                ) : (
                  <span className="flex size-full flex-col items-center justify-center rounded-xl bg-brand-50 px-1 text-center">
                    <FileText aria-hidden className="size-6 text-brand-600" />
                    <span className="mt-1 w-full truncate text-[10px] text-ink-500">{file.name}</span>
                  </span>
                )}
                <button
                  type="button"
                  aria-label="Remove file"
                  onClick={() =>
                    setFiles((prev) => {
                      if (preview) URL.revokeObjectURL(preview);
                      return prev.filter((_, i) => i !== index);
                    })
                  }
                  className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full bg-ink-900 text-white"
                >
                  <X aria-hidden className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
        {files.length < MAX_FILES && (
          <div className="flex flex-wrap gap-2">
            <EvidenceButton icon={Camera} label="Camera" onClick={() => cameraRef.current?.click()} disabled={preparing} />
            <EvidenceButton icon={ImagePlus} label="Photos" onClick={() => photoRef.current?.click()} disabled={preparing} />
            <EvidenceButton icon={Paperclip} label="PDF" onClick={() => pdfRef.current?.click()} disabled={preparing} />
          </div>
        )}
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => (add(e.target.files), (e.target.value = ""))} />
        <input ref={photoRef} type="file" accept="image/jpeg,image/png,image/heic,image/heif" multiple hidden onChange={(e) => (add(e.target.files), (e.target.value = ""))} />
        <input ref={pdfRef} type="file" accept="application/pdf" hidden onChange={(e) => (add(e.target.files), (e.target.value = ""))} />
      </section>

      <button type="button" onClick={submit} disabled={!canSubmit} className={buttonClass("primary", "lg", "w-full")}>
        {submitting && <LoaderCircle aria-hidden className="size-4 animate-spin" />} Open dispute
      </button>
      <p className="text-center text-xs text-ink-500">Our team reviews every dispute and may contact both of you before deciding.</p>
    </div>
  );
}

function EvidenceButton({ icon: Icon, label, onClick, disabled }: { icon: typeof Camera; label: string; onClick: () => void; disabled: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-100"
    >
      <Icon aria-hidden className="size-4" /> {label}
    </button>
  );
}
