-- Buffet System Schema
-- Run via /api/db-migrate or Supabase SQL editor

CREATE TABLE IF NOT EXISTS buffet_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL, -- 'hors-doeuvres', 'appetizers', 'proteins', 'sides', 'desserts'
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  section TEXT, -- same as category for consistency
  image_url TEXT,
  nutrition JSONB DEFAULT '{}'::jsonb,
  allergens TEXT[] DEFAULT '{}',
  season_tags TEXT[] DEFAULT '{}',
  difficulty TEXT DEFAULT 'medium',
  prep_time INTEGER DEFAULT 30,
  is_signature BOOLEAN DEFAULT false,
  is_available BOOLEAN DEFAULT true,
  portion_weight_g INTEGER,
  cost_per_serving DECIMAL(10,2) DEFAULT 0,
  suggested_menu_price DECIMAL(10,2) DEFAULT 0,
  price_per_person DECIMAL(10,2) DEFAULT 0, -- buffet per-person price
  guest_count_scale INTEGER DEFAULT 10, -- servings per N guests (e.g. 10 = 1 serving per 10 guests)
  station_type TEXT DEFAULT 'self-serve', -- 'carving', 'pasta', 'action', 'display', 'pass', 'self-serve'
  ingredient_links JSONB DEFAULT '{}'::jsonb,
  ingredient_list JSONB DEFAULT '[]'::jsonb,
  pricing_breakdown JSONB DEFAULT '{}'::jsonb, -- costco/winco/sams pricing breakdown
  dietary_labels TEXT[] DEFAULT '{}', -- ['GF','V','V+','DF','NF']
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE buffet_items ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'buffet_items' AND policyname = 'Service role can do everything on buffet_items') THEN
    CREATE POLICY "Service role can do everything on buffet_items"
      ON buffet_items FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END
$$;

-- Buffet Menus (separate from plated menu_drafts)
CREATE TABLE IF NOT EXISTS buffet_menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  guest_count INTEGER DEFAULT 150,
  is_locked BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  stations JSONB NOT NULL DEFAULT '[]'::jsonb, -- [{"station_number":1,"station_type":"carving","station_name":"Carving Station","items":[{"item_id":"uuid","portion":"regular"}],"notes":""},...]
  total_cost_per_person DECIMAL(10,2) DEFAULT 0,
  total_menu_cost DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE buffet_menus ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'buffet_menus' AND policyname = 'Service role can do everything on buffet_menus') THEN
    CREATE POLICY "Service role can do everything on buffet_menus"
      ON buffet_menus FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END
$$;