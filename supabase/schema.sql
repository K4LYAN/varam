-- Enable Row Level Security (RLS) on your instance
alter table if exists public.orders enable row level security;

-- 1. Create Orders Table
create table public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete set null,
  total_amount decimal(10, 2) not null check (total_amount >= 0),
  
  -- Payment Integration Attributes
  payment_method text not null check (payment_method in ('prepaid_razorpay', 'cod')),
  payment_status text default 'pending' check (payment_status in ('pending', 'paid', 'failed')),
  razorpay_order_id text unique,
  razorpay_payment_id text unique,
  
  -- Logistics Tracking Attributes
  shipping_address jsonb not null,
  delhivery_awb text unique,
  delhivery_status text default 'pending_manifest' check (delhivery_status in ('pending_manifest', 'manifested', 'in_transit', 'out_for_delivery', 'delivered', 'rto')),
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Row Level Security Authorization Rule
create policy "Users can only view their own orders."
  on public.orders for select
  using ( auth.uid() = user_id );

-- 3. High Performance Indexes for Quick Dashboards
create index idx_orders_user_id on public.orders(user_id);
create index idx_orders_razorpay_id on public.orders(razorpay_order_id);
