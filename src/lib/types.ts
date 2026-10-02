export type Settings = {
  id: number;
  whatsapp: string;
  daily_capacity: number | null;
  min_lead_days: number;
  announcement: string | null;
  hero_video_url: string | null;
  hero_poster_url: string | null;
  address: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  yape_number: string | null;
  yape_name: string | null;
  yape_qr_url: string | null;
  /** % del total que se paga para separar (100 = pago completo) */
  deposit_percent: number;
  updated_at?: string;
};

export type Category = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sort: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  description: string | null;
  price: number | null;
  compare_at_price: number | null;
  category_id: string | null;
  occasions: string[];
  images: string[];
  video_url: string | null;
  is_customizable: boolean;
  customization_hint: string | null;
  lead_days: number | null;
  stock: number | null;
  is_featured: boolean;
  is_active: boolean;
  sort: number;
  created_at: string;
  updated_at: string;
  category?: Pick<Category, "id" | "slug" | "name"> | null;
};

export type OrderItem = {
  product_id: string;
  slug: string;
  name: string;
  price: number | null;
  qty: number;
  image: string | null;
  note: string;
};

export type OrderStatus = "pendiente" | "confirmado" | "en_preparacion" | "listo" | "entregado" | "cancelado";

export type Order = {
  id: string;
  code: string;
  customer_id: string | null;
  customer_name: string;
  phone: string;
  delivery_date: string;
  time_slot: string | null;
  occasion: string | null;
  delivery_type: "recojo" | "delivery";
  district: string | null;
  address: string | null;
  recipient_name: string | null;
  dedication: string | null;
  notes: string | null;
  items: OrderItem[];
  subtotal: number;
  has_quote_items: boolean;
  paid_amount: number;
  status: OrderStatus;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Customer = {
  id: string;
  phone: string;
  name: string | null;
  notes: string | null;
  created_at: string;
  last_seen_at: string;
};

export type Reminder = {
  id: string;
  customer_id: string | null;
  phone: string;
  label: string;
  person_name: string | null;
  month: number;
  day: number;
  notes: string | null;
  last_contacted_at: string | null;
  created_at: string;
};

export type CalendarBlock = { date: string; reason: string | null };

export type DayAvailability = {
  day: string;
  booked: number;
  capacity: number | null;
  blocked: boolean;
  reason: string | null;
};

export const ORDER_STATUSES: { value: OrderStatus; label: string; tone: string }[] = [
  { value: "pendiente", label: "Pendiente", tone: "bg-butter-soft text-[#7a5600] ring-butter/40" },
  { value: "confirmado", label: "Confirmado", tone: "bg-lilac-soft text-[#4b2f93] ring-lilac/50" },
  { value: "en_preparacion", label: "En preparación", tone: "bg-blush text-pink-deep ring-pink/30" },
  { value: "listo", label: "Listo", tone: "bg-teal-soft text-teal-deep ring-teal/30" },
  { value: "entregado", label: "Entregado", tone: "bg-ink text-cream ring-ink" },
  { value: "cancelado", label: "Cancelado", tone: "bg-shell text-ink-3 ring-ink/10 line-through" },
];

export const STATUS_LABEL = Object.fromEntries(ORDER_STATUSES.map((s) => [s.value, s.label])) as Record<OrderStatus, string>;
