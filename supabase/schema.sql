-- ============================================================
-- Varam E-commerce Production Database Schema (schema.sql)
-- ============================================================

-- ─── 1. Profiles Table (Secure RBAC) ─────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_admin    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 2. Products Table ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.products (
  id          BIGSERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  price       INTEGER NOT NULL CHECK (price > 0),
  volume      TEXT NOT NULL,
  category    TEXT NOT NULL,
  description TEXT NOT NULL,
  image       TEXT NOT NULL DEFAULT '/images/groundnut_oil.png',
  image_color TEXT NOT NULL DEFAULT 'bg-[#F3E5AB]',
  accent_color TEXT NOT NULL DEFAULT 'text-[#8B5A2B]',
  benefits    TEXT[] NOT NULL DEFAULT '{}',
  in_stock    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 3. Orders Table ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.orders (
  id                  TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id             UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email          TEXT,
  total_amount        INTEGER NOT NULL CHECK (total_amount > 0),
  payment_method      TEXT NOT NULL DEFAULT 'prepaid_razorpay',
  payment_status      TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','failed','refunded')),
  fulfillment_status  TEXT NOT NULL DEFAULT 'Processing' CHECK (fulfillment_status IN ('Processing','Confirmed','Shipped','Out for Delivery','Delivered','Cancelled')),
  shipping_address    JSONB NOT NULL DEFAULT '{}',
  items               JSONB NOT NULL DEFAULT '[]',
  razorpay_order_id   TEXT,
  razorpay_payment_id TEXT,
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 4. Support Tickets Table ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email  TEXT NOT NULL,
  user_name   TEXT NOT NULL,
  subject     TEXT NOT NULL,
  message     TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','in_progress','resolved','closed')),
  priority    TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
  admin_reply TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 5. Site Settings Table ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.site_settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 6. Enable Row Level Security (RLS) ───────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- ─── 7. Security Policies (RLS Rules) ─────────────────────────

-- Profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (TRUE);

-- Products
DROP POLICY IF EXISTS "Anyone can read products" ON public.products;
CREATE POLICY "Anyone can read products" ON public.products FOR SELECT USING (TRUE);

-- Orders
DROP POLICY IF EXISTS "Users see own orders" ON public.orders;
DROP POLICY IF EXISTS "Users insert own orders" ON public.orders;
CREATE POLICY "Users see own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Support Tickets
DROP POLICY IF EXISTS "Anyone can submit tickets" ON public.support_tickets;
DROP POLICY IF EXISTS "Users see own tickets" ON public.support_tickets;
CREATE POLICY "Anyone can submit tickets" ON public.support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users see own tickets" ON public.support_tickets FOR SELECT USING (auth.uid() = user_id);

-- Site Settings
DROP POLICY IF EXISTS "Anyone can read settings" ON public.site_settings;
CREATE POLICY "Anyone can read settings" ON public.site_settings FOR SELECT USING (TRUE);

-- ─── 8. SQL Grant Permissions ─────────────────────────────────
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT ON public.profiles, public.products, public.site_settings TO anon, authenticated;
GRANT SELECT, INSERT ON public.orders, public.support_tickets TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- ─── 9. High-Performance Indexes ──────────────────────────────
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);

-- ─── 10. Automatic User Registration Triggers ─────────────────

-- Create profile row on auth sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, is_admin)
  VALUES (
    new.id,
    COALESCE((new.raw_user_meta_data->>'is_admin')::boolean, false)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Synchronize & secure user updates (preventing privilege escalation)
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
DECLARE
  current_is_admin BOOLEAN;
  new_is_admin BOOLEAN;
  is_superuser BOOLEAN;
BEGIN
  -- Get existing admin status from profiles
  SELECT is_admin INTO current_is_admin FROM public.profiles WHERE id = new.id;
  current_is_admin := COALESCE(current_is_admin, false);

  -- Get requested admin status
  new_is_admin := COALESCE((new.raw_user_meta_data->>'is_admin')::boolean, false);

  -- Check if current role is service_role
  is_superuser := (current_setting('role', true) = 'service_role');

  -- Prevent users from self-elevating admin status in client SDK
  IF new_is_admin = TRUE AND current_is_admin = FALSE AND NOT is_superuser THEN
    new.raw_user_meta_data := jsonb_set(new.raw_user_meta_data, '{is_admin}', 'false'::jsonb);
    new_is_admin := FALSE;
  END IF;

  -- Upsert profile row
  INSERT INTO public.profiles (id, is_admin)
  VALUES (new.id, new_is_admin)
  ON CONFLICT (id) DO UPDATE
  SET is_admin = new_is_admin,
      updated_at = NOW();

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_user_update();

-- ─── 11. Storage Bucket for Products ────────────────────────────
-- Create a public storage bucket for product images if it does not exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Storage object policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'products');

DROP POLICY IF EXISTS "Admin Upload" ON storage.objects;
CREATE POLICY "Admin Upload" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (
    bucket_id = 'products' AND 
    (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true))
  );

DROP POLICY IF EXISTS "Admin Update" ON storage.objects;
CREATE POLICY "Admin Update" ON storage.objects
  FOR UPDATE TO authenticated WITH CHECK (
    bucket_id = 'products' AND 
    (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true))
  );

DROP POLICY IF EXISTS "Admin Delete" ON storage.objects;
CREATE POLICY "Admin Delete" ON storage.objects
  FOR DELETE TO authenticated USING (
    bucket_id = 'products' AND 
    (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true))
  );
