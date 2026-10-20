"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { Camera, Check, ChevronLeft, CircleAlert, ImagePlus, Link as LinkIcon, LoaderCircle, Sparkles, Tag, X } from "lucide-react";

import { aiDescription, aiPrice, saveDraft, submitChanges, uploadPhoto, type DraftInput } from "@/app/actions/sell";
import { useToast } from "@/components/providers/ToastProvider";
import { Dialog } from "@/components/ui/Dialog";
import { buttonClass, inputClass } from "@/components/ui/styles";
import { compressImage, MAX_EDGE, UploadError } from "@/lib/client/images";
import { formatNaira } from "@/lib/format";
import type { EditMode } from "@/lib/listings";

type CategoryNode = { id: string; name: string; children: { id: string; name: string }[] };

export type WizardDraft = {
  id: string;
  title: string;
  categoryId: string;
  subcategoryId: string;
  condition: "New" | "Used";
  description: string;
  price: string;
  hasReceipt: boolean;
  youTubeUrl: string;
  tikTokUrl: string;
  instagramUrl: string;
  facebookUrl: string;
  photos: string[];
  reviewNote: string | null;
};

type Values = Omit<WizardDraft, "id" | "photos" | "reviewNote" | "condition"> & { condition: "New" | "Used" | "" };

/** A photo on the form: a local preview until it's uploaded, then its permanent URL. */
type Photo = { key: string; preview: string; file?: File; url?: string };

const EMPTY: Values = {
  title: "",
  categoryId: "",
  subcategoryId: "",
  condition: "",
  description: "",
  price: "",
  hasReceipt: false,
  youTubeUrl: "",
  tikTokUrl: "",
  instagramUrl: "",
  facebookUrl: "",
};

const STEPS = [
  { key: "details", label: "Item details" },
  { key: "photos", label: "Photos" },
  { key: "copy", label: "Description & price" },
  { key: "promote", label: "Promote & pay" },
] as const;

const SOCIAL: { key: "youTubeUrl" | "tikTokUrl" | "instagramUrl" | "facebookUrl"; label: string; placeholder: string; domains: string[] }[] = [
  { key: "youTubeUrl", label: "YouTube", placeholder: "https://youtu.be/...", domains: ["youtube.com", "youtu.be"] },
  { key: "tikTokUrl", label: "TikTok", placeholder: "https://www.tiktok.com/@you/video/...", domains: ["tiktok.com"] },
  { key: "instagramUrl", label: "Instagram", placeholder: "https://www.instagram.com/p/...", domains: ["instagram.com", "instagr.am"] },
  { key: "facebookUrl", label: "Facebook", placeholder: "https://www.facebook.com/...", domains: ["facebook.com", "fb.com", "fb.watch"] },
];

function isPlatformLink(domains: string[], url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return true;
  const match = /^https?:\/\/([^/?#:]+)/i.exec(trimmed);
  if (!match) return false;
  const host = match[1].toLowerCase();
  return domains.some((d) => host === d || host.endsWith(`.${d}`));
}

type Suggestion =
  | { kind: "description"; description: string }
  | { kind: "price"; suggested: number; min: number; max: number; comparables: number };

/**
 * Posting an ad, in the app's steps: item details → photos → description & price (with AI
 * suggestions) → promote & pay. The ad is a Draft on the server from the first Continue, saved on
 * every Continue and when the tab is hidden, so closing midway never loses it - it's in My ads →
 * Drafts, and opening it there resumes here.
 *
 * The same steps edit an existing ad (see EditMode): a live ad is never saved halfway - its changes
 * go to review only when submitted at the end - and a rejected edit of one is resubmitted for free.
 * An expired ad is saved like a draft and goes on to choosing a plan.
 */
export function PostWizard({
  tree,
  draft,
  mode,
  canSell,
  location,
  photoLimits,
}: {
  tree: CategoryNode[];
  draft: WizardDraft | null;
  mode: EditMode;
  canSell: boolean;
  location: string | null;
  photoLimits: { max: number; min: number };
}) {
  const router = useRouter();
  const toast = useToast();
  const [step, setStep] = useState(() =>
    !draft ? 0 : !draft.title || !draft.categoryId ? 0 : draft.photos.length === 0 ? 1 : 2,
  );
  const [values, setValues] = useState<Values>(draft ? { ...draft } : EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Values, string>>>({});
  const [photos, setPhotos] = useState<Photo[]>(() => (draft?.photos ?? []).map((url) => ({ key: url, preview: url, url })));
  const [listingId, setListingId] = useState<string | null>(draft?.id ?? null);
  const [busy, setBusy] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiNote, setAiNote] = useState<string | null>(null);
  const askedFor = useRef<{ description?: string; price?: string }>({});
  const fileInput = useRef<HTMLInputElement>(null);
  const cameraInput = useRef<HTMLInputElement>(null);

  const category = tree.find((c) => c.id === values.categoryId);
  const subcategory = category?.children.find((c) => c.id === values.subcategoryId);
  const current = STEPS[step];

  const set = <K extends keyof Values>(key: K, value: Values[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  // Local previews are object URLs - free them when they go.
  useEffect(
    () => () => photos.forEach((p) => p.file && URL.revokeObjectURL(p.preview)),
    // Only on unmount; removals revoke their own.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // ---- Saving ----

  const toInput = (v: Values, list: Photo[]): DraftInput => ({
    title: v.title.trim(),
    categoryId: v.subcategoryId || v.categoryId,
    condition: (v.condition || "Used") as "New" | "Used",
    description: v.description.trim(),
    price: v.price ? Number(v.price) : null,
    mediaUrls: list.filter((p) => p.url).map((p) => p.url!),
    location,
    hasOriginalReceipt: v.condition === "Used" ? v.hasReceipt : null,
    // A half-typed link is left out of a draft save; Continue flags it.
    ...Object.fromEntries(
      SOCIAL.map(({ key, domains }) => [key, v[key].trim() && isPlatformLink(domains, v[key]) ? v[key].trim() : ""]),
    ),
  }) as DraftInput;

  const save = async (v: Values, list: Photo[], id: string | null): Promise<string | null> => {
    if (!v.title.trim() || !v.categoryId) return id;
    const result = await saveDraft(toInput(v, list), id);
    if (!result.ok) throw new Error(result.error);
    setListingId(result.data);
    return result.data;
  };

  // Leaving mid-way (another tab, closing it) saves what's there as a draft, like the app.
  const latest = useRef({ values, photos, listingId, handedOff: false });
  useEffect(() => {
    latest.current = { ...latest.current, values, photos, listingId };
  });
  useEffect(() => {
    const onHide = () => {
      const { values: v, photos: p, listingId: id, handedOff } = latest.current;
      if (document.visibilityState === "hidden" && !handedOff && canSell && mode !== "live") save(v, p, id).catch(() => {});
    };
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canSell]);

  const uploadPending = async (list: Photo[]): Promise<Photo[]> => {
    const done: Photo[] = [];
    for (const [index, photo] of list.entries()) {
      if (photo.url || !photo.file) {
        done.push(photo);
        continue;
      }
      setBusy(`Uploading photo ${index + 1} of ${list.length}…`);
      const form = new FormData();
      form.append("image", photo.file, photo.file.name);
      const result = await uploadPhoto(form);
      if (!result.ok) throw new Error(result.error);
      done.push({ ...photo, url: result.data });
    }
    setPhotos(done);
    return done;
  };

  // ---- AI suggestions ----

  const descriptionKey = (cover: string | undefined) => `${values.title}|${values.categoryId}|${values.subcategoryId}|${cover ?? ""}`;
  const priceKey = `${values.title}|${values.subcategoryId || values.categoryId}|${values.condition}`;

  const suggestPrice = async () => {
    if (!values.condition || !values.categoryId) return;
    askedFor.current.price = priceKey;
    setAiLoading(true);
    setAiNote(null);
    const result = await aiPrice(values.subcategoryId || values.categoryId, values.title, values.condition);
    setAiLoading(false);
    if (result.ok) setSuggestion({ kind: "price", ...result.data });
    else setAiNote(result.error);
  };

  const maybeSuggestPrice = () => {
    if (!values.price.trim() && askedFor.current.price !== priceKey) suggestPrice();
  };

  const suggestDescription = async (cover = photos[0]?.url) => {
    askedFor.current.description = descriptionKey(cover);
    setAiLoading(true);
    setAiNote(null);
    const keywords = [values.title, category?.name, subcategory?.name].filter(Boolean).join(", ");
    const result = await aiDescription(keywords, cover ?? null);
    setAiLoading(false);
    if (result.ok && result.data) {
      setSuggestion({ kind: "description", description: result.data });
      return;
    }
    if (!result.ok) setAiNote(result.error);
    maybeSuggestPrice();
  };

  /** Arriving on description & price: offer a description first, then a price. */
  const offerSuggestions = (cover: string | undefined) => {
    if (!values.description.trim() && askedFor.current.description !== descriptionKey(cover)) suggestDescription(cover);
    else maybeSuggestPrice();
  };

  const closeSuggestion = (accept: boolean) => {
    const offered = suggestion;
    if (accept && offered?.kind === "description") set("description", offered.description);
    if (accept && offered?.kind === "price") set("price", String(offered.suggested));
    setSuggestion(null);
    if (offered?.kind === "description") maybeSuggestPrice();
  };

  // ---- Photos ----

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const room = photoLimits.max - photos.length;
    const picked = Array.from(files).slice(0, Math.max(0, room));
    setBusy("Preparing photos…");
    try {
      // Re-encoded as JPEG in the browser - full-size camera photos never leave the device.
      const prepared = await Promise.all(picked.map((file) => compressImage(file, MAX_EDGE.listing, file.name)));
      setPhotos((prev) =>
        [...prev, ...prepared.map((file) => ({ key: `${file.name}-${crypto.randomUUID()}`, preview: URL.createObjectURL(file), file }))].slice(
          0,
          photoLimits.max,
        ),
      );
    } catch (error) {
      toast.error("Couldn't use those photos", error instanceof UploadError ? error.message : "Try picking them again.");
    } finally {
      setBusy(null);
    }
  };

  const removePhoto = (key: string) =>
    setPhotos((prev) =>
      prev.filter((p) => {
        if (p.key !== key) return true;
        if (p.file) URL.revokeObjectURL(p.preview);
        return false;
      }),
    );

  const makeCover = (key: string) => setPhotos((prev) => [...prev.filter((p) => p.key === key), ...prev.filter((p) => p.key !== key)]);

  // ---- Steps ----

  const validate = (): boolean => {
    const found: Partial<Record<keyof Values, string>> = {};
    if (current.key === "details") {
      if (values.title.trim().length < 5) found.title = "Give your listing a more descriptive title";
      if (!values.categoryId) found.categoryId = "Choose a category";
      if (!values.condition) found.condition = "Choose the item's condition";
    }
    if (current.key === "photos" && photos.length === 0) {
      toast.error("Add at least one photo", "Ads with photos sell much faster.");
      return false;
    }
    if (current.key === "copy") {
      if (values.description.trim().length < 10) found.description = "Add a bit more detail for buyers";
      if (!/^[0-9]+$/.test(values.price.trim())) found.price = "Enter a valid amount in Naira";
      for (const { key, label, domains } of SOCIAL) {
        if (!isPlatformLink(domains, values[key])) found[key] = `Enter a full ${label} link (starting with https://), or leave it blank.`;
      }
    }
    setErrors((prev) => ({ ...prev, ...found }));
    return Object.keys(found).length === 0;
  };

  const next = async () => {
    if (!validate()) return;
    const resubmits = mode === "live" || mode === "fix";
    setBusy(current.key === "photos" ? "Uploading photos…" : resubmits ? "Saving…" : "Saving your draft…");
    try {
      const list = current.key === "photos" ? await uploadPending(photos) : photos;
      if (resubmits && step === 2 && listingId) {
        // The end of an edit of a live ad (or a rejected edit): off to review, not to payment.
        setBusy("Submitting your changes…");
        const result = await submitChanges(toInput(values, list), listingId);
        if (!result.ok) throw new Error(result.error);
        latest.current.handedOff = true;
        toast.success(
          result.data.underReview ? "Sent for review" : "Changes saved",
          result.data.underReview ? "Your ad will be back on sale as soon as our team approves the changes." : "Your ad is live with the changes.",
        );
        router.push(`/my-ads?tab=${result.data.underReview ? "pending" : "active"}`);
        return;
      }
      setBusy(resubmits ? "Saving…" : "Saving your draft…");
      // A live ad isn't saved until the end - saving it would send it to review.
      const id = mode === "live" ? listingId : await save(values, list, listingId);
      if (step < 2) {
        setStep(step + 1);
        setAiNote(null);
        if (step + 1 === 2) offerSuggestions(list[0]?.url);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      // Complete and saved - on to choosing a plan and paying.
      latest.current.handedOff = true;
      router.push(`/sell/${id}/promote?fromPost=1`);
    } catch (error) {
      toast.error(current.key === "photos" ? "Couldn't upload your photos" : "Couldn't save your ad", (error as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const label = "mb-2 block text-base font-semibold text-ink-900";

  return (
    <div className="mt-6">
      <StepProgress current={step} finalLabel={mode === "live" || mode === "fix" ? "Review" : undefined} />

      {mode === "live" && (
        <p className="mt-6 flex gap-2 rounded-2xl bg-gold-50 p-4 text-sm text-ink-700 ring-1 ring-gold-200">
          <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-gold-700" />
          <span>
            <strong className="font-semibold text-gold-800">This ad is live. </strong>
            Nothing changes until you submit at the end. Once you do, our team reviews the changes, and the ad is off the market until they approve
            them. Your plan and its end date stay the same. To change plan, use Upgrade plan in My ads.
          </span>
        </p>
      )}

      {draft?.reviewNote && (
        <p className="mt-6 flex gap-2 rounded-2xl bg-danger/5 p-4 text-sm text-ink-700 ring-1 ring-danger/20">
          <CircleAlert aria-hidden className="mt-0.5 size-4 shrink-0 text-danger" />
          <span>
            <strong className="font-semibold text-danger">Not approved: </strong>
            {draft.reviewNote}
          </span>
        </p>
      )}

      <div className="mt-6 rounded-3xl bg-white p-6 shadow-card ring-1 ring-canvas-dark/60 sm:p-8">
        {current.key === "details" && (
          <div className="space-y-6">
            <div>
              <label htmlFor="ad-title" className={label}>
                Ad title
              </label>
              <input
                id="ad-title"
                value={values.title}
                onChange={(e) => set("title", e.target.value)}
                maxLength={150}
                placeholder="e.g. iPhone 13 Pro Max, 256GB"
                aria-invalid={errors.title ? true : undefined}
                className={inputClass}
              />
              <FieldError message={errors.title} />
            </div>

            <fieldset>
              <legend className={label}>Category</legend>
              <div className="flex flex-wrap gap-2">
                {tree.map((c) => (
                  <Chip
                    key={c.id}
                    selected={c.id === values.categoryId}
                    onClick={() => {
                      setValues((prev) => ({ ...prev, categoryId: c.id, subcategoryId: "" }));
                      setErrors((prev) => ({ ...prev, categoryId: undefined }));
                    }}
                  >
                    {c.name}
                  </Chip>
                ))}
              </div>
              <FieldError message={errors.categoryId} />
            </fieldset>

            {category && category.children.length > 0 && (
              <fieldset>
                <legend className={label}>
                  Sub category <span className="font-normal text-ink-500">(optional)</span>
                </legend>
                <div className="flex flex-wrap gap-2">
                  {category.children.map((c) => (
                    <Chip key={c.id} selected={c.id === values.subcategoryId} onClick={() => set("subcategoryId", c.id === values.subcategoryId ? "" : c.id)}>
                      {c.name}
                    </Chip>
                  ))}
                </div>
              </fieldset>
            )}

            <fieldset>
              <legend className={label}>Condition</legend>
              <div className="grid grid-cols-2 gap-3">
                {(["New", "Used"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    role="radio"
                    aria-checked={values.condition === option}
                    onClick={() => set("condition", option)}
                    className={clsx(
                      "rounded-2xl border-2 py-3.5 font-semibold transition",
                      values.condition === option ? "border-brand-600 bg-brand-600 text-white" : "border-canvas-dark bg-surface text-ink-700 hover:border-brand-300",
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
              <FieldError message={errors.condition} />
            </fieldset>

            {values.condition === "Used" && (
              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-canvas-dark bg-surface p-4">
                <input type="checkbox" checked={values.hasReceipt} onChange={(e) => set("hasReceipt", e.target.checked)} className="mt-1 size-4 accent-brand-600" />
                <span>
                  <span className="block font-semibold">I have the original receipt of purchase</span>
                  <span className="text-sm text-ink-500">Your ad will tell buyers whether a receipt comes with it.</span>
                </span>
              </label>
            )}
          </div>
        )}

        {current.key === "photos" && (
          <div>
            <p className="mb-5 text-sm text-ink-500">
              Up to {photoLimits.max} photos. The first one is your cover and helps our AI write your description.
              {photoLimits.max > photoLimits.min &&
                ` Each plan shows a set number of photos (from ${photoLimits.min}); if you add more than your plan allows, we keep the first ones and leave the rest off.`}
            </p>
            <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {photos.map((photo, index) => (
                <li key={photo.key} className="group relative aspect-square">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.preview} alt={`Photo ${index + 1}`} referrerPolicy="no-referrer" className="size-full rounded-2xl bg-canvas object-cover" />
                  {index === 0 ? (
                    <span className="absolute bottom-2 left-2 rounded-full bg-ink-900/75 px-2 py-0.5 text-[11px] font-semibold text-white">Cover</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => makeCover(photo.key)}
                      className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-ink-900 opacity-0 transition group-hover:opacity-100 focus:opacity-100"
                    >
                      Make cover
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removePhoto(photo.key)}
                    aria-label={`Remove photo ${index + 1}`}
                    className="absolute -right-2 -top-2 grid size-7 place-items-center rounded-full bg-ink-900 text-white shadow"
                  >
                    <X aria-hidden className="size-4" />
                  </button>
                </li>
              ))}
              {photos.length < photoLimits.max && (
                <>
                  <li>
                    <button
                      type="button"
                      onClick={() => fileInput.current?.click()}
                      disabled={!!busy}
                      className="flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-brand-200 bg-white text-sm font-semibold text-brand-700 transition hover:border-brand-400 hover:bg-brand-50"
                    >
                      <ImagePlus aria-hidden className="size-6" /> {photos.length === 0 ? "Add photos" : "Add more"}
                    </button>
                  </li>
                  <li className="sm:hidden">
                    <button
                      type="button"
                      onClick={() => cameraInput.current?.click()}
                      disabled={!!busy}
                      className="flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-brand-200 bg-white text-sm font-semibold text-brand-700"
                    >
                      <Camera aria-hidden className="size-6" /> Camera
                    </button>
                  </li>
                </>
              )}
            </ul>
            <input
              ref={fileInput}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
              multiple
              hidden
              onChange={(e) => {
                addFiles(e.target.files);
                e.target.value = "";
              }}
            />
            <input
              ref={cameraInput}
              type="file"
              accept="image/*"
              capture="environment"
              hidden
              onChange={(e) => {
                addFiles(e.target.files);
                e.target.value = "";
              }}
            />
          </div>
        )}

        {current.key === "copy" && (
          <div className="space-y-6">
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label htmlFor="ad-description" className="text-base font-semibold">
                  Description
                </label>
                <AiButton loading={aiLoading} onClick={() => suggestDescription()}>
                  Suggest with AI
                </AiButton>
              </div>
              <textarea
                id="ad-description"
                rows={7}
                maxLength={5000}
                value={values.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Describe the condition, features, and reason for selling"
                aria-invalid={errors.description ? true : undefined}
                className={inputClass}
              />
              <FieldError message={errors.description} />
            </div>

            <div>
              <label htmlFor="ad-price" className={label}>
                Price (₦)
              </label>
              <div className="relative">
                <Tag aria-hidden className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-500" />
                <input
                  id="ad-price"
                  inputMode="numeric"
                  value={values.price}
                  onChange={(e) => set("price", e.target.value.replace(/\D/g, "").slice(0, 12))}
                  placeholder="e.g. 250000"
                  aria-invalid={errors.price ? true : undefined}
                  className={`${inputClass} pl-10`}
                />
              </div>
              <FieldError message={errors.price} />
              <div className="mt-2">
                <AiButton loading={aiLoading} onClick={suggestPrice}>
                  Suggest a price
                </AiButton>
              </div>
              {aiLoading ? (
                <p className="mt-3 flex items-center gap-2 text-sm text-ink-500">
                  <LoaderCircle aria-hidden className="size-4 animate-spin text-brand-600" /> Getting an AI suggestion…
                </p>
              ) : (
                aiNote && <p className="mt-3 text-sm text-ink-500">{aiNote}</p>
              )}
            </div>

            <fieldset>
              <legend className={label}>
                Social links <span className="font-normal text-ink-500">(optional)</span>
              </legend>
              <p className="-mt-1 mb-3 text-sm text-ink-500">
                Got this item on TikTok, Instagram, Facebook or YouTube? Add the link so buyers can open it from your ad, and YouTube videos play right on it.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {SOCIAL.map(({ key, label: name, placeholder }) => (
                  <div key={key}>
                    <label htmlFor={`ad-${key}`} className="mb-1 block text-sm font-medium text-ink-700">
                      {name}
                    </label>
                    <div className="relative">
                      <LinkIcon aria-hidden className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-300" />
                      <input
                        id={`ad-${key}`}
                        type="url"
                        value={values[key]}
                        onChange={(e) => set(key, e.target.value)}
                        placeholder={placeholder}
                        maxLength={500}
                        aria-invalid={errors[key] ? true : undefined}
                        className={`${inputClass} pl-10`}
                      />
                    </div>
                    <FieldError message={errors[key]} />
                  </div>
                ))}
              </div>
            </fieldset>
          </div>
        )}
      </div>

      <div className="sticky bottom-16 z-10 mt-6 flex items-center gap-3 rounded-2xl bg-surface/90 py-3 backdrop-blur sm:bottom-0">
        {step > 0 && (
          <button
            type="button"
            onClick={() => {
              setAiNote(null);
              setStep(step - 1);
            }}
            disabled={!!busy}
            aria-label="Back"
            className="grid size-13 shrink-0 place-items-center rounded-full border border-canvas-dark bg-white text-ink-700 hover:bg-canvas"
          >
            <ChevronLeft aria-hidden className="size-5" />
          </button>
        )}
        <button type="button" onClick={next} disabled={!canSell || !!busy} className={buttonClass("primary", "lg", "flex-1")}>
          {busy && <LoaderCircle aria-hidden className="size-4 animate-spin" />}
          {busy ??
            (step < 2
              ? "Continue"
              : mode === "live"
                ? "Submit changes for review"
                : mode === "fix"
                  ? "Resubmit for review"
                  : mode === "renew"
                    ? "Continue to renew"
                    : "Continue to promote & pay")}
        </button>
      </div>

      <Dialog
        open={suggestion !== null}
        onClose={() => closeSuggestion(false)}
        size="sm"
        title={suggestion?.kind === "price" ? "Suggested price" : "AI description"}
        footer={
          <div className="flex gap-2">
            <button type="button" onClick={() => closeSuggestion(false)} className={buttonClass("outline", "md", "flex-1")}>
              No, thanks
            </button>
            <button type="button" onClick={() => closeSuggestion(true)} className={buttonClass("primary", "md", "flex-1")}>
              <Check aria-hidden className="size-4" /> Yes, use it
            </button>
          </div>
        }
      >
        {suggestion?.kind === "description" && (
          <p className="max-h-64 overflow-y-auto whitespace-pre-line rounded-2xl bg-surface p-4 text-sm leading-6 text-ink-700">{suggestion.description}</p>
        )}
        {suggestion?.kind === "price" && (
          <div className="rounded-2xl bg-surface p-5 text-center">
            <p className="text-3xl font-extrabold">{formatNaira(suggestion.suggested)}</p>
            <p className="mt-1 text-sm text-ink-500">
              Similar ads sold for {formatNaira(suggestion.min)} to {formatNaira(suggestion.max)} ({suggestion.comparables}{" "}
              {suggestion.comparables === 1 ? "ad" : "ads"})
            </p>
          </div>
        )}
        <p className="mt-4 text-sm text-ink-700">
          {suggestion?.kind === "price" ? "Would you like to use this price? You can still change it." : "Would you like to use this description? You can still edit it."}
        </p>
      </Dialog>
    </div>
  );
}

export function StepProgress({ current, finalLabel }: { current: number; finalLabel?: string }) {
  return (
    <ol className="grid grid-cols-4 gap-2">
      {STEPS.map((s, index) => (
        <li key={s.key}>
          <span className={clsx("block h-1.5 rounded-full", index <= current ? "bg-brand-600" : "bg-canvas-dark")} />
          <span className={clsx("mt-2 hidden text-xs font-medium sm:block", index === current ? "text-brand-700" : "text-ink-500")}>
            {index + 1}. {index === STEPS.length - 1 && finalLabel ? finalLabel : s.label}
          </span>
        </li>
      ))}
    </ol>
  );
}

function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={clsx(
        "rounded-full border px-4 py-2 text-sm font-medium transition",
        selected ? "border-brand-600 bg-brand-600 text-white" : "border-canvas-dark bg-white text-ink-700 hover:border-brand-300",
      )}
    >
      {children}
    </button>
  );
}

function AiButton({ loading, onClick, children }: { loading: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-100 disabled:opacity-60"
    >
      <Sparkles aria-hidden className="size-3.5" /> {children}
    </button>
  );
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-1.5 text-xs font-medium text-danger">{message}</p> : null;
}
