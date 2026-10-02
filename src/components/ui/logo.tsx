import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/config";
import { cn } from "@/lib/utils";

export function Logo({ className, size = 48, withText = true }: { className?: string; size?: number; withText?: boolean }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-3", className)} aria-label={`${BRAND.name} — inicio`}>
      <span
        className="relative block shrink-0 overflow-hidden rounded-full ring-1 ring-pink/30 shadow-soft transition-transform duration-500 group-hover:rotate-[-8deg] group-hover:scale-105"
        style={{ width: size, height: size }}
      >
        <Image src="/brand/logo-320.webp" alt="" width={size} height={size} priority className="h-full w-full object-cover" />
      </span>
      {withText && (
        <span className="leading-none">
          <span className="block font-display text-[1.35rem] font-semibold tracking-tight text-ink">
            Curios<span className="text-pink">ii</span>
            <span className="text-teal">ka</span>
          </span>
          <span className="mt-1 hidden whitespace-nowrap text-[0.6rem] font-semibold uppercase tracking-[0.24em] text-ink-3 sm:block">
            Detalles con amor
          </span>
        </span>
      )}
    </Link>
  );
}
