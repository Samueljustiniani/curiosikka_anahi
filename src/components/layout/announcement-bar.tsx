"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { formatLong, limaToday, relativeDays } from "@/lib/dates";
import { upcomingOccasions, type UpcomingOccasion } from "@/lib/occasions";
import { useSite } from "@/components/providers/site-provider";

export function AnnouncementBar() {
  const { announcement } = useSite();
  const [next, setNext] = useState<UpcomingOccasion | null>(null);

  useEffect(() => {
    setNext(upcomingOccasions(limaToday())[0] ?? null);
  }, []);

  return (
    <div className="relative z-50 bg-ink text-cream">
      <div className="container-x flex h-10 items-center justify-center gap-3 text-[0.8rem] sm:text-sm">
        {announcement ? (
          <p className="truncate">{announcement}</p>
        ) : next ? (
          <Link
            href={`/ocasiones/${next.occasion.slug}`}
            className="group flex min-w-0 items-center gap-2.5 transition-opacity hover:opacity-90"
          >
            <span
              className="h-2 w-2 shrink-0 animate-pulse rounded-full"
              style={{ backgroundColor: next.occasion.palette.to }}
            />
            <span className="truncate">
              <strong className="font-semibold">{next.occasion.name}</strong>
              <span className="text-cream/50"> · </span>
              <span className="text-cream/85">
                {next.days <= 2 ? `${relativeDays(next.days)}, ` : ""}
                {formatLong(next.date)}
              </span>
              <span className="hidden text-cream/60 sm:inline"> — separa tu detalle con tiempo</span>
            </span>
            <ArrowRight className="size-3.5 shrink-0 transition-transform group-hover:translate-x-1" />
          </Link>
        ) : (
          <span className="text-cream/70">Detalles · Manualidades · Curiosidades</span>
        )}
      </div>
    </div>
  );
}
