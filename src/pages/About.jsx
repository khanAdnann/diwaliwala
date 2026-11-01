import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ShieldCheck,
  Database,
  Heart,
  Flame,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import SEOHead from '../components/SEOHead';
import DiyaSvg from '../components/DiyaSvg';
import RangoliSvg from '../components/RangoliSvg';
import { getSupabaseStatus, trackAnalyticsEvent } from '../lib/supabase';

const FIVE_DAYS_OF_DIWALI = [
  {
    day: 'Day 1 • Dhanteras',
    hindi: 'धनतेरस',
    desc: 'Auspicious day of wealth, prosperity, and Lord Dhanvantari—celebrated by lighting the first ceremonial Yama Deepam.',
  },
  {
    day: 'Day 2 • Choti Diwali',
    hindi: 'नरक चतुर्दशी',
    desc: 'Victory of divine light over darkness—homes are adorned with fragrant marigold torans and vibrant rangolis.',
  },
  {
    day: 'Day 3 • Maha Deepavali (Lakshmi Puja)',
    hindi: 'लक्ष्मी पूजन',
    desc: 'The sacred night when millions of clay diyas welcome Goddess Lakshmi and Lord Ganesha into every household.',
  },
  {
    day: 'Day 4 • Govardhan Puja & Annakut',
    hindi: 'गोवर्धन पूजा',
    desc: 'Gratitude to nature and Lord Krishna, marked by grand feasts, devotion, and community harmony.',
  },
  {
    day: 'Day 5 • Bhai Dooj',
    hindi: 'भाई दूज',
    desc: 'Celebrating the eternal bond of love, protection, and blessings between brothers and sisters.',
  },
];

export default function About() {
  const supabaseStatus = getSupabaseStatus();
  const [recentWishes, setRecentWishes] = useState([]);

  useEffect(() => {
    trackAnalyticsEvent('page_view_about', '/about');
    try {
      const saved = JSON.parse(localStorage.getItem('diwaliwala_wishes') || '[]');
      setRecentWishes(saved.slice(0, 4));
    } catch {
      // Ignore
    }
  }, []);

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
      <SEOHead
        title="About DiwaliWala — The Story, Heritage & Privacy Architecture"
        description="Learn about DiwaliWala, the 5 sacred days of Diwali, our 100% client-side photo privacy commitment, and our Supabase cloud architecture."
        path="/about"
      />

      {/* Hero Banner */}
      <section className="glass-card ornate-border rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden text-center">
        <div className="absolute -right-24 -bottom-24 opacity-15 pointer-events-none">
          <RangoliSvg className="w-80 h-80" />
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#29104A] border border-[#FFD700]/40 text-xs font-bold uppercase tracking-[0.2em] text-[#FFD700] mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Our Festive Vision</span>
        </div>

        <h1 className="font-display text-3xl sm:text-5xl font-black gold-gradient-text gold-glow-text max-w-3xl mx-auto">
          Where Ancient Indian Tradition Meets Modern Digital Craft 🪔
        </h1>

        <p className="mt-5 text-base sm:text-lg text-[#FFF4DC]/85 max-w-2xl mx-auto leading-relaxed">
          <strong>DiwaliWala</strong> was created to bring families and friends closer across every
          distance—combining royal Indian festive artistry with instant HTML5 Canvas studios,
          bilingual Hindi &amp; English blessings, and eco-friendly interactive fireworks.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/wishes"
            className="px-7 py-3.5 rounded-2xl btn-royal-gold text-sm sm:text-base flex items-center gap-2"
          >
            <span>Create a Diwali Card</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/fireworks"
            className="px-7 py-3.5 rounded-2xl btn-festive-outline text-sm sm:text-base flex items-center gap-2"
          >
            <Flame className="w-4 h-4 text-[#FFD700]" />
            <span>Launch Sky Fireworks</span>
          </Link>
        </div>
      </section>

      {/* The 5 Sacred Days of Diwali */}
      <section>
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="font-display text-2xl sm:text-4xl font-bold gold-gradient-text">
            The Five Sacred Days of Deepavali
          </h2>
          <p className="mt-2 text-sm text-[#FFF4DC]/75">
            Each day of the festival carries timeless spiritual significance and joyous family
            traditions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
          {FIVE_DAYS_OF_DIWALI.map((item, idx) => (
            <motion.div
              key={item.day}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08 }}
              className="glass-card glass-card-hover rounded-2xl p-5 flex flex-col justify-between border border-[#FFD700]/30"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <DiyaSvg size={36} lit />
                  <span className="text-xs font-hindiSans font-bold text-[#FFD700] bg-[#0D0618]/80 px-2.5 py-1 rounded-full border border-[#FFD700]/30">
                    {item.hindi}
                  </span>
                </div>
                <h3 className="font-display text-base font-bold text-[#FFF4DC]">{item.day}</h3>
                <p className="mt-2 text-xs text-[#FFF4DC]/75 leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Security, Privacy & Supabase Architecture Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card ornate-border rounded-3xl p-7 sm:p-8 space-y-4">
          <div className="flex items-center gap-3 text-[#FFD700]">
            <ShieldCheck className="w-7 h-7" />
            <h2 className="font-display text-xl sm:text-2xl font-bold">
              Privacy-First Client-Side Studio
            </h2>
          </div>
          <p className="text-sm text-[#FFF4DC]/80 leading-relaxed">
            Unlike traditional photo frame websites that upload your personal family photos to remote
            servers, DiwaliWala renders every greeting card, Name in Lights story, and Photo Frame
            directly on your device using HTML5 Canvas.
          </p>
          <ul className="space-y-2.5 text-xs sm:text-sm text-[#FFF4DC]/85">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#FFD700] shrink-0" />
              <span>Private photos are never uploaded to Supabase by default.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#FFD700] shrink-0" />
              <span>Strict MIME type &amp; 8MB file size validation before canvas decoding.</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-[#FFD700] shrink-0" />
              <span>Instant high-resolution 1080p PNG export without watermarks blocking your art.</span>
            </li>
          </ul>
        </div>

        <div className="glass-card ornate-border rounded-3xl p-7 sm:p-8 space-y-4">
          <div className="flex items-center gap-3 text-[#FFD700]">
            <Database className="w-7 h-7" />
            <h2 className="font-display text-xl sm:text-2xl font-bold">
              Supabase PostgreSQL &amp; RLS Backend
            </h2>
          </div>
          <p className="text-sm text-[#FFF4DC]/80 leading-relaxed">
            DiwaliWala integrates with Supabase PostgreSQL (`greeting_templates`,
            `generated_wishes`, and `website_analytics`) protected by Row-Level Security (RLS) and
            automatic local fallback so the site works seamlessly in every environment.
          </p>

          <div className="p-4 rounded-2xl bg-[#0D0618]/85 border border-[#FFD700]/30 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[#FFF4DC]/70">Connection Mode:</span>
              <span className="font-bold text-[#FFD700]">
                {supabaseStatus.configured
                  ? 'Connected to Supabase Cloud'
                  : 'Resilient Local-First Mode (Ready for .env)'}
              </span>
            </div>
            {recentWishes.length > 0 && (
              <div className="pt-2 border-t border-[#FFD700]/15">
                <p className="text-[#FFD700] font-semibold mb-1">
                  Your Recent Generated Wishes ({recentWishes.length}):
                </p>
                <div className="flex flex-wrap gap-2">
                  {recentWishes.map((w) => (
                    <span
                      key={w.id}
                      className="px-2.5 py-1 rounded-lg bg-[#29104A] text-[#FFF4DC] text-[11px]"
                    >
                      From {w.sender_name} {w.receiver_name ? `→ ${w.receiver_name}` : ''} (
                      {w.language.toUpperCase()})
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

