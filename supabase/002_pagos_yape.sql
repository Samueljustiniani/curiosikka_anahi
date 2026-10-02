-- ╔══════════════════════════════════════════════════════════════════╗
-- ║  CURIOSIIKA · Actualización 2: pagos con Yape + precios editables ║
-- ║  Pégalo en Supabase → SQL Editor → New query → Run (una vez).    ║
-- ║  Es seguro volver a ejecutarlo.                                   ║
-- ╚══════════════════════════════════════════════════════════════════╝

-- Datos de Yape que verá el cliente al separar
alter table public.settings add column if not exists yape_number     text;
alter table public.settings add column if not exists yape_name       text;
alter table public.settings add column if not exists yape_qr_url     text;
alter table public.settings add column if not exists deposit_percent int not null default 50; -- % de adelanto para separar
do $$ begin
  alter table public.settings add constraint settings_deposit_percent_chk check (deposit_percent between 0 and 100);
exception when duplicate_object then null; end $$;

-- Cuánto pagó el cliente (lo registras en el panel)
alter table public.orders add column if not exists paid_amount numeric(10,2) not null default 0;
do $$ begin
  alter table public.orders add constraint orders_paid_amount_chk check (paid_amount >= 0);
exception when duplicate_object then null; end $$;

-- "Mi pedido" ahora también muestra lo pagado
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

revoke all on function public.track_order(text,text) from public;
grant execute on function public.track_order(text,text) to anon, authenticated;
