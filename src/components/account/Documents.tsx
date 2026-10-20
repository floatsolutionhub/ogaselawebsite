"use client";

import { useRef, useState, useTransition } from "react";
import clsx from "clsx";
import { Camera, Check, ChevronRight, ExternalLink, FileText, ImageIcon, LoaderCircle, Lock, type LucideIcon } from "lucide-react";

import { saveDocument } from "@/app/actions/account";
import { useToast } from "@/components/providers/ToastProvider";
import { Dialog } from "@/components/ui/Dialog";
import { buttonClass, inputClass } from "@/components/ui/styles";
import type { IdDocumentType, UserDocument, UserDocumentType } from "@/lib/api/types";
import { MAX_EDGE, prepareFile, UploadError } from "@/lib/client/images";
import { safeHttpUrl, shortDate } from "@/lib/format";

export const ID_TYPE_LABELS: Record<IdDocumentType, string> = {
  NationalIdCard: "National ID card",
  NinSlip: "NIN slip",
  VotersCard: "Voter's card",
  DriversLicence: "Driver's licence",
  InternationalPassport: "International passport",
};

const STATUS = {
  PendingReview: { label: "In review", className: "bg-gold-50 text-gold-800" },
  Approved: { label: "Approved", className: "bg-brand-50 text-brand-700" },
  Rejected: { label: "Rejected", className: "bg-danger/10 text-danger" },
} as const;

const COPY: Record<UserDocumentType, { title: string; hint: string; fileLabel: string; uploaded: string }> = {
  IdCard: {
    title: "Upload your ID card",
    hint: "Choose the ID type, enter its number and add a clear photo or PDF of it.",
    fileLabel: "Photo or PDF of the ID",
    uploaded: "ID card uploaded",
  },
  UtilityBill: {
    title: "Upload a utility bill",
    hint: "A recent bill (last 3 months) showing your name and address: electricity, water, waste or similar.",
    fileLabel: "Photo or PDF of the bill",
    uploaded: "Utility bill uploaded",
  },
  BusinessRegistration: {
    title: "Upload business registration",
    hint: "Your CAC certificate (or other registration document) showing the business name.",
    fileLabel: "Photo or PDF of the document",
    uploaded: "Business registration uploaded",
  },
  OfficeUtilityBill: {
    title: "Upload proof of office address",
    hint: "A recent utility bill (last 3 months) for your office or shop, showing the business address.",
    fileLabel: "Photo or PDF of the bill",
    uploaded: "Proof of office address uploaded",
  },
};

export type DocumentSlot = { type: UserDocumentType; title: string; icon: LucideIcon };

/**
 * A card of document slots, each showing its latest upload's status. Tapping one uploads a new
 * file - or, once verified (or while one is in review), opens it read-only, as the app does.
 */
export function DocumentList({
  slots,
  documents: initial,
  locked,
  lockNote,
}: {
  slots: DocumentSlot[];
  documents: UserDocument[];
  locked: boolean;
  lockNote: string;
}) {
  const [documents, setDocuments] = useState(initial);
  const [uploading, setUploading] = useState<UserDocumentType | null>(null);
  const [viewing, setViewing] = useState<{ document: UserDocument; title: string; note: string } | null>(null);

  const latest = (type: UserDocumentType) => documents.find((d) => d.type === type);

  const open = (slot: DocumentSlot) => {
    const document = latest(slot.type);
    // One submission per document at a time: a pending one opens read-only until it's reviewed.
    if (document?.status === "PendingReview") {
      setViewing({ document, title: slot.title, note: "This document is waiting for review. You can upload a new one once it's approved or rejected." });
      return;
    }
    if (!locked) {
      setUploading(slot.type);
      return;
    }
    if (document) setViewing({ document, title: slot.title, note: lockNote });
  };

  return (
    <>
      <ul className="divide-y divide-canvas-dark/60">
        {slots.map((slot) => {
          const document = latest(slot.type);
          const status = document ? STATUS[document.status] : null;
          return (
            <li key={slot.type}>
              <button type="button" onClick={() => open(slot)} className="flex w-full items-center gap-3 py-4 text-left">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-600">
                  <slot.icon aria-hidden className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{slot.title}</span>
                    {status && <span className={clsx("rounded-full px-2 py-0.5 text-[11px] font-semibold", status.className)}>{status.label}</span>}
                  </span>
                  <span className="block truncate text-sm text-ink-500">
                    {document
                      ? `${document.idType ? `${ID_TYPE_LABELS[document.idType]} · ${document.idNumber ?? ""} · ` : `${document.fileName} · `}${shortDate(document.createdAt)}`
                      : "Not uploaded. Tap to add"}
                  </span>
                  {document?.status === "Rejected" && document.reviewNote && (
                    <span className="mt-1 block text-xs text-danger">{document.reviewNote} Tap to upload again.</span>
                  )}
                </span>
                <ChevronRight aria-hidden className="size-4 text-ink-300" />
              </button>
            </li>
          );
        })}
      </ul>
      <UploadDialog type={uploading} onClose={() => setUploading(null)} onUploaded={(d) => setDocuments((prev) => [d, ...prev])} />
      <Dialog open={viewing !== null} onClose={() => setViewing(null)} title={viewing?.title ?? ""} description={viewing && <DetailNote note={viewing.note} />}>
        {viewing && <DocumentDetail document={viewing.document} />}
      </Dialog>
    </>
  );
}

function DetailNote({ note }: { note: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <Lock aria-hidden className="size-3.5" /> {note}
    </span>
  );
}

function DocumentDetail({ document }: { document: UserDocument }) {
  const url = safeHttpUrl(document.fileUrl);
  const rows = [
    document.idType && ["ID type", ID_TYPE_LABELS[document.idType]],
    document.idNumber && ["ID number", document.idNumber],
    ["File", document.fileName],
    ["Uploaded", shortDate(document.createdAt)],
    ["Status", STATUS[document.status].label],
  ].filter(Boolean) as [string, string][];
  return (
    <div className="space-y-4">
      <dl className="divide-y divide-canvas-dark/60 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 py-2.5">
            <dt className="text-ink-500">{label}</dt>
            <dd className="truncate font-medium">{value}</dd>
          </div>
        ))}
      </dl>
      {url &&
        (document.contentType.startsWith("image/") ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={document.fileName} referrerPolicy="no-referrer" className="max-h-80 w-full rounded-2xl bg-canvas object-contain" />
        ) : (
          <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-2xl bg-brand-50 px-4 py-3 font-medium text-brand-800">
            <FileText aria-hidden className="size-5" /> <span className="flex-1">Open file</span> <ExternalLink aria-hidden className="size-4" />
          </a>
        ))}
    </div>
  );
}

function UploadDialog({ type, onClose, onUploaded }: { type: UserDocumentType | null; onClose: () => void; onUploaded: (d: UserDocument) => void }) {
  const toast = useToast();
  const [idType, setIdType] = useState<IdDocumentType | null>(null);
  const [idNumber, setIdNumber] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [submitting, startSubmitting] = useTransition();
  const pickRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const copy = COPY[type ?? "IdCard"];
  const isId = type === "IdCard";
  const idValid = /^[A-Za-z0-9]{5,20}$/.test(idNumber.trim());
  const canSubmit = !!file && !submitting && !preparing && (!isId || (!!idType && idValid));

  const close = () => {
    setIdType(null);
    setIdNumber("");
    setFile(null);
    onClose();
  };

  const choose = async (picked: File | undefined) => {
    if (!picked) return;
    setPreparing(true);
    try {
      // Photos are compressed (text stays readable at 2000px); PDFs are capped at 10MB.
      setFile(await prepareFile(picked, MAX_EDGE.document, true));
    } catch (error) {
      toast.error("Couldn't use that file", error instanceof UploadError ? error.message : "Choose another file.");
    } finally {
      setPreparing(false);
    }
  };

  const submit = () =>
    startSubmitting(async () => {
      if (!type || !file) return;
      const form = new FormData();
      form.append("type", type);
      if (isId && idType) {
        form.append("idType", idType);
        form.append("idNumber", idNumber.trim());
      }
      form.append("file", file, file.name);
      const result = await saveDocument(form);
      if (result.ok) {
        toast.success(copy.uploaded, "We'll review it shortly.");
        onUploaded(result.data);
        close();
      } else toast.error("Upload failed", result.error);
    });

  return (
    <Dialog
      open={type !== null}
      onClose={close}
      dismissible={!submitting}
      title={copy.title}
      description={copy.hint}
      footer={
        <button type="button" onClick={submit} disabled={!canSubmit} className={buttonClass("primary", "lg", "w-full")}>
          {submitting && <LoaderCircle aria-hidden className="size-4 animate-spin" />} Upload
        </button>
      }
    >
      <div className="space-y-5">
        {isId && (
          <>
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-ink-700">ID type</legend>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(ID_TYPE_LABELS) as IdDocumentType[]).map((option) => (
                  <button
                    key={option}
                    type="button"
                    role="radio"
                    aria-checked={idType === option}
                    onClick={() => setIdType(option)}
                    className={clsx(
                      "rounded-full border px-3.5 py-2 text-sm font-medium transition",
                      idType === option ? "border-brand-600 bg-brand-600 text-white" : "border-canvas-dark hover:border-brand-300",
                    )}
                  >
                    {ID_TYPE_LABELS[option]}
                  </button>
                ))}
              </div>
            </fieldset>
            <div>
              <label htmlFor="id-number" className="mb-1.5 block text-sm font-medium text-ink-700">
                ID number
              </label>
              <input
                id="id-number"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 20))}
                placeholder="As printed on the ID"
                autoComplete="off"
                className={inputClass}
              />
              {idNumber.length > 0 && !idValid && <p className="mt-1 text-xs text-danger">Use 5-20 letters or digits.</p>}
            </div>
          </>
        )}
        <div>
          <p className="mb-2 text-sm font-medium text-ink-700">{copy.fileLabel}</p>
          {file ? (
            <div className="flex items-center gap-3 rounded-2xl bg-brand-50 px-4 py-3">
              {file.type === "application/pdf" ? <FileText aria-hidden className="size-5 text-brand-700" /> : <Check aria-hidden className="size-5 text-brand-700" />}
              <span className="flex-1 truncate text-sm font-medium">{file.name}</span>
              <button type="button" onClick={() => setFile(null)} className="text-sm font-semibold text-brand-700">
                Change
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => cameraRef.current?.click()} disabled={preparing} className="flex flex-col items-center gap-1.5 rounded-2xl border border-canvas-dark py-4 text-sm font-medium hover:border-brand-300">
                <Camera aria-hidden className="size-6 text-brand-600" /> Take photo
              </button>
              <button type="button" onClick={() => pickRef.current?.click()} disabled={preparing} className="flex flex-col items-center gap-1.5 rounded-2xl border border-canvas-dark py-4 text-sm font-medium hover:border-brand-300">
                {preparing ? <LoaderCircle aria-hidden className="size-6 animate-spin text-brand-600" /> : <ImageIcon aria-hidden className="size-6 text-brand-600" />}
                Photo or PDF
              </button>
            </div>
          )}
          <input ref={pickRef} type="file" accept="image/jpeg,image/png,image/heic,image/heif,application/pdf" hidden onChange={(e) => (choose(e.target.files?.[0]), (e.target.value = ""))} />
          <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => (choose(e.target.files?.[0]), (e.target.value = ""))} />
        </div>
      </div>
    </Dialog>
  );
}
