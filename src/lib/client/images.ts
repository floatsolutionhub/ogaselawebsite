// Every photo is compressed in the browser before it's uploaded - never a camera original
// (3-5MB, often HEIC). Same longest-edge limits as OgaselaMobileClient/src/utils/photos.ts.
export const MAX_EDGE = {
  listing: 1600,
  face: 1280,
  /** IDs, bills, registration documents, dispute evidence - text has to stay readable. */
  document: 2000,
} as const;

/** PDFs can't be recompressed in the browser, so they're capped instead. */
export const MAX_PDF_BYTES = 10 * 1024 * 1024;

export class UploadError extends Error {}

/** Re-encodes an image as a JPEG no larger than maxEdge on its longest side (a few hundred KB). */
export async function compressImage(source: Blob, maxEdge: number, name = "photo", quality = 0.82): Promise<File> {
  let bitmap: ImageBitmap;
  try {
    // from-image applies the EXIF rotation, so phone photos aren't sideways.
    bitmap = await createImageBitmap(source, { imageOrientation: "from-image" });
  } catch {
    throw new UploadError("That photo format isn't supported here. Use a JPG or PNG (iPhone HEIC photos: export as JPG first).");
  }

  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new UploadError("Your browser couldn't prepare that photo.");
  // JPEG has no transparency - give PNGs a white background instead of black.
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
  if (!blob) throw new UploadError("Your browser couldn't prepare that photo.");
  const base = name.replace(/\.[^.]+$/, "").replace(/[^\w.-]+/g, "-").slice(0, 60) || "photo";
  return new File([blob], `${base}.jpg`, { type: "image/jpeg" });
}

/** A photo (compressed) or, where allowed, a PDF (size-capped) - ready to upload. */
export async function prepareFile(file: File, maxEdge: number, allowPdf: boolean): Promise<File> {
  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    if (!allowPdf) throw new UploadError("Please choose a photo.");
    if (file.size > MAX_PDF_BYTES) throw new UploadError("That file is over 10MB. Choose a smaller file.");
    return file;
  }
  return compressImage(file, maxEdge, file.name);
}
