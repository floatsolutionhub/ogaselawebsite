import Link from "next/link";
import { ChevronLeft } from "lucide-react";

/** Back link + title for the settings screens. */
export function ScreenHeader({ title, back = "/account/settings", backLabel = "Settings", children }: {
  title: string;
  back?: string;
  backLabel?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <Link href={back} className="inline-flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-600">
        <ChevronLeft aria-hidden className="size-4" /> {backLabel}
      </Link>
      <div className="mt-2 flex items-end justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {children}
      </div>
    </div>
  );
}
