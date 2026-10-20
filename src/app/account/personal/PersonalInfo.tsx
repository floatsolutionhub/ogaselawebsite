"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { BadgeCheck, Camera, CreditCard, LoaderCircle, Lock, Receipt, ScanFace, UserRound } from "lucide-react";

import { saveName } from "@/app/actions/account";
import { DocumentList } from "@/components/account/Documents";
import { FaceCapture } from "@/components/account/FaceCapture";
import { useToast } from "@/components/providers/ToastProvider";
import { buttonClass, cardClass, inputClass } from "@/components/ui/styles";
import type { UserDocument } from "@/lib/api/types";

export function PersonalInfo({
  name: savedName,
  email,
  phone,
  photoUrl,
  isVerified,
  documents,
  documentsLoaded,
}: {
  name: string;
  email: string | null;
  phone: string | null;
  photoUrl: string | null;
  isVerified: boolean;
  documents: UserDocument[];
  documentsLoaded: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [name, setName] = useState(savedName);
  const [saving, startSaving] = useTransition();
  const [capturing, setCapturing] = useState(false);

  // A rejected upload has to be replaced, so it counts as missing.
  const hasUpload = (type: UserDocument["type"]) => {
    const latest = documents.find((d) => d.type === type);
    return !!latest && latest.status !== "Rejected";
  };
  const missing = [!hasUpload("IdCard") && "ID card", !hasUpload("UtilityBill") && "utility bill"].filter(Boolean);
  // Once everything is in there's nothing to (re)take until the review is done.
  const photoLocked = isVerified || (!!photoUrl && documentsLoaded && missing.length === 0);
  const caption = isVerified
    ? "Verified"
    : !photoUrl
      ? "Take a live selfie to complete biometric verification. It must clearly show your face."
      : missing.length > 0
        ? `Awaiting ${missing.join(" and ")} upload`
        : "Pending approval";

  const dirty = name.trim() !== savedName;

  return (
    <div className="space-y-6">
      <section className={`${cardClass} flex flex-col items-center p-6 text-center`}>
        <button
          type="button"
          onClick={() => setCapturing(true)}
          disabled={photoLocked}
          aria-label={photoUrl ? "Retake profile photo" : "Take profile photo"}
          className="relative"
        >
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt="" referrerPolicy="no-referrer" className="size-28 rounded-full object-cover ring-4 ring-brand-50" />
          ) : (
            <span className="grid size-28 place-items-center rounded-full bg-brand-50 text-brand-600">
              <UserRound aria-hidden className="size-12" strokeWidth={1.5} />
            </span>
          )}
          {!photoLocked && (
            <span className="absolute bottom-1 right-1 grid size-9 place-items-center rounded-full bg-brand-600 text-white ring-4 ring-white">
              <Camera aria-hidden className="size-4" />
            </span>
          )}
        </button>
        <h2 className="mt-3 font-semibold">Profile photo</h2>
        <p
          className={`mt-3 inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium ring-1 ${
            isVerified ? "bg-brand-50 text-brand-800 ring-brand-100" : "bg-gold-50 text-ink-900 ring-gold-200"
          }`}
        >
          {isVerified ? <BadgeCheck aria-hidden className="size-4 text-brand-600" /> : <ScanFace aria-hidden className="size-4 text-gold-700" />}
          {caption}
        </p>
      </section>

      <section className={`${cardClass} p-6`}>
        <h2 className="mb-4 font-semibold">Basic information</h2>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            startSaving(async () => {
              const result = await saveName(name);
              if (result.ok) {
                toast.success("Personal info saved");
                router.refresh();
              } else toast.error("Couldn't save your changes", result.error);
            });
          }}
          className="space-y-4"
        >
          <div>
            <label htmlFor="full-name" className="mb-1.5 block text-sm font-medium text-ink-700">
              Full name
            </label>
            <input id="full-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={100} autoComplete="name" className={inputClass} />
          </div>
          <ReadOnly label="Email address" value={email} />
          <ReadOnly label="Phone number" value={phone} />
          <p className="text-xs text-ink-500">To change your email or phone, go to Settings. Changes are reviewed before they take effect.</p>
          <button type="submit" disabled={!dirty || !name.trim() || saving} className={buttonClass("primary", "lg", "w-full")}>
            {saving && <LoaderCircle aria-hidden className="size-4 animate-spin" />} Save changes
          </button>
        </form>
      </section>

      <section className={`${cardClass} p-6`}>
        <h2 className="font-semibold">Documents</h2>
        <p className="mt-0.5 text-sm text-ink-500">
          {isVerified ? "Verified. Tap a document to view it." : "Upload your ID and proof of address. Our team reviews them."}
        </p>
        {documentsLoaded ? (
          <DocumentList
            slots={[
              { type: "IdCard", title: "ID card", icon: CreditCard },
              { type: "UtilityBill", title: "Utility bill", icon: Receipt },
            ]}
            documents={documents}
            locked={isVerified}
            lockNote="Your account is verified, so this can no longer be changed."
          />
        ) : (
          <p className="mt-4 text-sm text-ink-500">Your documents couldn&apos;t be loaded. Please refresh.</p>
        )}
      </section>

      <FaceCapture open={capturing} onClose={() => setCapturing(false)} />
    </div>
  );
}

function ReadOnly({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-ink-700">{label}</p>
      <p className="flex items-center gap-2 rounded-xl bg-canvas/60 px-4 py-3 text-[15px] text-ink-700">
        <span className="flex-1 truncate">{value || "Not set"}</span>
        <Lock aria-hidden className="size-4 text-ink-300" />
      </p>
    </div>
  );
}
