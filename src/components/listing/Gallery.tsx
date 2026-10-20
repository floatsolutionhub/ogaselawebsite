"use client";

import { useState } from "react";
import clsx from "clsx";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";

export function Gallery({ images, title }: { images: string[]; title: string }) {
  const [index, setIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="grid aspect-[4/3] place-items-center rounded-3xl bg-canvas text-ink-300">
        <ImageOff aria-hidden className="size-12" />
      </div>
    );
  }

  const go = (delta: number) => setIndex((i) => (i + delta + images.length) % images.length);

  return (
    <div className="space-y-3">
      <div
        className="group relative aspect-[4/3] overflow-hidden rounded-3xl bg-ink-900"
        role="region"
        aria-roledescription="carousel"
        aria-label={`Photos of ${title}`}
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") go(1);
          if (event.key === "ArrowLeft") go(-1);
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[index]}
          alt={`${title}, photo ${index + 1} of ${images.length}`}
          referrerPolicy="no-referrer"
          className="size-full object-contain"
        />
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous photo"
              className="absolute left-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink-900 shadow-md transition hover:bg-white sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
            >
              <ChevronLeft aria-hidden className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next photo"
              className="absolute right-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-ink-900 shadow-md transition hover:bg-white sm:opacity-0 sm:group-hover:opacity-100 sm:focus:opacity-100"
            >
              <ChevronRight aria-hidden className="size-5" />
            </button>
            <span className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
              {index + 1} / {images.length}
            </span>
          </>
        )}
      </div>

      {images.length > 1 && (
        <ul className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <li key={src} className="shrink-0">
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show photo ${i + 1}`}
                aria-current={i === index}
                className={clsx(
                  "block size-16 overflow-hidden rounded-xl ring-2 transition sm:size-20",
                  i === index ? "ring-gold-400" : "opacity-70 ring-transparent hover:opacity-100",
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" loading="lazy" referrerPolicy="no-referrer" className="size-full object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
