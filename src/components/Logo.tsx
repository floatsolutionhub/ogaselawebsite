import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";

export function Logo({ light = false, className }: { light?: boolean; className?: string }) {
  return (
    <Link href="/" aria-label="Ogasela home" className={clsx("flex shrink-0 items-center gap-2.5", className)}>
      <Image src="/images/logo.png" alt="" width={40} height={40} priority className="size-10 rounded-xl" />
      <span className={clsx("text-xl font-bold tracking-tight", light ? "text-white" : "text-brand-700")}>
        Oga<span className="text-gold-400">sela</span>
      </span>
    </Link>
  );
}
