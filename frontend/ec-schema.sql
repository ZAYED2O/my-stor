-- EnterpriseCommerce Schema
-- Run this in the Supabase SQL Editor
-- Using "ec_" prefix to avoid conflicts with zayed-express-market tables

-- 1. Users table
CREATE TABLE IF NOT EXISTS ec_users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer',
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Products table
CREATE TABLE IF NOT EXISTS ec_products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  category TEXT NOT NULL,
  image TEXT DEFAULT '📦',
  seller TEXT DEFAULT 'ZAYED EXPRESS',
  rating REAL DEFAULT 5.0,
  "acceptedPayments" TEXT DEFAULT '["card","cod","wallet"]',
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Orders table
CREATE TABLE IF NOT EXISTS ec_orders (
  id TEXT PRIMARY KEY,
  "customerName" TEXT NOT NULL DEFAULT 'Guest',
  "customerEmail" TEXT NOT NULL DEFAULT 'guest@example.com',
  "customerAddress" TEXT DEFAULT '',
  items TEXT NOT NULL,
  total REAL NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending',
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Support Tickets table
CREATE TABLE IF NOT EXISTS ec_tickets (
  id TEXT PRIMARY KEY,
  "customerEmail" TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  reply TEXT,
  status TEXT NOT NULL DEFAULT 'Open',
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Chat Channels table (for live support chat)
CREATE TABLE IF NOT EXISTS ec_chat_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  subject TEXT,
  creator_id TEXT NOT NULL,
  participant_id TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Chat Messages table
CREATE TABLE IF NOT EXISTS ec_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES ec_chat_channels(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  sender_role TEXT NOT NULL,
  message TEXT,
  audio_data TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed admin user (password: admin123)
INSERT INTO ec_users (id, name, email, password, role)
VALUES (
  'admin-001',
  'مدير النظام',
  'admin@zayed.com',
  '$2b$10$t1SYmazDjcnrOCNVtYh.qOmMVcdzADfvguYU1maMCK3PBGOpunU7.',
  'super_admin'
) ON CONFLICT (id) DO NOTHING;

-- Seed initial products
INSERT INTO ec_products (id, name, price, category, image, seller, rating, "acceptedPayments")
VALUES
  ('prod-1', 'Premium Wireless Headphones', 299.99, 'Electronics', '🎧', 'Tech Store', 4.8, '["card","cod","wallet"]'),
  ('prod-2', 'Minimalist Smartwatch', 199.50, 'Accessories', '⌚', 'Watch Co.', 4.5, '["card","cod","wallet"]'),
  ('prod-3', 'Ergonomic Office Chair', 450.00, 'Furniture', '🪑', 'FurnishNow', 4.9, '["card"]'),
  ('prod-4', 'Mechanical Keyboard', 149.99, 'Electronics', '⌨️', 'Tech Store', 4.7, '["card","cod","wallet"]'),
  ('prod-5', 'Running Sneakers Pro', 89.99, 'Sports', '👟', 'SportZone', 4.6, '["card","cod","wallet"]')
ON CONFLICT (id) DO NOTHING;
