create extension if not exists "pgcrypto";

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  image_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category_id uuid references public.categories(id) on delete set null,
  description text,
  ingredients jsonb default '[]'::jsonb,
  allergens jsonb default '[]'::jsonb,
  price numeric(10,2) not null default 0,
  badge text,
  featured boolean not null default false,
  image_url text,
  stock_status text,
  prep_time text,
  created_at timestamptz not null default now()
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  last_name text,
  email text,
  phone text,
  address text,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  customer_id uuid references public.customers(id) on delete set null,
  status text not null default 'pending_payment',
  delivery_type text default 'pickup',
  delivery_date date,
  delivery_time text,
  subtotal numeric(10,2) not null default 0,
  discount numeric(10,2) not null default 0,
  shipping numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  payment_type text default 'partial',
  payment_status text default 'unpaid',
  notes text,
  reference_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  quantity integer not null default 1,
  unit_price numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade,
  provider text not null default 'manual',
  payment_method text not null default 'webpay',
  amount numeric(10,2) not null default 0,
  status text not null default 'pending',
  proof_url text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.schedule_blocks (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  slot_start text not null,
  slot_end text not null,
  capacity integer not null default 1,
  is_blocked boolean not null default false,
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  role text not null default 'admin',
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

drop policy if exists admin_users_select_self on public.admin_users;
create policy admin_users_select_self
  on public.admin_users
  for select
  to authenticated
  using (lower(email) = lower((select auth.jwt() ->> 'email')));

create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_orders_customer on public.orders(customer_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_orders_created_at on public.orders(created_at desc);
create index if not exists idx_orders_status_created_at on public.orders(status, created_at desc);
create index if not exists idx_payments_order on public.payments(order_id);
create index if not exists idx_schedule_date on public.schedule_blocks(date);
