import { cn, formatPrice } from "@/lib/utils";

export function Price({
  price,
  compareAt,
  className,
  size = "md",
}: {
  price: number | null;
  compareAt?: number | null;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = { sm: "text-base", md: "text-lg", lg: "text-3xl" };
  if (price === null) {
    return (
      <span className={cn("font-display italic text-ink-2", sizes[size], className)}>
        Precio a cotizar
      </span>
    );
  }
  return (
    <span className={cn("inline-flex items-baseline gap-2", className)}>
      <span className={cn("font-display font-semibold tabular-nums text-ink", sizes[size])}>{formatPrice(price)}</span>
      {compareAt && compareAt > price && (
        <span className="text-sm text-ink-3 line-through tabular-nums">{formatPrice(compareAt)}</span>
      )}
    </span>
  );
}
