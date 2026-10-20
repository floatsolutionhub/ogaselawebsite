import "server-only";

// Server-side checks on files a browser sends to a Server Action, before they go on to the API.
// The browser already compressed photos; this re-checks size and the file's real type from its
// first bytes, so a renamed file can't pass as a photo.

const MAX_IMAGE_BYTES = 6 * 1024 * 1024;
const MAX_PDF_BYTES = 10 * 1024 * 1024;

const SIGNATURES: { type: string; bytes: number[] }[] = [
  { type: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  { type: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47] },
  { type: "application/pdf", bytes: [0x25, 0x50, 0x44, 0x46] },
];

async function sniff(file: File): Promise<string | null> {
  const head = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  return SIGNATURES.find((s) => s.bytes.every((b, i) => head[i] === b))?.type ?? null;
}

/** Returns a clean File (safe name, sniffed type) or an error message. */
export async function checkUpload(value: FormDataEntryValue | null, allowPdf: boolean): Promise<File | string> {
  if (!(value instanceof File) || value.size === 0) return "Choose a file to upload.";
  const type = await sniff(value);
  if (!type || (type === "application/pdf" && !allowPdf)) {
    return allowPdf ? "Upload a photo (JPG or PNG) or a PDF." : "Upload a photo (JPG or PNG).";
  }
  const limit = type === "application/pdf" ? MAX_PDF_BYTES : MAX_IMAGE_BYTES;
  if (value.size > limit) return `That file is too large (max ${Math.round(limit / 1024 / 1024)}MB).`;

  const extension = type === "application/pdf" ? "pdf" : type.split("/")[1].replace("jpeg", "jpg");
  const base = value.name.replace(/\.[^.]+$/, "").replace(/[^\w.-]+/g, "-").slice(0, 60) || "upload";
  return new File([value], `${base}.${extension}`, { type });
}
