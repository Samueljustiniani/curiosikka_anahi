import type { Metadata } from "next";
import { RemindersForm } from "@/components/reminders/reminders-form";
import { PageHero } from "@/components/ui/page-hero";

export const metadata: Metadata = {
  title: "Mis fechas importantes",
  description: "Guarda cumpleaños y aniversarios con tu número y te recordamos por WhatsApp unos días antes.",
};

export default function MisFechasPage() {
  return (
    <>
      <PageHero
        eyebrow="Mis fechas importantes"
        title="Nunca más olvides"
        accent="una fecha especial"
        description="Guarda los cumpleaños, aniversarios y fechas de quienes quieres. Unos días antes te escribimos por WhatsApp para que tengas tu detalle a tiempo."
      />
      <div className="container-x">
        <RemindersForm />
      </div>
    </>
  );
}
