import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";

export function SectionHeading({
  eyebrow,
  title,
  accent,
  description,
  align = "left",
  className,
  action,
}: {
  eyebrow?: string;
  title: string;
  accent?: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <Reveal
      className={cn(
        "flex flex-col gap-4",
        align === "center" ? "items-center text-center" : "md:flex-row md:items-end md:justify-between",
        className
      )}
    >
      <div className={cn("max-w-2xl", align === "center" && "mx-auto")}>
        {eyebrow && (
          <p className="eyebrow mb-4 inline-flex items-center gap-2 text-pink-deep">
            <span className="h-px w-6 bg-current" />
            {eyebrow}
          </p>
        )}
        <h2 className="font-soft text-[2.1rem] leading-[1.05] font-medium text-ink sm:text-5xl">
          {title} {accent && <em className="font-wonk text-pink italic">{accent}</em>}
        </h2>
        {description && <p className="mt-4 text-[1.05rem] leading-relaxed text-ink-3">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </Reveal>
  );
}
