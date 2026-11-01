-- =============================================================================
-- DiwaliWala - Complete Supabase PostgreSQL Schema, RLS Policies & Seed Data
-- =============================================================================

-- Enable UUID generation extension if not enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. TABLE: greeting_templates
-- Stores static and dynamic greeting template metadata
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.greeting_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('traditional', 'modern', 'family', 'prosperity', 'spiritual', 'royal')),
  language TEXT NOT NULL CHECK (language IN ('en', 'hi')),
  greeting_text TEXT NOT NULL,
  image_url TEXT NOT NULL,
  accent_color TEXT DEFAULT '#FFD700',
  bg_theme TEXT DEFAULT 'royal-gold',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.greeting_templates ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous and authenticated users to read active templates only
DROP POLICY IF EXISTS "Allow public read access to active greeting templates" ON public.greeting_templates;
CREATE POLICY "Allow public read access to active greeting templates"
  ON public.greeting_templates
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- -----------------------------------------------------------------------------
-- 2. TABLE: generated_wishes
-- Stores metadata of generated Diwali greeting cards (no private photos stored)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.generated_wishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_name TEXT NOT NULL CHECK (char_length(trim(sender_name)) BETWEEN 1 AND 80),
  receiver_name TEXT CHECK (receiver_name IS NULL OR char_length(trim(receiver_name)) <= 80),
  template_id TEXT NOT NULL,
  language TEXT NOT NULL CHECK (language IN ('en', 'hi')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.generated_wishes ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous users to insert valid wishes
DROP POLICY IF EXISTS "Allow anonymous insert on generated_wishes" ON public.generated_wishes;
CREATE POLICY "Allow anonymous insert on generated_wishes"
  ON public.generated_wishes
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(trim(sender_name)) >= 1
    AND char_length(trim(sender_name)) <= 80
    AND (receiver_name IS NULL OR char_length(trim(receiver_name)) <= 80)
    AND language IN ('en', 'hi')
  );

-- Policy: Allow reading aggregate/recent wishes count
DROP POLICY IF EXISTS "Allow public read access on generated_wishes" ON public.generated_wishes;
CREATE POLICY "Allow public read access on generated_wishes"
  ON public.generated_wishes
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- -----------------------------------------------------------------------------
-- 3. TABLE: website_analytics
-- Tracks festive feature interactions (card downloads, firework launches, etc.)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.website_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL CHECK (char_length(trim(event_name)) BETWEEN 1 AND 100),
  page_name TEXT NOT NULL CHECK (char_length(trim(page_name)) BETWEEN 1 AND 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.website_analytics ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous users to record analytics events
DROP POLICY IF EXISTS "Allow anonymous insert on website_analytics" ON public.website_analytics;
CREATE POLICY "Allow anonymous insert on website_analytics"
  ON public.website_analytics
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(trim(event_name)) BETWEEN 1 AND 100
    AND char_length(trim(page_name)) BETWEEN 1 AND 100
  );

-- Policy: Allow public read for live community celebration counter
DROP POLICY IF EXISTS "Allow public select on website_analytics" ON public.website_analytics;
CREATE POLICY "Allow public select on website_analytics"
  ON public.website_analytics
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- -----------------------------------------------------------------------------
-- 4. STORAGE BUCKET (Optional Opt-In Cloud Saving for Generated Greetings)
-- Private user photos are NEVER uploaded unless explicitly requested by user
-- -----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'festive-creations',
  'festive-creations',
  true,
  5242880, -- 5MB limit
  ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Allow public viewing of festive creations" ON storage.objects;
CREATE POLICY "Allow public viewing of festive creations"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'festive-creations');

DROP POLICY IF EXISTS "Allow opt-in upload of festive creations" ON storage.objects;
CREATE POLICY "Allow opt-in upload of festive creations"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'festive-creations');

-- -----------------------------------------------------------------------------
-- 5. SEED DATA: Initial Greeting Templates (English & Hindi)
-- -----------------------------------------------------------------------------
INSERT INTO public.greeting_templates (title, category, language, greeting_text, image_url, accent_color, bg_theme, is_active)
VALUES
  (
    'Royal Golden Blessings',
    'royal',
    'en',
    'May this Diwali bring happiness, prosperity and endless blessings to your life!',
    '/templates/royal-gold.svg',
    '#FFD700',
    'royal-purple',
    true
  ),
  (
    'Lakshmi Prosperity Radiance',
    'prosperity',
    'en',
    'May the divine light of Diwali spread peace, wealth, joy, and good health in your home.',
    '/templates/lakshmi-lotus.svg',
    '#FF8C00',
    'crimson-palace',
    true
  ),
  (
    'Festival of Million Diyas',
    'traditional',
    'en',
    'Let every clay diya you light tonight reflect warmth, love, and new beginnings for your family.',
    '/templates/million-diyas.svg',
    '#FFD700',
    'midnight-indigo',
    true
  ),
  (
    'Sacred Sanskriti Shimmer',
    'spiritual',
    'en',
    'Wishing you a sparkling Festival of Lights filled with sweet moments and cherished memories!',
    '/templates/sanskriti-mandala.svg',
    '#FFF4DC',
    'emerald-gold',
    true
  ),
  (
    'शुभ दीपावली मंगलकामना',
    'traditional',
    'hi',
    'आपको और आपके परिवार को दीपावली की हार्दिक शुभकामनाएं!',
    '/templates/hindi-shubh.svg',
    '#FFD700',
    'royal-purple',
    true
  ),
  (
    'सुख, समृद्धि और वैभव',
    'prosperity',
    'hi',
    'दीपों का यह पावन त्योहार आपके जीवन में सुख, शांति, समृद्धि और अनंत खुशियां लेकर आए। शुभ दिवाली!',
    '/templates/hindi-lakshmi.svg',
    '#FF8C00',
    'crimson-palace',
    true
  ),
  (
    'जगमगाती खुशियों का पर्व',
    'family',
    'hi',
    'माँ लक्ष्मी और भगवान गणेश की कृपा से आपका घर हमेशा खुशियों और उजालों से जगमगाता रहे।',
    '/templates/hindi-parivar.svg',
    '#FFD700',
    'midnight-indigo',
    true
  ),
  (
    'प्रेम और प्रकाश का उत्सव',
    'modern',
    'hi',
    'हर दिया आपके आंगन में नई उम्मीद, मधुर मुस्कान और सुनहरा कल लेकर आए। दीपावली की मंगलकामनाएं!',
    '/templates/hindi-prakash.svg',
    '#FFF4DC',
    'saffron-royal',
    true
  );

