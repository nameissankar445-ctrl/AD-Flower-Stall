-- AD Flower Stall — full schema. Run once in Supabase → SQL Editor (after admin_users.sql, or standalone: it is idempotent).
-- Tables: admin_users, categories, products, orders, order_items, quote_requests, enquiries,
--         whatsapp_leads, analytics_events, subscribers, site_settings. Buckets: products.

-- ---------- Admin ----------
create table if not exists public.admin_users (
  user_id   uuid primary key references auth.users on delete cascade,
  email     text,
  full_name text,
  role      text not null default 'admin'
);
alter table public.admin_users enable row level security;
drop policy if exists "read own admin row" on public.admin_users;
create policy "read own admin row" on public.admin_users for select to authenticated using (user_id = auth.uid());
create or replace function public.is_admin() returns boolean
language sql security definer set search_path = public stable as $$
  select exists (select 1 from public.admin_users where user_id = auth.uid());
$$;
drop policy if exists "admin manage admins" on public.admin_users;
create policy "admin manage admins" on public.admin_users for all to authenticated using (is_admin()) with check (is_admin());

create or replace function public.set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- ---------- Catalogue ----------
create table if not exists public.categories (
  id serial primary key, name text not null, slug text unique not null, sort_order int default 0, active boolean default true
);
create table if not exists public.products (
  id serial primary key,
  name text not null, slug text unique not null,
  category_id int references public.categories(id),
  unit text not null,                  -- 'Per kg', 'Bunch of 10', 'Per metre' ...
  price numeric(10,2) not null,
  sale_price numeric(10,2),
  description text,
  image_key text,                      -- assets/img/south/<image_key>.jpg
  image_url text,                      -- optional storage URL (overrides image_key)
  stock_status text not null default 'in_stock' check (stock_status in ('in_stock','low','out_of_stock')),
  is_featured boolean default false, active boolean default true, sort_order int default 0,
  created_at timestamptz default now(), updated_at timestamptz default now()
);
drop trigger if exists trg_products_updated on public.products;
create trigger trg_products_updated before update on public.products for each row execute function set_updated_at();

-- ---------- Orders (cart → WhatsApp) ----------
create sequence if not exists public.order_seq;
create or replace function public.gen_order_number() returns text language sql as $$
  select 'ADF-' || to_char(now() at time zone 'Asia/Kolkata','YYMMDD') || '-' || lpad(nextval('public.order_seq')::text, 4, '0');
$$;
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null default public.gen_order_number(),
  customer_name text, phone text, delivery_type text default 'pickup' check (delivery_type in ('pickup','delivery')),
  address text, needed_on date, note text,
  subtotal numeric(10,2) not null default 0, delivery_charge numeric(10,2) default 0, total numeric(10,2) not null default 0,
  status text not null default 'new' check (status in ('new','confirmed','preparing','ready','delivered','cancelled')),
  whatsapp_lead_id uuid, admin_notes text,
  created_at timestamptz default now(), updated_at timestamptz default now()
);
create table if not exists public.order_items (
  id serial primary key,
  order_id uuid references public.orders(id) on delete cascade,
  product_id int references public.products(id),
  product_name text not null, unit text, unit_price numeric(10,2) not null, qty numeric(10,2) not null, line_total numeric(10,2) not null
);
drop trigger if exists trg_orders_updated on public.orders;
create trigger trg_orders_updated before update on public.orders for each row execute function set_updated_at();

-- ---------- Quote requests (wedding / puja form) & contact enquiries ----------
create table if not exists public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null, phone text, event_date date, occasion text, message text,
  status text not null default 'new' check (status in ('new','quoted','won','lost','closed')),
  quote_amount numeric(10,2), whatsapp_lead_id uuid, admin_notes text,
  created_at timestamptz default now(), updated_at timestamptz default now()
);
drop trigger if exists trg_quotes_updated on public.quote_requests;
create trigger trg_quotes_updated before update on public.quote_requests for each row execute function set_updated_at();

create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  name text not null, phone text, email text, subject text, message text not null,
  status text not null default 'new' check (status in ('new','replied','closed')),
  whatsapp_lead_id uuid, admin_notes text,
  created_at timestamptz default now(), updated_at timestamptz default now()
);
drop trigger if exists trg_enquiries_updated on public.enquiries;
create trigger trg_enquiries_updated before update on public.enquiries for each row execute function set_updated_at();

-- ---------- WhatsApp lead tracking ----------
create sequence if not exists public.wa_ref_seq;
create table if not exists public.whatsapp_leads (
  id uuid primary key default gen_random_uuid(),
  ref_code text unique not null default ('WA-' || lpad(nextval('public.wa_ref_seq')::text, 5, '0')),
  created_at timestamptz default now(),
  name text, phone text,
  source text not null,                -- hero | product | cart | quote | occasion | visit | float | footer | header
  intent text not null default 'order' check (intent in ('order','quote','question','track','other')),
  product_id int references public.products(id), order_id uuid references public.orders(id),
  page_path text, message_sent text,
  utm_source text, utm_medium text, utm_campaign text, device text, session_id text,
  status text not null default 'new' check (status in ('new','replied','converted','no_response','spam')),
  first_reply_at timestamptz, replied_by text, notes text, follow_up_at timestamptz
);
create index if not exists idx_wa_leads_status on public.whatsapp_leads(status, created_at desc);
create index if not exists idx_wa_leads_phone on public.whatsapp_leads(phone);

-- Phase 2: WhatsApp Business Cloud API conversations (populated by the webhook Edge Function)
create table if not exists public.whatsapp_conversations (
  id uuid primary key default gen_random_uuid(),
  phone text unique not null, customer_name text, lead_id uuid references public.whatsapp_leads(id),
  last_message_at timestamptz, last_direction text check (last_direction in ('in','out')),
  unread_count int default 0, status text default 'open' check (status in ('open','closed'))
);
create table if not exists public.whatsapp_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.whatsapp_conversations(id) on delete cascade,
  wa_message_id text unique, direction text not null check (direction in ('in','out')),
  body text, media_url text, type text default 'text',
  status text default 'sent' check (status in ('sent','delivered','read','failed','received')),
  sent_by text, ts timestamptz default now()
);

-- ---------- Analytics events ----------
create table if not exists public.analytics_events (
  id bigserial primary key,
  created_at timestamptz default now(),
  session_id text, event text not null,  -- page_view | product_view | add_to_cart | remove_from_cart | search | whatsapp_click | form_submit | order_placed
  page_path text, product_id int, category text, value numeric, meta jsonb,
  referrer text, utm_source text, utm_medium text, utm_campaign text, device text
);
create index if not exists idx_events_time on public.analytics_events(created_at desc);
create index if not exists idx_events_event on public.analytics_events(event, created_at desc);

-- ---------- Subscribers & settings ----------
create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(), phone text, email text, status text default 'active' check (status in ('active','unsubscribed')),
  created_at timestamptz default now()
);
create table if not exists public.site_settings (key text primary key, value jsonb not null, updated_at timestamptz default now());

-- ---------- RLS ----------
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.quote_requests enable row level security;
alter table public.enquiries enable row level security;
alter table public.whatsapp_leads enable row level security;
alter table public.whatsapp_conversations enable row level security;
alter table public.whatsapp_messages enable row level security;
alter table public.analytics_events enable row level security;
alter table public.subscribers enable row level security;
alter table public.site_settings enable row level security;

-- public read of catalogue & settings
drop policy if exists "public read" on public.categories;   create policy "public read" on public.categories for select using (active);
drop policy if exists "public read" on public.products;     create policy "public read" on public.products for select using (active);
drop policy if exists "public read" on public.site_settings; create policy "public read" on public.site_settings for select using (true);
-- public submit
drop policy if exists "public insert" on public.orders;          create policy "public insert" on public.orders for insert to anon, authenticated with check (status = 'new');
drop policy if exists "public insert" on public.order_items;     create policy "public insert" on public.order_items for insert to anon, authenticated with check (true);
drop policy if exists "public insert" on public.quote_requests;  create policy "public insert" on public.quote_requests for insert to anon, authenticated with check (status = 'new' and char_length(name) <= 200);
drop policy if exists "public insert" on public.enquiries;       create policy "public insert" on public.enquiries for insert to anon, authenticated with check (status = 'new' and char_length(message) <= 5000);
drop policy if exists "public insert" on public.whatsapp_leads;  create policy "public insert" on public.whatsapp_leads for insert to anon, authenticated with check (status = 'new');
drop policy if exists "public insert" on public.analytics_events; create policy "public insert" on public.analytics_events for insert to anon, authenticated with check (true);
drop policy if exists "public insert" on public.subscribers;     create policy "public insert" on public.subscribers for insert to anon, authenticated with check (true);
-- admin everything
do $$ declare t text; begin
  foreach t in array array['categories','products','orders','order_items','quote_requests','enquiries','whatsapp_leads','whatsapp_conversations','whatsapp_messages','analytics_events','subscribers','site_settings'] loop
    execute format('drop policy if exists "admin all" on public.%I', t);
    execute format('create policy "admin all" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop; end $$;

-- Order tracking for customers: only via this function (phone + order number), never a blanket select
create or replace function public.track_order(p_phone text, p_order_number text)
returns table (order_number text, status text, needed_on date, total numeric, created_at timestamptz)
language sql security definer set search_path = public stable as $$
  select o.order_number, o.status, o.needed_on, o.total, o.created_at
  from public.orders o where o.order_number = upper(p_order_number) and right(regexp_replace(o.phone,'\D','','g'),10) = right(regexp_replace(p_phone,'\D','','g'),10);
$$;
grant execute on function public.track_order(text, text) to anon, authenticated;

-- ---------- Storage ----------
insert into storage.buckets (id, name, public) values ('products','products', true) on conflict (id) do nothing;
drop policy if exists "public read products" on storage.objects;  create policy "public read products" on storage.objects for select using (bucket_id = 'products');
drop policy if exists "admin write products" on storage.objects;  create policy "admin write products" on storage.objects for all to authenticated using (bucket_id = 'products' and public.is_admin()) with check (bucket_id = 'products' and public.is_admin());

-- ---------- Analytics helpers for the admin ----------
create or replace view public.v_daily_metrics as
  select date(created_at at time zone 'Asia/Kolkata') as day,
         count(*) filter (where event='page_view') as page_views,
         count(distinct session_id) filter (where event='page_view') as visitors,
         count(*) filter (where event='product_view') as product_views,
         count(*) filter (where event='add_to_cart') as add_to_cart,
         count(*) filter (where event='whatsapp_click') as whatsapp_clicks,
         count(*) filter (where event='order_placed') as orders
  from public.analytics_events group by 1 order by 1 desc;
create or replace view public.v_leads_by_source as
  select source, intent, count(*) as leads, count(*) filter (where status='replied' or status='converted') as replied,
         round(avg(extract(epoch from (first_reply_at - created_at))/60)::numeric,1) as avg_reply_minutes
  from public.whatsapp_leads group by 1,2 order by leads desc;
create or replace view public.v_hourly_heatmap as
  select extract(dow from created_at at time zone 'Asia/Kolkata')::int as dow, extract(hour from created_at at time zone 'Asia/Kolkata')::int as hour, count(*) as clicks
  from public.whatsapp_leads group by 1,2;
create or replace view public.v_customers as
  select right(regexp_replace(phone,'\D','','g'),10) as phone10, max(name) as name,
         count(*) as whatsapp_leads, min(created_at) as first_seen, max(created_at) as last_seen
  from public.whatsapp_leads where phone is not null group by 1;

-- ---------- Seed ----------
insert into public.categories (name, slug, sort_order) values
 ('Marigold','marigold',1),('Chamanthi','chamanthi',2),('Rose','rose',3),('Jasmine','jasmine',4),('Puja','puja',5)
on conflict (slug) do nothing;

insert into public.products (name, slug, category_id, unit, price, description, image_key, sort_order) values
 ('Orange Marigold (Banthi)','orange-marigold',(select id from categories where slug='marigold'),'Per kg, loose',120,'Bright orange marigold sold loose by weight — for puja, garlands and decoration.','marigold-orange',1),
 ('Marigold Garland','marigold-garland',(select id from categories where slug='marigold'),'Per metre',60,'Fresh marigold garland sold by the metre — for doors, vehicles, puja and functions.','marigold-garlands',2),
 ('Sent Yellow Chamanthi','yellow-chamanthi',(select id from categories where slug='chamanthi'),'Per kg',160,'Sent yellow chamanthi (chrysanthemum) blooms, popular for puja, garlands and décor.','chamanthi-yellow',3),
 ('Milky White Chamanthi (Calcutta)','white-chamanthi',(select id from categories where slug='chamanthi'),'Per kg',200,'Clean milky white chamanthi (Calcutta) for garlands and decoration.','chamanthi-white',4),
 ('Violet Chamanthi','violet-chamanthi',(select id from categories where slug='chamanthi'),'Per kg',220,'Violet chamanthi blooms that add colour to garlands and arrangements.','chamanthi-violet',5),
 ('Red Rose','red-rose',(select id from categories where slug='rose'),'Bunch of 10',120,'Fresh red roses for garlands, gifting and decoration.','rose-red',6),
 ('Pink Rose','pink-rose',(select id from categories where slug='rose'),'Bunch of 10',150,'Soft pink roses, fresh and fragrant.','rose-pink',7),
 ('Rose Petals','rose-petals',(select id from categories where slug='rose'),'Per 100 g',40,'Loose fresh rose petals for puja, decoration and rituals.','rose-petals',8),
 ('Jasmine Buds (Malle)','jasmine-buds',(select id from categories where slug='jasmine'),'Per 100 g',60,'Fresh jasmine (malle) buds that turn fragrant by evening — for puja and hair.','jasmine-flower',9),
 ('Jasmine Strings','jasmine-strings',(select id from categories where slug='jasmine'),'Per hand',40,'Jasmine strings tied fresh every morning.','jasmine-strand',10),
 ('Lotus (Padmam)','lotus',(select id from categories where slug='puja'),'Per piece',25,'Fresh lotus (padmam) for puja and temple offerings.','lotus-pink',11),
 ('Red Hibiscus','red-hibiscus',(select id from categories where slug='puja'),'Bunch of 25',30,'Fresh red hibiscus flowers for daily puja.','hibiscus-red',12),
 ('Kanakambaram','kanakambaram',(select id from categories where slug='puja'),'Per string',35,'Orange kanakambaram strings — a favourite for puja and festive hair décor.','kanakambaram',13)
on conflict (slug) do nothing;

insert into public.site_settings (key, value) values
 ('business', '{"name":"AD Flower Stall","phone":"+91 99491 79933","whatsapp":"919949179933","address":"Shop No: 4, AD Flower Stall, Rythu Bazar, near NTR Bus Stand, Coastal Andhra Region, Thamma Ranga Reddy Nagar, Guntur, Andhra Pradesh 522001","hours":"Every day · 5:00 AM – 9:00 PM"}'),
 ('whatsapp', '{"mode":"link","capture_name_before_chat":true,"overdue_minutes":30,"greeting":"Hello AD Flower Stall, I would like to order flowers."}'),
 ('delivery', '{"enabled":true,"areas":["Guntur city"],"charge":0,"minimum_order":0}')
on conflict (key) do nothing;

-- ---------- API role privileges (needed because the project has 'auto expose tables' off) ----------
grant usage on schema public to anon, authenticated;
grant select on public.categories, public.products, public.site_settings to anon, authenticated;
grant insert on public.orders, public.order_items, public.quote_requests, public.enquiries, public.whatsapp_leads, public.analytics_events, public.subscribers to anon, authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;
grant all on all tables in schema public to authenticated;   -- admins; RLS still restricts non-admins
grant select on public.v_daily_metrics, public.v_leads_by_source, public.v_hourly_heatmap, public.v_customers to authenticated;
alter default privileges in schema public grant all on tables to authenticated;
alter default privileges in schema public grant usage, select on sequences to anon, authenticated;

-- ---------- Admin login ----------
-- After creating the user in Authentication → Users:
-- insert into public.admin_users (user_id, email, full_name, role)
-- select id, email, 'Sankar', 'admin' from auth.users where lower(email) = 'admin@adflowerstall.com' on conflict (user_id) do nothing;
