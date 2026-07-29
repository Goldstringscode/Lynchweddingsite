-- Menu Builder System — Extended Schema
-- Run after the existing supabase-schema.sql

-- 8. Extend menu_items with full catalog columns
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS section TEXT; -- 'proteins', 'sides', 'appetizers', 'desserts'
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS nutrition JSONB; -- {"calories": 450, "protein": 32, "carbs": 12, "fat": 28, "fiber": 3}
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS allergens TEXT[]; -- ['dairy', 'gluten', 'nuts', 'shellfish', 'eggs', 'soy']
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS season_tags TEXT[]; -- ['spring', 'summer', 'fall', 'winter']
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS difficulty TEXT; -- 'easy', 'medium', 'hard'
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS pairing_group TEXT; -- group key for suggested pairings
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS suggested_pairings UUID[]; -- array of menu_item IDs
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS prep_time INTEGER; -- minutes
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS is_signature BOOLEAN DEFAULT false;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS has_small_portion BOOLEAN DEFAULT true;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS has_large_portion BOOLEAN DEFAULT true;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS base_portion_size TEXT DEFAULT 'regular'; -- 'small', 'regular', 'large'
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS portion_weight_g INTEGER; -- grams for regular portion
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS cost_per_serving DECIMAL(10,2); -- ingredient cost
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS suggested_menu_price DECIMAL(10,2); -- price venue would charge
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS ingredient_links JSONB; -- source URLs for ingredients
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS ingredient_list JSONB; -- full ingredient list with quantities
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS last_priced_date DATE;

-- 9. Menu Drafts (saved menus for events)
CREATE TABLE IF NOT EXISTS menu_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  event_type TEXT DEFAULT 'wedding',
  guest_count INTEGER DEFAULT 150,
  target_budget_per_person DECIMAL(10,2),
  courses JSONB NOT NULL DEFAULT '[]', -- [{"course_number":1,"course_type":"appetizer","item_id":"uuid","portion_size":"regular","notes":""},...]
  total_cost_per_person DECIMAL(10,2) DEFAULT 0,
  total_menu_cost DECIMAL(10,2) DEFAULT 0,
  is_locked BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE menu_drafts ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'menu_drafts' AND policyname = 'Service role can do everything on menu_drafts') THEN
    CREATE POLICY "Service role can do everything on menu_drafts"
      ON menu_drafts FOR ALL
      TO authenticated
      USING (true)
      WITH CHECK (true);
  END IF;
END
$$;