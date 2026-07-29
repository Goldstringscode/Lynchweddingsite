-- Wedding Planner Dashboard - Supabase Schema
-- Paste this into Supabase SQL Editor and run it

-- 1. Guests (RSVP management)
CREATE TABLE guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  guest_count INTEGER NOT NULL DEFAULT 1,
  is_attending BOOLEAN NOT NULL DEFAULT false,
  check_in BOOLEAN NOT NULL DEFAULT false,
  check_in_at TIMESTAMPTZ,
  access_code TEXT UNIQUE NOT NULL,
  meal_choice TEXT,
  guest_meal TEXT,
  dietary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Vendors
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  contact TEXT,
  phone TEXT,
  email TEXT,
  fee DECIMAL(10,2),
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Invoices
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  due_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Vendor Deadlines
CREATE TABLE vendor_deadlines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor TEXT NOT NULL,
  task TEXT NOT NULL,
  due_date TIMESTAMPTZ NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Wedding Settings (single row)
CREATE TABLE wedding_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  groom_name TEXT NOT NULL DEFAULT 'Groom',
  bride_name TEXT NOT NULL DEFAULT 'Bride',
  date TIMESTAMPTZ,
  venue TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed data: 11 guests (no parties larger than 2)
INSERT INTO guests (name, email, phone, guest_count, is_attending, check_in, access_code, meal_choice, guest_meal) VALUES
  ('John Smith', 'john@example.com', '555-0101', 2, true, false, 'RSVP-001', 'Beef', 'Chicken'),
  ('Sarah Johnson', 'sarah@example.com', '555-0102', 1, true, true, 'RSVP-002', 'Fish', NULL),
  ('Emily Davis', 'emily@example.com', '555-0104', 2, false, false, 'RSVP-004', NULL, NULL),
  ('James Wilson', 'james@example.com', '555-0105', 1, true, false, 'RSVP-005', 'Beef', NULL),
  ('Jessica Taylor', 'jessica@example.com', '555-0106', 2, true, false, 'RSVP-006', 'Chicken', 'Vegan'),
  ('Ashley Thomas', 'ashley@example.com', '555-0108', 1, false, false, 'RSVP-008', NULL, NULL),
  ('Christopher Jackson', 'chris@example.com', '555-0109', 2, true, false, 'RSVP-009', 'Pork', 'Beef'),
  ('Daniel Harris', 'daniel@example.com', '555-0111', 1, true, false, 'RSVP-011', 'Vegan', NULL),
  ('Stephanie Martin', 'stephanie@example.com', '555-0112', 2, false, false, 'RSVP-012', NULL, NULL),
  ('Nicole Robinson', 'nicole@example.com', '555-0114', 1, true, false, 'RSVP-014', 'Fish', NULL),
  ('Ryan Clark', 'ryan@example.com', '555-0115', 2, true, false, 'RSVP-015', 'Beef', 'Pork');

-- Seed vendors
INSERT INTO vendors (name, category, contact, phone, email, fee, status) VALUES
  ('Elegant Events Catering', 'Catering', 'Maria Garcia', '555-0201', 'maria@elegantcatering.com', 8500.00, 'confirmed'),
  ('Bloom Florals', 'Floral', 'Lisa Bloom', '555-0202', 'lisa@bloomflorals.com', 3200.00, 'confirmed'),
  ('Golden Hour Photography', 'Photography', 'David Light', '555-0203', 'david@goldenhourphoto.com', 4500.00, 'confirmed'),
  ('DJ Rhythm', 'Entertainment', 'DJ Mike', '555-0204', 'mike@djrhythm.com', 1800.00, 'pending'),
  ('Heavenly Cakes Bakery', 'Cake', 'Susan Baker', '555-0205', 'susan@heavenlycakes.com', 950.00, 'confirmed'),
  ('Premier Rentals', 'Rentals', 'Tom Walker', '555-0206', 'tom@premierrentals.com', 4200.00, 'pending'),
  ('Harmony String Quartet', 'Music', 'Anne Harmony', '555-0207', 'anne@harmonyquartet.com', 2200.00, 'confirmed'),
  ('Luxury Limousine Service', 'Transportation', 'Robert Driver', '555-0208', 'robert@luxurylimo.com', 2800.00, 'pending');

-- Seed invoices
INSERT INTO invoices (vendor, amount, due_date, status) VALUES
  ('Elegant Events Catering', 4250.00, '2026-08-01 00:00:00+00', 'paid'),
  ('Elegant Events Catering', 4250.00, '2026-09-01 00:00:00+00', 'pending'),
  ('Bloom Florals', 3200.00, '2026-08-15 00:00:00+00', 'pending'),
  ('Golden Hour Photography', 2250.00, '2026-08-01 00:00:00+00', 'paid'),
  ('Golden Hour Photography', 2250.00, '2026-09-01 00:00:00+00', 'pending'),
  ('DJ Rhythm', 1800.00, '2026-08-20 00:00:00+00', 'pending'),
  ('Heavenly Cakes Bakery', 950.00, '2026-08-10 00:00:00+00', 'paid');

-- Seed deadlines
INSERT INTO vendor_deadlines (vendor, task, due_date, completed) VALUES
  ('Elegant Events Catering', 'Final menu selection', '2026-08-01 00:00:00+00', true),
  ('Elegant Events Catering', 'Head count confirmation', '2026-08-15 00:00:00+00', false),
  ('Bloom Florals', 'Bouquet design approval', '2026-08-05 00:00:00+00', true),
  ('Golden Hour Photography', 'Wedding day timeline review', '2026-08-10 00:00:00+00', false),
  ('DJ Rhythm', 'Playlist submission', '2026-08-20 00:00:00+00', false),
  ('Heavenly Cakes Bakery', 'Final cake tasting', '2026-08-01 00:00:00+00', true),
  ('Premier Rentals', 'Equipment list finalization', '2026-08-25 00:00:00+00', false),
  ('Harmony String Quartet', 'Song selection', '2026-08-15 00:00:00+00', false);

-- Seed wedding settings
INSERT INTO wedding_settings (id, groom_name, bride_name, date, venue)
VALUES ('default', 'Justin', 'Jessica', '2026-09-15 16:00:00+00', 'The Grand Ballroom');