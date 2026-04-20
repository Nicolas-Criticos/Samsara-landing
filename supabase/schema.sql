-- Samsara Olive Oil: Orders table
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)

create table public.orders (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  status text default 'pending',
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  delivery_address text not null,
  delivery_city text not null,
  delivery_province text not null,
  delivery_postal_code text not null,
  items jsonb not null,
  subtotal numeric not null,
  delivery_fee numeric default 100,
  total numeric not null,
  payfast_payment_id text,
  notes text
);

-- Enable Row Level Security
alter table public.orders enable row level security;

-- Customers can insert orders (anon)
create policy "Allow anon insert" on public.orders
  for insert to anon with check (true);

-- Only service_role (your dashboard / backend) can read orders
create policy "Service role read" on public.orders
  for select using (auth.role() = 'service_role');
