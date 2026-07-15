-- ============================================================
-- Varam Admin Schema Migration 001
-- Run this in the Supabase SQL Editor
-- ============================================================

-- ─── Products ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
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

-- Seed existing products
INSERT INTO products (name, price, volume, category, description, image, image_color, accent_color, benefits, in_stock)
VALUES
  ('Wood Pressed Groundnut Oil', 350, '1 Liter', 'Everyday Cooking', 'Extracted using traditional wooden ghani. Retains all natural nutrients and real peanut aroma. Perfect for deep frying.', '/images/groundnut_oil.png', 'bg-[#F3E5AB]', 'text-[#8B5A2B]', ARRAY['Rich in Vitamin E', 'Cholesterol Free'], TRUE),
  ('Wood Pressed Sesame Oil', 480, '1 Liter', 'Heritage Collection', 'Rich in antioxidants. Extracted from premium black sesame seeds with palm jaggery. Excellent for health and tradition.', '/images/sesame_oil.png', 'bg-[#E6D5C3]', 'text-[#5C4033]', ARRAY['Heart Healthy', 'Bone Strength'], TRUE),
  ('Cold Pressed Coconut Oil', 320, '1 Liter', 'Versatile Essential', 'Pure, unrefined, and unbleached. Made from sun-dried copra. Ideal for cooking, hair care, and skin nourishment.', '/images/coconut_oil.png', 'bg-[#F5F5F0]', 'text-[#4A5D23]', ARRAY['MCT Rich', 'Deep Moisturizing'], TRUE),
  ('Cold Pressed Mustard Oil', 280, '1 Liter', 'Robust Flavor', 'Strong, pungent flavor typical of authentic mustard oil. Cold pressed to preserve its natural pungency and health benefits.', '/images/mustard_oil.png', 'bg-[#FAD6A5]', 'text-[#B8860B]', ARRAY['Boosts Immunity', 'Improves Circulation'], TRUE),
  ('Cold Pressed Castor Oil', 250, '500 ml', 'Wellness & Care', 'Thick, nutrient-rich oil. Perfect for hair growth, skin moisturizing, and traditional wellness practices.', '/images/castor_oil.png', 'bg-[#E8E4C9]', 'text-[#6B8E23]', ARRAY['Promotes Hair Growth', 'Skin Healing'], TRUE),
  ('Sweet Almond Oil', 850, '250 ml', 'Premium Beauty', '100% pure sweet almond oil. Excellent for glowing skin, dark circles, and baby massage. Unrefined and pure.', '/images/almond_oil.png', 'bg-[#FAEBD7]', 'text-[#D2691E]', ARRAY['Reduces Dark Circles', 'Baby Safe'], TRUE)
ON CONFLICT DO NOTHING;

-- ─── Orders ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
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

-- ─── Support Tickets ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS support_tickets (
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

-- ─── Site Settings ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS site_settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default settings
INSERT INTO site_settings (key, value) VALUES
  ('business_name', 'Organic Varam Pvt Ltd.'),
  ('business_gstin', '29XXXXX1234X1ZX'),
  ('business_address', '123 Heritage Farm Road, Agriculture District, 500001'),
  ('business_email', 'support@varamorganics.com'),
  ('business_phone', '+91 98765 43210'),
  ('shipping_fee', '50'),
  ('free_shipping_threshold', '999'),
  ('announcement_enabled', 'false'),
  ('announcement_text', 'Free shipping on orders above ₹999!')
ON CONFLICT (key) DO NOTHING;

-- ─── Row Level Security ──────────────────────────────────────
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read products" ON products;
CREATE POLICY "Anyone can read products" ON products FOR SELECT USING (TRUE);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users see own orders" ON orders;
DROP POLICY IF EXISTS "Users insert own orders" ON orders;
CREATE POLICY "Users see own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can submit tickets" ON support_tickets;
DROP POLICY IF EXISTS "Users see own tickets" ON support_tickets;
CREATE POLICY "Anyone can submit tickets" ON support_tickets FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Users see own tickets" ON support_tickets FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read settings" ON site_settings;
CREATE POLICY "Anyone can read settings" ON site_settings FOR SELECT USING (TRUE);

-- ─── Updated_at trigger ──────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_tickets_updated_at ON support_tickets;
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON support_tickets FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_settings_updated_at ON site_settings;
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON site_settings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
