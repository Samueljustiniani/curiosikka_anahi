-- ╔══════════════════════════════════════════════════════════════════╗
-- ║  CURIOSIIKA · Esquema completo de base de datos (Supabase)        ║
-- ║  Pégalo entero en  Supabase → SQL Editor → New query → Run        ║
-- ║  Es idempotente: puedes volver a ejecutarlo sin romper nada.      ║
-- ╚══════════════════════════════════════════════════════════════════╝


-- ─────────────────────────────────────────────────────────────────────
-- 1. ADMINISTRADORES  (correos que pueden entrar a /admin)
-- ─────────────────────────────────────────────────────────────────────
create table if not exists public.admins (
  email      text primary key,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.admins a
    where lower(a.email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );
$$;

-- ─────────────────────────────────────────────────────────────────────
-- 2. AJUSTES DE LA TIENDA (una sola fila)
-- ─────────────────────────────────────────────────────────────────────
create table if not exists public.settings (
  id              int primary key default 1 check (id = 1),
  whatsapp        text not null default '51912470219',
  daily_capacity  int check (daily_capacity is null or daily_capacity >= 0), -- null = sin límite
  min_lead_days   int not null default 1 check (min_lead_days between 0 and 60),
  announcement    text,
  hero_video_url  text,
  hero_poster_url text,
  address         text default 'San Vicente, Lima, Perú',
  facebook_url    text default 'https://www.facebook.com/people/Curiosiika/61591787475115/',
  instagram_url   text,
  tiktok_url      text,
  updated_at      timestamptz not null default now()
);
insert into public.settings (id) values (1) on conflict (id) do nothing;

-- Pagos con Yape (se muestran al cliente al separar)
alter table public.settings add column if not exists yape_number     text;
alter table public.settings add column if not exists yape_name       text;
alter table public.settings add column if not exists yape_qr_url     text;
alter table public.settings add column if not exists deposit_percent int not null default 50; -- % de adelanto para separar
do $$ begin
  alter table public.settings add constraint settings_deposit_percent_chk check (deposit_percent between 0 and 100);
exception when duplicate_object then null; end $$;

-- ─────────────────────────────────────────────────────────────────────
-- 3. CATEGORÍAS
-- ─────────────────────────────────────────────────────────────────────
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  description text,
  sort        int not null default 0,
  created_at  timestamptz not null default now()
);

insert into public.categories (slug, name, description, sort) values
  ('cuadros-personalizados', 'Cuadros personalizados', 'Tus fotos y frases convertidas en un recuerdo para siempre.', 1),
  ('detalles',               'Detalles',               'Sorpresas pensadas para cada persona y cada fecha.',          2),
  ('manualidades',           'Manualidades',           'Hecho a mano, pieza por pieza.',                              3),
  ('curiosidades',           'Curiosidades',           'Cositas únicas para regalar y regalarte.',                    4)
on conflict (slug) do nothing;

-- ─────────────────────────────────────────────────────────────────────
-- 4. PRODUCTOS
-- ─────────────────────────────────────────────────────────────────────
create table if not exists public.products (
  id                 uuid primary key default gen_random_uuid(),
  slug               text unique not null,
  name               text not null,
  short_description  text,
  description        text,
  price              numeric(10,2) check (price is null or price >= 0),  -- null = "a cotizar"
  compare_at_price   numeric(10,2) check (compare_at_price is null or compare_at_price >= 0),
  category_id        uuid references public.categories(id) on delete set null,
  occasions          text[] not null default '{}',   -- slugs de ocasiones (ver src/lib/occasions.ts)
  images             text[] not null default '{}',
  video_url          text,
  is_customizable    boolean not null default true,
  customization_hint text,                            -- ej: "Envíanos 6 fotos y una frase"
  lead_days          int check (lead_days is null or lead_days between 0 and 60),
  stock              int check (stock is null or stock >= 0), -- null = se hace por pedido
  is_featured        boolean not null default false,
  is_active          boolean not null default true,
  sort               int not null default 0,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index if not exists products_occasions_idx on public.products using gin (occasions);
create index if not exists products_category_idx  on public.products (category_id);

-- ─────────────────────────────────────────────────────────────────────
-- 5. CLIENTES  (el celular es ÚNICO por persona)
-- ─────────────────────────────────────────────────────────────────────
create table if not exists public.customers (
  id           uuid primary key default gen_random_uuid(),
  phone        text unique not null check (phone ~ '^9[0-9]{8}$'),
  name         text,
  notes        text,
  created_at   timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────
-- 6. PEDIDOS / SEPARACIONES
-- ─────────────────────────────────────────────────────────────────────
create table if not exists public.orders (
  id              uuid primary key default gen_random_uuid(),
  code            text unique not null,
  customer_id     uuid references public.customers(id) on delete set null,
  customer_name   text not null,
  phone           text not null,
  delivery_date   date not null,
  time_slot       text,
  occasion        text,
  delivery_type   text not null default 'recojo' check (delivery_type in ('recojo', 'delivery')),
  district        text,
  address         text,
  recipient_name  text,
  dedication      text,
  notes           text,
  items           jsonb not null default '[]'::jsonb,
  subtotal        numeric(10,2) not null default 0,
  has_quote_items boolean not null default false,
  status          text not null default 'pendiente'
                  check (status in ('pendiente','confirmado','en_preparacion','listo','entregado','cancelado')),
  admin_notes     text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists orders_delivery_date_idx on public.orders (delivery_date);
create index if not exists orders_phone_idx         on public.orders (phone);
create index if not exists orders_status_idx        on public.orders (status);

-- Lo que el cliente ya pagó (adelanto o total), lo registra la tienda en el panel
alter table public.orders add column if not exists paid_amount numeric(10,2) not null default 0;
do $$ begin
  alter table public.orders add constraint orders_paid_amount_chk check (paid_amount >= 0);
exception when duplicate_object then null; end $$;

-- ─────────────────────────────────────────────────────────────────────
-- 7. FECHAS IMPORTANTES DE LOS CLIENTES (recordatorios)
-- ─────────────────────────────────────────────────────────────────────
create table if not exists public.reminders (
  id                uuid primary key default gen_random_uuid(),
  customer_id       uuid references public.customers(id) on delete cascade,
  phone             text not null,
  label             text not null,
  person_name       text,
  month             smallint not null check (month between 1 and 12),
  day               smallint not null check (day between 1 and 31),
  notes             text,
  last_contacted_at timestamptz,
  created_at        timestamptz not null default now()
);
create index if not exists reminders_phone_idx on public.reminders (phone);
create index if not exists reminders_md_idx    on public.reminders (month, day);

-- ─────────────────────────────────────────────────────────────────────
-- 8. DÍAS BLOQUEADOS EN EL CALENDARIO
-- ─────────────────────────────────────────────────────────────────────
create table if not exists public.calendar_blocks (
  date       date primary key,
  reason     text,
  created_at timestamptz not null default now()
);

-- ─────────────────────────────────────────────────────────────────────
-- 9. updated_at automático
-- ─────────────────────────────────────────────────────────────────────
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
  for each row execute function public.touch_updated_at();

drop trigger if exists orders_touch on public.orders;
create trigger orders_touch before update on public.orders
  for each row execute function public.touch_updated_at();

drop trigger if exists settings_touch on public.settings;
create trigger settings_touch before update on public.settings
  for each row execute function public.touch_updated_at();

-- ─────────────────────────────────────────────────────────────────────
-- 10. FUNCIONES PÚBLICAS (RPC)  ·  la web pública SOLO escribe por aquí
-- ─────────────────────────────────────────────────────────────────────

-- Normaliza un celular peruano: deja 9 dígitos que empiezan con 9
create or replace function public.normalize_pe_phone(p text)
returns text language plpgsql immutable as $$
declare v text := regexp_replace(coalesce(p, ''), '\D', '', 'g');
begin
  if length(v) = 11 and left(v, 2) = '51' then v := substr(v, 3); end if;
  if v !~ '^9[0-9]{8}$' then
    raise exception 'Ingresa un número de celular válido (9 dígitos, empieza con 9).' using errcode = '22023';
  end if;
  return v;
end $$;

-- Disponibilidad por día (solo conteos, sin datos personales)
create or replace function public.get_availability(p_from date, p_to date)
returns table (day date, booked int, capacity int, blocked boolean, reason text)
language sql stable security definer set search_path = public
as $$
  select d::date as day,
         (select count(*) from public.orders o
           where o.delivery_date = d::date and o.status <> 'cancelado')::int as booked,
         (select s.daily_capacity from public.settings s where s.id = 1) as capacity,
         exists (select 1 from public.calendar_blocks b where b.date = d::date) as blocked,
         (select b.reason from public.calendar_blocks b where b.date = d::date) as reason
  from generate_series(p_from::timestamp, least(p_to, p_from + 120)::timestamp, interval '1 day') as d;
$$;

-- Crear una separación (pedido). Recalcula precios desde la BD.
create or replace function public.create_order(
  p_name          text,
  p_phone         text,
  p_delivery_date date,
  p_time_slot     text,
  p_occasion      text,
  p_delivery_type text,
  p_district      text,
  p_address       text,
  p_recipient     text,
  p_dedication    text,
  p_notes         text,
  p_items         jsonb
)
returns table (order_code text, order_subtotal numeric, needs_quote boolean)
language plpgsql security definer set search_path = public
as $$
declare
  v_phone       text := public.normalize_pe_phone(p_phone);
  v_name        text := left(trim(coalesce(p_name, '')), 80);
  v_settings    public.settings;
  v_customer_id uuid;
  v_items       jsonb := '[]'::jsonb;
  v_item        jsonb;
  v_product     public.products;
  v_qty         int;
  v_subtotal    numeric := 0;
  v_quote       boolean := false;
  v_code        text;
  v_booked      int;
  v_lead        int;
  v_type        text := case when p_delivery_type = 'delivery' then 'delivery' else 'recojo' end;
  v_today       date := (now() at time zone 'America/Lima')::date;
begin
  if v_name = '' then
    raise exception 'Cuéntanos tu nombre.' using errcode = '22023';
  end if;
  if p_delivery_date is null then
    raise exception 'Elige la fecha de entrega.' using errcode = '22023';
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' then
    p_items := '[]'::jsonb;
  end if;
  if jsonb_array_length(p_items) > 30 then
    raise exception 'Demasiados productos en un solo pedido.' using errcode = '22023';
  end if;

  -- anti-spam: máximo 6 separaciones por número en 1 hora
  if (select count(*) from public.orders o
       where o.phone = v_phone and o.created_at > now() - interval '1 hour') >= 6 then
    raise exception 'Ya registramos varias separaciones con tu número. Escríbenos por WhatsApp.' using errcode = '22023';
  end if;

  select * into v_settings from public.settings where id = 1;
  v_lead := coalesce(v_settings.min_lead_days, 0);

  for v_item in select * from jsonb_array_elements(p_items) loop
    select * into v_product from public.products
      where id = nullif(v_item ->> 'product_id', '')::uuid and is_active;
    if not found then
      raise exception 'Uno de los productos ya no está disponible. Actualiza tu lista.' using errcode = '22023';
    end if;
    v_qty  := greatest(1, least(coalesce((v_item ->> 'qty')::int, 1), 50));
    v_lead := greatest(v_lead, coalesce(v_product.lead_days, 0));
    if v_product.price is null then
      v_quote := true;
    else
      v_subtotal := v_subtotal + v_product.price * v_qty;
    end if;
    v_items := v_items || jsonb_build_object(
      'product_id', v_product.id,
      'slug',       v_product.slug,
      'name',       v_product.name,
      'price',      v_product.price,
      'qty',        v_qty,
      'image',      v_product.images[1],
      'note',       left(coalesce(v_item ->> 'note', ''), 300)
    );
  end loop;

  if jsonb_array_length(v_items) = 0 and coalesce(trim(p_notes), '') = '' then
    raise exception 'Agrega un producto o cuéntanos tu idea.' using errcode = '22023';
  end if;
  if p_delivery_date < v_today + v_lead then
    raise exception 'Para esa fecha necesitamos al menos % día(s) de anticipación.', v_lead using errcode = '22023';
  end if;
  if p_delivery_date > v_today + 365 then
    raise exception 'Solo aceptamos separaciones hasta con un año de anticipación.' using errcode = '22023';
  end if;
  if exists (select 1 from public.calendar_blocks b where b.date = p_delivery_date) then
    raise exception 'Ese día no estamos tomando pedidos. Elige otra fecha.' using errcode = '22023';
  end if;
  if v_settings.daily_capacity is not null then
    select count(*) into v_booked from public.orders o
      where o.delivery_date = p_delivery_date and o.status <> 'cancelado';
    if v_booked >= v_settings.daily_capacity then
      raise exception 'Ese día ya está completo. Elige otra fecha.' using errcode = '22023';
    end if;
  end if;

  insert into public.customers (phone, name)
    values (v_phone, v_name)
    on conflict (phone) do update set name = excluded.name, last_seen_at = now()
    returning id into v_customer_id;

  loop
    v_code := 'CK-' || upper(substr(md5(gen_random_uuid()::text), 1, 5));
    exit when not exists (select 1 from public.orders o where o.code = v_code);
  end loop;

  insert into public.orders (
    code, customer_id, customer_name, phone, delivery_date, time_slot, occasion,
    delivery_type, district, address, recipient_name, dedication, notes,
    items, subtotal, has_quote_items
  ) values (
    v_code, v_customer_id, v_name, v_phone, p_delivery_date,
    left(nullif(trim(p_time_slot), ''), 60),
    left(nullif(trim(p_occasion), ''), 60),
    v_type,
    left(nullif(trim(p_district), ''), 80),
    left(nullif(trim(p_address), ''), 200),
    left(nullif(trim(p_recipient), ''), 80),
    left(nullif(trim(p_dedication), ''), 400),
    left(nullif(trim(p_notes), ''), 1000),
    v_items, v_subtotal, v_quote
  );

  return query select v_code, v_subtotal, v_quote;
end $$;

-- Seguimiento: requiere código + celular (incluye lo pagado)
drop function if exists public.track_order(text, text);
create function public.track_order(p_code text, p_phone text)
returns table (
  code text, status text, delivery_date date, time_slot text, delivery_type text,
  items jsonb, subtotal numeric, has_quote_items boolean, paid_amount numeric,
  created_at timestamptz, updated_at timestamptz
)
language plpgsql stable security definer set search_path = public
as $$
declare v_phone text := public.normalize_pe_phone(p_phone);
begin
  if p_code is not null and trim(p_code) <> '' then
    return query
      select o.code, o.status, o.delivery_date, o.time_slot, o.delivery_type,
             o.items, o.subtotal, o.has_quote_items, o.paid_amount, o.created_at, o.updated_at
      from public.orders o
      where o.code = upper(trim(p_code)) and o.phone = v_phone
      limit 1;
  else
    return query
      select o.code, o.status, o.delivery_date, o.time_slot, o.delivery_type,
             o.items, o.subtotal, o.has_quote_items, o.paid_amount, o.created_at, o.updated_at
      from public.orders o
      where o.phone = v_phone
      order by o.created_at desc
      limit 10;
  end if;
end $$;

-- Guardar fechas importantes de un cliente
create or replace function public.save_reminders(p_name text, p_phone text, p_items jsonb)
returns int
language plpgsql security definer set search_path = public
as $$
declare
  v_phone       text := public.normalize_pe_phone(p_phone);
  v_customer_id uuid;
  v_item        jsonb;
  v_month       int;
  v_day         int;
  v_label       text;
  v_person      text;
  v_count       int := 0;
begin
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Agrega al menos una fecha.' using errcode = '22023';
  end if;
  if jsonb_array_length(p_items) > 12 then
    raise exception 'Máximo 12 fechas a la vez.' using errcode = '22023';
  end if;
  if (select count(*) from public.reminders r where r.phone = v_phone) >= 40 then
    raise exception 'Ya tienes muchas fechas guardadas. Escríbenos por WhatsApp.' using errcode = '22023';
  end if;

  insert into public.customers (phone, name)
    values (v_phone, nullif(left(trim(coalesce(p_name, '')), 80), ''))
    on conflict (phone) do update
      set name = coalesce(excluded.name, public.customers.name), last_seen_at = now()
    returning id into v_customer_id;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_month  := (v_item ->> 'month')::int;
    v_day    := (v_item ->> 'day')::int;
    v_label  := left(trim(coalesce(v_item ->> 'label', '')), 60);
    v_person := nullif(left(trim(coalesce(v_item ->> 'person_name', '')), 60), '');
    if v_label = '' or v_month not between 1 and 12 or v_day not between 1 and 31 then
      continue;
    end if;
    if exists (select 1 from public.reminders r
               where r.phone = v_phone and r.month = v_month and r.day = v_day
                 and lower(r.label) = lower(v_label)
                 and coalesce(lower(r.person_name), '') = coalesce(lower(v_person), '')) then
      continue;
    end if;
    insert into public.reminders (customer_id, phone, label, person_name, month, day, notes)
      values (v_customer_id, v_phone, v_label, v_person, v_month, v_day,
              nullif(left(trim(coalesce(v_item ->> 'notes', '')), 200), ''));
    v_count := v_count + 1;
  end loop;
  return v_count;
end $$;

-- ─────────────────────────────────────────────────────────────────────
-- 11. PERMISOS + ROW LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────────────
grant usage on schema public to anon, authenticated;
grant select on public.settings, public.categories, public.products, public.calendar_blocks to anon;
grant select, insert, update, delete on
  public.settings, public.categories, public.products, public.customers,
  public.orders, public.reminders, public.calendar_blocks, public.admins
  to authenticated;

revoke all on function public.create_order(text,text,date,text,text,text,text,text,text,text,text,jsonb) from public;
revoke all on function public.save_reminders(text,text,jsonb) from public;
revoke all on function public.track_order(text,text) from public;
revoke all on function public.get_availability(date,date) from public;
grant execute on function public.create_order(text,text,date,text,text,text,text,text,text,text,text,jsonb) to anon, authenticated;
grant execute on function public.save_reminders(text,text,jsonb) to anon, authenticated;
grant execute on function public.track_order(text,text) to anon, authenticated;
grant execute on function public.get_availability(date,date) to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;

alter table public.admins          enable row level security;
alter table public.settings        enable row level security;
alter table public.categories      enable row level security;
alter table public.products        enable row level security;
alter table public.customers       enable row level security;
alter table public.orders          enable row level security;
alter table public.reminders       enable row level security;
alter table public.calendar_blocks enable row level security;

-- admins
drop policy if exists "admins: admin lee"    on public.admins;
create policy "admins: admin lee" on public.admins for select to authenticated using (public.is_admin());

-- settings
drop policy if exists "settings: lectura pública" on public.settings;
drop policy if exists "settings: admin edita"     on public.settings;
create policy "settings: lectura pública" on public.settings for select using (true);
create policy "settings: admin edita" on public.settings for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- categories
drop policy if exists "categories: lectura pública" on public.categories;
drop policy if exists "categories: admin gestiona"  on public.categories;
create policy "categories: lectura pública" on public.categories for select using (true);
create policy "categories: admin gestiona" on public.categories for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- products
drop policy if exists "products: lectura pública" on public.products;
drop policy if exists "products: admin gestiona"  on public.products;
create policy "products: lectura pública" on public.products for select
  using (is_active or public.is_admin());
create policy "products: admin gestiona" on public.products for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- customers / orders / reminders → solo admin (el público usa las RPC)
drop policy if exists "customers: admin" on public.customers;
create policy "customers: admin" on public.customers for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "orders: admin" on public.orders;
create policy "orders: admin" on public.orders for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "reminders: admin" on public.reminders;
create policy "reminders: admin" on public.reminders for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- calendar_blocks
drop policy if exists "blocks: lectura pública" on public.calendar_blocks;
drop policy if exists "blocks: admin gestiona"  on public.calendar_blocks;
create policy "blocks: lectura pública" on public.calendar_blocks for select using (true);
create policy "blocks: admin gestiona" on public.calendar_blocks for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ─────────────────────────────────────────────────────────────────────
-- 12. STORAGE  (fotos y videos de productos / portada)
-- ─────────────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 52428800,
        array['image/jpeg','image/png','image/webp','image/avif','image/gif','video/mp4','video/webm','video/quicktime'])
on conflict (id) do update set public = true;

drop policy if exists "media: lectura pública" on storage.objects;
drop policy if exists "media: admin sube"      on storage.objects;
drop policy if exists "media: admin edita"     on storage.objects;
drop policy if exists "media: admin borra"     on storage.objects;
create policy "media: lectura pública" on storage.objects for select using (bucket_id = 'media');
create policy "media: admin sube"  on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and public.is_admin());
create policy "media: admin edita" on storage.objects for update to authenticated
  using (bucket_id = 'media' and public.is_admin());
create policy "media: admin borra" on storage.objects for delete to authenticated
  using (bucket_id = 'media' and public.is_admin());

-- ─────────────────────────────────────────────────────────────────────
-- 13. TU ACCESO DE ADMINISTRADOR
--     a) Crea tu usuario en Authentication → Users → "Add user" (email + contraseña)
--     b) Cambia el correo de abajo por ese mismo correo y ejecuta esta línea:
-- ─────────────────────────────────────────────────────────────────────
-- insert into public.admins (email) values ('TU_CORREO@gmail.com') on conflict do nothing;
