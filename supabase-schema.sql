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

-- 6. Wedding Checklist
CREATE TABLE wedding_checklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  task TEXT NOT NULL,
  description TEXT DEFAULT '',
  suggested_month INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE wedding_checklist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can do everything on wedding_checklist"
  ON wedding_checklist FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Seed: Wedding Checklist Categories & Tasks
-- Format: category, task, description, suggested_month (months before), sort_order

-- APPAREL
INSERT INTO wedding_checklist (category, task, description, suggested_month, sort_order) VALUES
('Apparel', 'Shop for wedding gown', 'Begin shopping 12-18 months ahead for custom/altered dresses', 12, 1),
('Apparel', 'Order wedding dress', 'Place your dress order to allow time for production and alterations', 10, 2),
('Apparel', 'Choose bridesmaid dresses', 'Select dresses and have bridesmaids order them', 9, 3),
('Apparel', 'Choose groom''s attire', 'Select tuxedo or suit for groom and groomsmen', 8, 4),
('Apparel', 'First dress fitting', 'First of 2-3 fittings for alterations', 3, 5),
('Apparel', 'Second dress fitting', 'Check fit after first round of alterations', 2, 6),
('Apparel', 'Final dress fitting', 'Final fitting and pick up dress', 1, 7),
('Apparel', 'Purchase bridal shoes', 'Find comfortable shoes for the big day', 4, 8),
('Apparel', 'Purchase wedding jewelry', 'Select accessories: necklace, earrings, bracelet', 3, 9),
('Apparel', 'Bridal headpiece/veil', 'Choose and order veil or headpiece', 4, 10),
('Apparel', 'Bridesmaids accessories', 'Coordinate accessories for bridesmaids', 3, 11),
('Apparel', 'Groomsmen attire', 'Coordinate tux/suit rentals or purchases for groomsmen', 4, 12),
('Apparel', 'Flower girl dress', 'Select and order flower girl attire', 4, 13),
('Apparel', 'Ring bearer outfit', 'Select ring bearer outfit', 4, 14),
('Apparel', 'Rehearsal dinner outfit', 'Choose outfit for rehearsal dinner', 2, 15),
('Apparel', 'Honeymoon wardrobe', 'Plan and pack honeymoon outfits', 1, 16);

-- STATIONERY
INSERT INTO wedding_checklist (category, task, description, suggested_month, sort_order) VALUES
('Stationery', 'Design save-the-dates', 'Choose design and wording for save-the-date cards', 10, 1),
('Stationery', 'Order save-the-dates', 'Place order and address envelopes', 9, 2),
('Stationery', 'Send save-the-dates', 'Mail save-the-dates 6-12 months before wedding', 9, 3),
('Stationery', 'Design wedding invitations', 'Select invitation suite design', 7, 4),
('Stationery', 'Order wedding invitations', 'Place invitation order (allow 4-6 weeks for printing)', 6, 5),
('Stationery', 'Address invitations', 'Address, stuff, and stamp all invitations', 5, 6),
('Stationery', 'Mail wedding invitations', 'Send invitations 6-8 weeks before wedding', 5, 7),
('Stationery', 'Order ceremony programs', 'Design and order programs for ceremony', 2, 8),
('Stationery', 'Order place cards', 'Design and order place cards for reception seating', 2, 9),
('Stationery', 'Order table numbers', 'Design table numbers/markers', 2, 10),
('Stationery', 'Order menus', 'Design and order reception dinner menus', 2, 11),
('Stationery', 'Order thank you cards', 'Have thank you notes ready for after the wedding', 2, 12),
('Stationery', 'Purchase postage', 'Buy stamps for all mailings', 5, 13),
('Stationery', 'Wedding website', 'Create and launch wedding website with all details', 10, 14);

-- FLOWERS
INSERT INTO wedding_checklist (category, task, description, suggested_month, sort_order) VALUES
('Flowers', 'Research florists', 'Look up local florists and review portfolios', 9, 1),
('Flowers', 'Book florist', 'Hire florist for wedding flowers', 7, 2),
('Flowers', 'Bridal consultation', 'Meet with florist to discuss vision and budget', 6, 3),
('Flowers', 'Finalize flower choices', 'Confirm all bouquet, centerpiece, and arrangement selections', 3, 4),
('Flowers', 'Bridal bouquet', 'Design and confirm bridal bouquet style', 3, 5),
('Flowers', 'Bridesmaids bouquets', 'Coordinate bridesmaid bouquet colors and styles', 3, 6),
('Flowers', 'Boutonnieres and corsages', 'Order for groom, groomsmen, parents, grandparents', 3, 7),
('Flowers', 'Ceremony flowers', 'Plan altar, archway, and aisle arrangements', 3, 8),
('Flowers', 'Reception centerpieces', 'Confirm table centerpiece designs', 3, 9),
('Flowers', 'Flower crown/hair flowers', 'Optional floral hair accessory', 3, 10);

-- CEREMONY
INSERT INTO wedding_checklist (category, task, description, suggested_month, sort_order) VALUES
('Ceremony', 'Book ceremony venue', 'Secure the location for your ceremony', 12, 1),
('Ceremony', 'Hire officiant', 'Book a professional officiant or coordinate with clergy', 10, 2),
('Ceremony', 'Write wedding vows', 'Draft personal or traditional vows', 2, 3),
('Ceremony', 'Choose ceremony music', 'Select processional, recessional, and interlude songs', 4, 4),
('Ceremony', 'Book ceremony musicians', 'Hire musicians for prelude, ceremony, and postlude', 8, 5),
('Ceremony', 'Select readings', 'Choose readers and readings for the ceremony', 4, 6),
('Ceremony', 'Plan unity ritual', 'Decide on unity candle, sand ceremony, or other ritual', 4, 7),
('Ceremony', 'Order ring pillow', 'If using a ring bearer, order pillow or box', 3, 8),
('Ceremony', 'Order flower girl basket', 'If using a flower girl, order basket', 3, 9),
('Ceremony', 'Aisle runner', 'Decide on aisle runner or petal aisle', 3, 10),
('Ceremony', 'Weather back-up plan', 'If outdoor, secure indoor alternative', 2, 11);

-- RECEPTION
INSERT INTO wedding_checklist (category, task, description, suggested_month, sort_order) VALUES
('Reception', 'Book reception venue', 'Secure reception location', 12, 1),
('Reception', 'Book caterer', 'Hire caterer and schedule tasting', 10, 2),
('Reception', 'Catering tasting', 'Sample menu items and finalize meal selections', 6, 3),
('Reception', 'Order wedding cake', 'Select baker, schedule tasting, and place order', 6, 4),
('Reception', 'Cake tasting', 'Sample cake flavors and fillings', 4, 5),
('Reception', 'Book DJ or band', 'Hire entertainment for reception', 9, 6),
('Reception', 'Submit must-play and do-not-play list', 'Provide music preferences to DJ/band', 2, 7),
('Reception', 'Book bar service', 'Determine bar package or hire bartenders', 8, 8),
('Reception', 'Select linens and rentals', 'Choose tablecloths, napkins, chair covers, glassware', 5, 9),
('Reception', 'Order guest book', 'Select and order guest book + pens', 3, 10),
('Reception', 'Create seating chart', 'Design seating arrangement for reception', 2, 11),
('Reception', 'Design welcome sign', 'Create welcome sign for entrance', 2, 12),
('Reception', 'Order card box', 'Secure a box for cards and gifts at reception', 2, 13),
('Reception', 'First dance song selection', 'Choose song and consider dance lessons', 3, 14);

-- PHOTOGRAPHY & VIDEO
INSERT INTO wedding_checklist (category, task, description, suggested_month, sort_order) VALUES
('Photography', 'Research photographers', 'Review portfolios and compare packages', 11, 1),
('Photography', 'Book photographer', 'Hire wedding photographer', 10, 2),
('Photography', 'Book videographer', 'Hire wedding videographer', 9, 3),
('Photography', 'Schedule engagement photos', 'Plan engagement shoot with photographer', 7, 4),
('Photography', 'Create shot list', 'List must-have photos for the photographer', 2, 5),
('Photography', 'Confirm photography timeline', 'Finalize timing with photographer for the day', 1, 6),
('Photography', 'Discuss photo delivery', 'Confirm when and how photos will be delivered', 1, 7);

-- VENDORS
INSERT INTO wedding_checklist (category, task, description, suggested_month, sort_order) VALUES
('Vendors', 'Set wedding budget', 'Determine total wedding budget and allocation', 12, 1),
('Vendors', 'Create vendor list', 'List all vendors needed for the wedding', 11, 2),
('Vendors', 'Research and compare vendors', 'Get quotes from multiple vendors per category', 10, 3),
('Vendors', 'Book venue', 'Sign contract with ceremony and/or reception venue', 12, 4),
('Vendors', 'Book photographer/videographer', 'Secure photo and video coverage', 10, 5),
('Vendors', 'Book caterer', 'Finalize catering contract and menu', 9, 6),
('Vendors', 'Book DJ/band', 'Secure entertainment', 9, 7),
('Vendors', 'Book florist', 'Hire florist', 8, 8),
('Vendors', 'Book hair and makeup', 'Hire beauty team and schedule trial', 7, 9),
('Vendors', 'Book transportation', 'Arrange wedding day transportation', 6, 10),
('Vendors', 'Book officiant', 'Hire or arrange ceremony officiant', 6, 11),
('Vendors', 'Book rehearsal dinner venue', 'Secure location for rehearsal dinner', 5, 12),
('Vendors', 'Confirm all vendors 1 month out', 'Reach out to all vendors to confirm details', 1, 13);

-- BEAUTY
INSERT INTO wedding_checklist (category, task, description, suggested_month, sort_order) VALUES
('Beauty', 'Book hair and makeup artist', 'Research and book beauty team', 6, 1),
('Beauty', 'Schedule hair and makeup trial', 'Test wedding hair and makeup look', 2, 2),
('Beauty', 'Schedule manicure and pedicure', 'Book nail appointment for week of wedding', 1, 3),
('Beauty', 'Schedule haircut and color', 'Book hair appointment 1-2 weeks before', 1, 4),
('Beauty', 'Skincare routine', 'Start skincare regimen 3-6 months before wedding', 6, 5),
('Beauty', 'Teeth whitening', 'Schedule whitening treatment 2-4 weeks before', 1, 6),
('Beauty', 'Waxing/threading appointment', 'Book hair removal appointments', 1, 7);

-- FAVORS & GIFTS
INSERT INTO wedding_checklist (category, task, description, suggested_month, sort_order) VALUES
('Gifts', 'Choose wedding favors', 'Select favors for guests', 4, 1),
('Gifts', 'Order wedding favors', 'Place favor order', 3, 2),
('Gifts', 'Purchase bridal party gifts', 'Buy gifts for bridesmaids and groomsmen', 2, 3),
('Gifts', 'Purchase parent gifts', 'Select gifts for parents of bride and groom', 2, 4),
('Gifts', 'Prepare vendor tips', 'Set aside gratuities for vendors in envelopes', 1, 5);

-- RINGS
INSERT INTO wedding_checklist (category, task, description, suggested_month, sort_order) VALUES
('Rings', 'Shop for wedding bands', 'Browse wedding ring options', 6, 1),
('Rings', 'Purchase wedding bands', 'Buy wedding rings for both partners', 4, 2),
('Rings', 'Ring engraving', 'Arrange engraving if desired', 3, 3),
('Rings', 'Ring sizing', 'Ensure rings fit properly', 2, 4),
('Rings', 'Clean engagement ring', 'Have engagement ring professionally cleaned', 1, 5);

-- HONEYMOON
INSERT INTO wedding_checklist (category, task, description, suggested_month, sort_order) VALUES
('Honeymoon', 'Research honeymoon destinations', 'Explore options and compare', 8, 1),
('Honeymoon', 'Set honeymoon budget', 'Determine spending for the trip', 7, 2),
('Honeymoon', 'Book flights', 'Purchase airline tickets', 6, 3),
('Honeymoon', 'Book accommodations', 'Reserve hotel or resort', 6, 4),
('Honeymoon', 'Plan activities/excursions', 'Book tours, dining, and experiences', 4, 5),
('Honeymoon', 'Book travel insurance', 'Protect trip investment', 4, 6),
('Honeymoon', 'Check passport validity', 'Ensure passports are current', 6, 7),
('Honeymoon', 'Pack for honeymoon', 'Prepare suitcases for the trip', 1, 8);

-- TRANSPORTATION
INSERT INTO wedding_checklist (category, task, description, suggested_month, sort_order) VALUES
('Transportation', 'Book wedding party transport', 'Arrange vehicle for bridal party to ceremony', 5, 1),
('Transportation', 'Book couple transport', 'Arrange vehicle for couple from ceremony to reception', 5, 2),
('Transportation', 'Arrange guest transport', 'Book shuttle between hotel and venue if needed', 4, 3),
('Transportation', 'Book guest parking', 'Reserve or confirm parking for guests', 3, 4);

-- LEGAL & PLANNING
INSERT INTO wedding_checklist (category, task, description, suggested_month, sort_order) VALUES
('Legal & Planning', 'Obtain marriage license', 'Apply for marriage license within valid window', 1, 1),
('Legal & Planning', 'Purchase wedding insurance', 'Protect against cancellations or issues', 10, 2),
('Legal & Planning', 'Create wedding day timeline', 'Draft hour-by-hour schedule for the day', 2, 3),
('Legal & Planning', 'Hire wedding planner', 'Engage a planner for full or month-of coordination', 12, 4),
('Legal & Planning', 'Create wedding registry', 'Set up gift registry', 8, 5),
('Legal & Planning', 'Book hotel room blocks', 'Reserve room blocks for out-of-town guests', 8, 6),
('Legal & Planning', 'Finalize guest list', 'Compile final headcount after RSVP deadline', 1, 7),
('Legal & Planning', 'RSVP deadline', 'Set deadline for guest responses', 2, 8),
('Legal & Planning', 'Send final headcount to vendors', 'Provide final numbers to caterer, venue, etc.', 1, 9),
('Legal & Planning', 'Prepare wedding day emergency kit', 'Pack essentials: safety pins, stain remover, bandages, etc.', 1, 10),
('Legal & Planning', 'Assign day-of roles', 'Delegate tasks to wedding party and family', 1, 11),
('Legal & Planning', 'Marriage license name change', 'Prepare name change documents if applicable', 0, 12);

-- REHEARSAL DINNER
INSERT INTO wedding_checklist (category, task, description, suggested_month, sort_order) VALUES
('Rehearsal Dinner', 'Book rehearsal dinner venue', 'Secure restaurant or venue for rehearsal dinner', 5, 1),
('Rehearsal Dinner', 'Finalize rehearsal dinner menu', 'Choose menu and beverages', 2, 2),
('Rehearsal Dinner', 'Send rehearsal dinner invitations', 'Invite wedding party and close family', 1, 3),
('Rehearsal Dinner', 'Plan rehearsal dinner speeches', 'Prepare toasts for the rehearsal dinner', 0, 4);