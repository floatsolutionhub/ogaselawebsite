import Image from "next/image";
import clsx from "clsx";

export function Logo({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <Image
      src="/images/logo.png"
      alt="Ogasela"
      width={size}
      height={size}
      className={clsx("flex-shrink-0 rounded-xl", className)}
    />
  );
}
