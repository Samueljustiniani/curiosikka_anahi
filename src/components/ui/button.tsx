import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "pink" | "teal" | "outline" | "ghost" | "white" | "wa";
type Size = "sm" | "md" | "lg";

const base =
  "group/btn relative inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-all duration-300 ease-[var(--ease-out-expo)] active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 select-none";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-cream shadow-[0_10px_30px_-12px_rgb(28_27_58/0.6)] hover:bg-ink-2 hover:-translate-y-0.5",
  pink: "bg-pink text-white shadow-glow hover:bg-pink-deep hover:-translate-y-0.5",
  teal: "bg-teal text-white shadow-[0_10px_30px_-10px_rgb(23_168_160/0.6)] hover:bg-teal-deep hover:-translate-y-0.5",
  wa: "bg-[#1fae57] text-white shadow-[0_10px_30px_-10px_rgb(31_174_87/0.6)] hover:bg-[#178f47] hover:-translate-y-0.5",
  outline: "border border-ink/15 bg-white/60 text-ink backdrop-blur hover:border-ink/40 hover:bg-white",
  ghost: "text-ink hover:bg-ink/5",
  white: "bg-white text-ink shadow-soft hover:-translate-y-0.5 hover:shadow-lift",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-12 px-6 text-[0.95rem]",
  lg: "h-14 px-8 text-base",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

type CommonProps = { variant?: Variant; size?: Size; className?: string; children: React.ReactNode };

export function Button({
  variant,
  size,
  className,
  children,
  ...props
}: CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={buttonClass(variant, size, className)} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant,
  size,
  className,
  children,
  external,
  ...props
}: CommonProps & { href: string; external?: boolean } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  if (external || href.startsWith("http")) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={buttonClass(variant, size, className)} {...props}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={buttonClass(variant, size, className)} {...props}>
      {children}
    </Link>
  );
}
