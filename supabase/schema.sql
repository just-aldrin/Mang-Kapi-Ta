-- Mang KAPI Ta: database schema.
-- Run this once in the SQL Editor of the NEW Supabase project created for this shop.
-- Do not run it on any other project.

create table if not exists public.orders (
  id           bigint generated always as identity primary key,
  ref          text not null unique,
  access_key   text not null,
  name         text not null check (char_length(name) between 1 and 100),
  phone        text not null,
  email        text not null,
  order_type   text not null check (order_type in ('pickup', 'dine-in')),
  notes        text,
  total        integer not null check (total > 0),            -- centavos
  status       text not null default 'pending'
                 check (status in ('pending', 'paid', 'failed', 'fulfilled')),
  provider     text,
  provider_ref text,
  created_at   timestamptz not null default now(),
  paid_at      timestamptz
);

create table if not exists public.order_items (
  id           bigint generated always as identity primary key,
  order_id     bigint not null references public.orders (id) on delete cascade,
  product_slug text not null,
  name         text not null,
  price        integer not null check (price > 0),             -- centavos
  qty          integer not null check (qty between 1 and 20)
);

create table if not exists public.inquiries (
  id         bigint generated always as identity primary key,
  name       text not null,
  event_date date not null,
  guests     text not null,
  contact    text not null,
  venue      text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.subscribers (
  id         bigint generated always as identity primary key,
  email      text not null unique,
  created_at timestamptz not null default now()
);

create index if not exists orders_provider_ref_idx on public.orders (provider_ref);
create index if not exists order_items_order_id_idx on public.order_items (order_id);

-- Lock everything down. Only the server (service-role key) may read or write these tables.
-- Row-level security with no policies denies the public anon and authenticated roles entirely.
alter table public.orders       enable row level security;
alter table public.order_items  enable row level security;
alter table public.inquiries    enable row level security;
alter table public.subscribers  enable row level security;

revoke all on public.orders, public.order_items, public.inquiries, public.subscribers from anon, authenticated;
