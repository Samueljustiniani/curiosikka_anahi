import { diffDays, limaToday, nthWeekday, parseISO, toISO, type ISODate } from "./dates";

/**
 * Fechas especiales reales del calendario peruano.
 * Las de regla "nth" se calculan cada año (ej. Día de la Madre = 2º domingo de mayo).
 */
export type OccasionRule =
  | { type: "fixed"; month: number; day: number }
  | { type: "nth"; month: number; weekday: number; n: number }
  | { type: "always" };

export type OccasionIcon =
  | "heart" | "sparkles" | "puzzle" | "flower2" | "medal" | "apple" | "users"
  | "sprout" | "flower" | "tree" | "cake" | "gem" | "grad" | "party";

export type Occasion = {
  slug: string;
  name: string;
  /** Cómo se calcula la fecha, en palabras */
  when: string;
  rule: OccasionRule;
  description: string;
  ideas: string[];
  icon: OccasionIcon;
  palette: { from: string; to: string; accent: string; ink: string };
};

export const OCCASIONS: Occasion[] = [
  {
    slug: "san-valentin",
    name: "San Valentín",
    when: "14 de febrero",
    rule: { type: "fixed", month: 2, day: 14 },
    description:
      "El Día del Amor y la Amistad. La fecha más esperada para sorprender a tu pareja y a tus amigos con algo hecho especialmente para ellos.",
    ideas: ["Cuadro con sus fotos favoritas", "Frase o canción que los une", "Detalle sorpresa con dedicatoria"],
    icon: "heart",
    palette: { from: "#FFD9E7", to: "#F6A6C7", accent: "#D93A7C", ink: "#5A1235" },
  },
  {
    slug: "dia-de-la-mujer",
    name: "Día de la Mujer",
    when: "8 de marzo",
    rule: { type: "fixed", month: 3, day: 8 },
    description:
      "Día Internacional de la Mujer. Un detalle para reconocer a las mujeres que admiras: mamá, hermana, amiga, compañera.",
    ideas: ["Mensaje de reconocimiento", "Detalle para compartir en el trabajo", "Cuadro con frase inspiradora"],
    icon: "sparkles",
    palette: { from: "#EFE6FF", to: "#CDB8F4", accent: "#7A55D3", ink: "#2E1C5C" },
  },
  {
    slug: "dia-del-nino",
    name: "Día del Niño",
    when: "2º domingo de abril",
    rule: { type: "nth", month: 4, weekday: 0, n: 2 },
    description:
      "Día del Niño Peruano, celebrado el segundo domingo de abril. La excusa perfecta para un regalo lleno de color.",
    ideas: ["Cuadro con su personaje favorito", "Recuerdo con su nombre", "Curiosidades para jugar"],
    icon: "puzzle",
    palette: { from: "#FFF1C4", to: "#BFEBE5", accent: "#D88A12", ink: "#4A3200" },
  },
  {
    slug: "dia-de-la-madre",
    name: "Día de la Madre",
    when: "2º domingo de mayo",
    rule: { type: "nth", month: 5, weekday: 0, n: 2 },
    description:
      "En Perú se celebra el segundo domingo de mayo. Uno de los días con más pedidos del año: separa con anticipación.",
    ideas: ["Cuadro familiar con fotos", "Frase dedicada de sus hijos", "Detalle para la abuela también"],
    icon: "flower2",
    palette: { from: "#FFE2EA", to: "#F4B8CC", accent: "#C93277", ink: "#561431" },
  },
  {
    slug: "dia-del-padre",
    name: "Día del Padre",
    when: "3er domingo de junio",
    rule: { type: "nth", month: 6, weekday: 0, n: 3 },
    description:
      "En Perú se celebra el tercer domingo de junio. Un recuerdo que papá pueda tener siempre a la vista.",
    ideas: ["Cuadro con sus momentos favoritos", "Detalle con su nombre", "Algo de su equipo o hobby"],
    icon: "medal",
    palette: { from: "#DCE7F6", to: "#B5D6E6", accent: "#2B4C7E", ink: "#13284A" },
  },
  {
    slug: "dia-del-amigo",
    name: "Día del Amigo",
    when: "1er sábado de julio",
    rule: { type: "nth", month: 7, weekday: 6, n: 1 },
    description:
      "En Perú se celebra el primer sábado de julio. Celebra a esos amigos que son familia.",
    ideas: ["Cuadro de la promo o del grupo", "Detalle con su apodo", "Curiosidades para compartir"],
    icon: "users",
    palette: { from: "#D3F4EF", to: "#9EE0D7", accent: "#0E8C85", ink: "#073F3C" },
  },
  {
    slug: "dia-del-maestro",
    name: "Día del Maestro",
    when: "6 de julio",
    rule: { type: "fixed", month: 7, day: 6 },
    description:
      "En Perú se celebra cada 6 de julio. Agradece a ese profe que deja huella.",
    ideas: ["Detalle del salón completo", "Mensaje de agradecimiento", "Recuerdo con su nombre"],
    icon: "apple",
    palette: { from: "#FFF3D1", to: "#F9D88C", accent: "#B97C00", ink: "#4A3300" },
  },
  {
    slug: "primavera",
    name: "Día de la Primavera y la Juventud",
    when: "23 de septiembre",
    rule: { type: "fixed", month: 9, day: 23 },
    description:
      "En Perú, cada 23 de septiembre se celebra la llegada de la primavera junto con el Día de la Juventud.",
    ideas: ["Detalle floral", "Algo colorido para alegrar el día", "Sorpresa para amigos"],
    icon: "sprout",
    palette: { from: "#E7F7DA", to: "#FBE7A6", accent: "#4E9A2E", ink: "#22410F" },
  },
  {
    slug: "dia-del-novio",
    name: "Día del Novio",
    when: "3 de octubre",
    rule: { type: "fixed", month: 10, day: 3 },
    description:
      "En Perú se celebra cada 3 de octubre. El color protagonista es el azul, símbolo de fidelidad y confianza: es tradición regalar flores azules.",
    ideas: ["Cuadro con sus fotos juntos", "Detalle en tonos azules", "Frase que solo ustedes entienden"],
    icon: "flower",
    palette: { from: "#DDE8FF", to: "#A9C3F4", accent: "#2E5BCB", ink: "#10275E" },
  },
  {
    slug: "navidad",
    name: "Navidad",
    when: "25 de diciembre",
    rule: { type: "fixed", month: 12, day: 25 },
    description:
      "La temporada de regalar. Detalles para la familia, los amigos y el amigo secreto.",
    ideas: ["Cuadro familiar del año", "Detalles para el amigo secreto", "Recuerdos para toda la familia"],
    icon: "tree",
    palette: { from: "#FBE0E0", to: "#D3EDD7", accent: "#B92F37", ink: "#4D1014" },
  },
  // ── Todo el año ───────────────────────────────────────────
  {
    slug: "cumpleanos",
    name: "Cumpleaños",
    when: "Todo el año",
    rule: { type: "always" },
    description: "Un año más merece un detalle que no se olvide.",
    ideas: ["Cuadro con fotos de su año", "Detalle con su nombre", "Sorpresa con dedicatoria"],
    icon: "cake",
    palette: { from: "#FFF0C9", to: "#FAC6DA", accent: "#D0447F", ink: "#4F1A33" },
  },
  {
    slug: "aniversario",
    name: "Aniversario",
    when: "Todo el año",
    rule: { type: "always" },
    description: "Meses, años… cada aniversario cuenta su propia historia.",
    ideas: ["Cuadro con la fecha en que empezó todo", "Línea de tiempo en fotos", "Frase de su canción"],
    icon: "gem",
    palette: { from: "#FBE3F0", to: "#D9C8F6", accent: "#A3399A", ink: "#43113F" },
  },
  {
    slug: "graduacion",
    name: "Graduación",
    when: "Todo el año",
    rule: { type: "always" },
    description: "Celebra el esfuerzo y el logro con un recuerdo a la altura.",
    ideas: ["Cuadro con su foto de grado", "Detalle con su nombre y carrera", "Recuerdo de la promoción"],
    icon: "grad",
    palette: { from: "#E1E3F5", to: "#FBE6A8", accent: "#1C1B3A", ink: "#1C1B3A" },
  },
  {
    slug: "porque-si",
    name: "Porque sí",
    when: "Cualquier día",
    rule: { type: "always" },
    description: "No hace falta una fecha para decir “me importas”.",
    ideas: ["Un detalle sorpresa", "Una frase bonita en un cuadro", "Una curiosidad para alegrar su día"],
    icon: "party",
    palette: { from: "#D4F3EF", to: "#E6DBFA", accent: "#17A8A0", ink: "#0B3F3C" },
  },
];

export const OCCASION_MAP = Object.fromEntries(OCCASIONS.map((o) => [o.slug, o])) as Record<string, Occasion>;

export function getOccasion(slug: string | null | undefined) {
  return slug ? OCCASION_MAP[slug] : undefined;
}

export function isDated(o: Occasion) {
  return o.rule.type !== "always";
}

/** Fecha de la ocasión en un año dado */
export function occasionDateInYear(o: Occasion, year: number): ISODate | null {
  const r = o.rule;
  if (r.type === "fixed") return toISO(year, r.month, r.day);
  if (r.type === "nth") return nthWeekday(year, r.month, r.weekday, r.n);
  return null;
}

/** Próxima vez que ocurre (hoy cuenta) */
export function nextOccurrence(o: Occasion, from: ISODate = limaToday()): ISODate | null {
  const { y } = parseISO(from);
  const thisYear = occasionDateInYear(o, y);
  if (!thisYear) return null;
  return diffDays(from, thisYear) >= 0 ? thisYear : occasionDateInYear(o, y + 1);
}

export type UpcomingOccasion = { occasion: Occasion; date: ISODate; days: number };

export function upcomingOccasions(from: ISODate = limaToday()): UpcomingOccasion[] {
  return OCCASIONS.filter(isDated)
    .map((occasion) => {
      const date = nextOccurrence(occasion, from)!;
      return { occasion, date, days: diffDays(from, date) };
    })
    .sort((a, b) => a.days - b.days);
}

/** Mapa ISO → ocasiones de ese año (para pintar calendarios) */
export function occasionsByDate(year: number) {
  const map: Record<ISODate, Occasion[]> = {};
  for (const o of OCCASIONS) {
    const d = occasionDateInYear(o, year);
    if (d) (map[d] ||= []).push(o);
  }
  return map;
}
