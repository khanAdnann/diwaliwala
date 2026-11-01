# DiwaliWala 🪔 — Celebrate the Magic of Diwali

**DiwaliWala** is a luxury, interactive Indian Diwali festival web application built with **React, Vite, Tailwind CSS, Framer Motion, GSAP, HTML5 Canvas, and Supabase**.

---

## ✨ Core Features

1. **Immersive Home Landing Page (`/`)**
   - Hero section with animated night sky, floating golden particles, sky lanterns, and GSAP entrance animations.
   - Interactive **5 Sacred Clay Diyas Altar** — click any diya to toggle its flame and trigger golden blessings.
   - Live **Maha Deepavali Countdown Timer** (`Days | Hours | Minutes | Seconds`) with configurable festival dates.
   - Five interactive feature cards with glassmorphism and golden hover effects.

2. **Diwali Wish Generator (`/wishes`)**
   - Personalized greeting card studio supporting both **English** and **Hindi (देवनागरी)** greetings.
   - Custom sender name, optional receiver name, 8+ curated greeting templates, 5 royal palace backgrounds, text color swatches, and golden sparkle effects.
   - Renders a crisp `1080×1080` PNG via HTML5 Canvas with one-click **Download as PNG**, **Share on WhatsApp**, and **Copy Greeting Text**.

3. **Name in Lights (`/name-in-lights`)**
   - Illuminates any user name (e.g., *"Happy Diwali Adnan!"*) in multi-pass golden neon typography.
   - Surrounded by hanging fairy light garlands, bilateral glowing diyas, starlight sparkles, and sacred rangoli mandalas.
   - Supports **Instagram Story Portrait (`1080×1350`)** and **Landscape (`1280×720`)** aspect ratios.

4. **Photo Frame Maker (`/photo-frames`)**
   - Upload any JPG, PNG, or WEBP photo (strictly validated up to 8MB) or test immediately with a built-in **Sample Festive Portrait**.
   - **6 Ornate Diwali Frame Templates**: *Royal Jharokha Arch*, *Udaipur Mandala Circle*, *Temple Marigold Garland*, *Celestial Octagon Jewel*, *Jaipur Emerald Zari*, and *Shubh Labh Heritage*.
   - Interactive **drag-to-pan** directly on the canvas, **zoom**, **rotation**, golden border toggles, corner diyas, and custom greeting text.
   - **100% Client-Side Privacy**: Private photos are processed inside the browser and are never uploaded to Supabase unless the user explicitly clicks *Opt-In Cloud Link*.

5. **Interactive Fireworks Simulator (`/fireworks`)**
   - Full-screen capable 60FPS HTML5 Canvas fireworks simulator optimized with `requestAnimationFrame`.
   - Click or tap anywhere to launch rockets with realistic gravity, air drag, velocity, and secondary golden sparkles.
   - **6 Explosion Patterns**: *Chrysanthemum*, *Double Chakra Ring*, *Golden Willow Cascade*, *Heart of Light*, *Starburst*, and *Royal Mix*.
   - **Auto Show Mode** vs **Manual Mode**, **Grand Finale (8x Salvo)**, and synthesized **Web Audio API sound effects**.

---

## 🗄️ Supabase Setup

1. Create a new project at [Supabase](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard and run the complete migration script located at:
   - [`supabase/schema.sql`](./supabase/schema.sql)
   - This creates `greeting_templates`, `generated_wishes`, `website_analytics`, Row-Level Security (RLS) policies, seed templates, and the optional `festive-creations` storage bucket.
3. Copy `.env.example` to `.env` and fill in your credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key-here
VITE_DIWALI_DATE=2026-11-08T00:00:00+05:30
```

> **Note:** Never expose `service_role` keys in the frontend. The app includes automatic local fallback if `.env` is not yet configured.

---

## 🚀 Local Development & Production Build

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Build for production
npm run build

# 4. Preview production build locally
npm run preview
```

---

## 🌐 Deploying to Vercel

1. Push this repository to GitHub / GitLab / Bitbucket.
2. Import the project in **Vercel**.
3. Add `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_DIWALI_DATE` under **Project Settings → Environment Variables**.
4. Deploy! [`vercel.json`](./vercel.json) is pre-configured with SPA rewrites so all React Router routes (`/wishes`, `/name-in-lights`, `/photo-frames`, `/fireworks`, `/about`) resolve cleanly on refresh.

