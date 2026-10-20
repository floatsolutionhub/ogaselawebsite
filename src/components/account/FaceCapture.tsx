"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { Camera, LoaderCircle, RotateCcw } from "lucide-react";

import { saveProfilePhoto } from "@/app/actions/account";
import { useToast } from "@/components/providers/ToastProvider";
import { Dialog } from "@/components/ui/Dialog";
import { buttonClass } from "@/components/ui/styles";
import { compressImage, MAX_EDGE } from "@/lib/client/images";

/**
 * The app's face capture for the profile photo: front camera with an oval guide, then a live
 * photo the API checks for exactly one clear face. A live camera only - no file picker - since
 * the photo is part of biometric verification.
 */
export function FaceCapture({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const toast = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [photo, setPhoto] = useState<{ file: File; url: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [uploading, startUploading] = useTransition();

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const start = useCallback(async () => {
    setCameraError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Your browser can't use the camera. Try Chrome or Safari on your phone.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 1280 } }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
    } catch {
      setCameraError("Allow camera access to take your profile photo, then try again.");
    }
  }, []);

  useEffect(() => {
    if (!open || photo) return stop;
    let cancelled = false;
    const media = navigator.mediaDevices;
    (media?.getUserMedia ? media.getUserMedia({ video: { facingMode: "user", width: { ideal: 1280 } }, audio: false }) : Promise.reject(new Error("unsupported")))
      .then(async (stream) => {
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        setCameraError(null);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
      })
      .catch((error: Error) => {
        if (!cancelled) {
          setCameraError(
            error.message === "unsupported"
              ? "Your browser can't use the camera. Try Chrome or Safari on your phone."
              : "Allow camera access to take your profile photo, then try again.",
          );
        }
      });
    return () => {
      cancelled = true;
      stop();
    };
  }, [open, photo, stop]);

  const close = () => {
    stop();
    if (photo) URL.revokeObjectURL(photo.url);
    setPhoto(null);
    setError(null);
    onClose();
  };

  const capture = async () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) return;
    // Mirrored, like the preview the person saw.
    context.translate(canvas.width, 0);
    context.scale(-1, 1);
    context.drawImage(video, 0, 0);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
    if (!blob) return;
    const file = await compressImage(blob, MAX_EDGE.face, "profile-photo");
    stop();
    setError(null);
    setPhoto({ file, url: URL.createObjectURL(file) });
  };

  const usePhoto = () =>
    startUploading(async () => {
      if (!photo) return;
      const form = new FormData();
      form.append("image", photo.file, photo.file.name);
      const result = await saveProfilePhoto(form);
      if (result.ok) {
        toast.success("Profile photo updated");
        close();
        router.refresh();
      } else {
        URL.revokeObjectURL(photo.url);
        setPhoto(null);
        setError(result.error);
      }
    });

  return (
    <Dialog open={open} onClose={close} dismissible={!uploading} title="Profile photo" size="md">
      <div className="relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-3xl bg-ink-900">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo.url} alt="Your photo" className="size-full object-cover" />
        ) : (
          <video ref={videoRef} playsInline muted className="size-full -scale-x-100 object-cover" />
        )}
        {/* Oval face guide */}
        <div aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center">
          <div className={`h-[70%] w-[64%] rounded-[50%] border-[3px] ${error ? "border-danger" : "border-white/90"} shadow-[0_0_0_999px_rgba(0,0,0,0.35)]`} />
        </div>
        {cameraError && !photo && (
          <div className="absolute inset-0 grid place-items-center bg-ink-900/85 p-6 text-center text-sm text-white">
            <div>
              <Camera aria-hidden className="mx-auto size-8" />
              <p className="mt-3">{cameraError}</p>
              <button type="button" onClick={start} className={buttonClass("gold", "sm", "mt-4")}>
                Try again
              </button>
            </div>
          </div>
        )}
      </div>
      <p className={`mt-4 text-center text-sm ${error ? "font-medium text-danger" : "text-ink-500"}`}>
        {error ?? (photo ? "Happy with it? We'll check it shows your face clearly." : "Fit your face inside the oval, look at the camera, in good light.")}
      </p>
      <div className="mt-4 flex justify-center gap-2">
        {photo ? (
          <>
            <button
              type="button"
              disabled={uploading}
              onClick={() => {
                URL.revokeObjectURL(photo.url);
                setPhoto(null);
              }}
              className={buttonClass("outline", "md")}
            >
              <RotateCcw aria-hidden className="size-4" /> Retake
            </button>
            <button type="button" onClick={usePhoto} disabled={uploading} className={buttonClass("primary", "md")}>
              {uploading && <LoaderCircle aria-hidden className="size-4 animate-spin" />} Use photo
            </button>
          </>
        ) : (
          <button type="button" onClick={capture} disabled={!!cameraError} className={buttonClass("primary", "lg")}>
            <Camera aria-hidden className="size-5" /> Take photo
          </button>
        )}
      </div>
    </Dialog>
  );
}
