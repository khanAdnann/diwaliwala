import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Zap,
  Camera,
  Flame,
  Gift,
  Clock,
  ArrowRight,
  Share2,
  Star,
} from 'lucide-react';
import SEOHead from '../components/SEOHead';
import DiyaSvg from '../components/DiyaSvg';
import RangoliSvg from '../components/RangoliSvg';
import DiwaliCountdown from '../components/DiwaliCountdown';
import { trackAnalyticsEvent } from '../lib/supabase';
import { shareViaWhatsApp } from '../utils/shareUtils';
import { useToast } from '../context/ToastContext';
import { soundManager } from '../utils/soundEngine';

const FIVE_FEATURE_CARDS = [
  {
    id: 'feature-wishes',
    title: 'Diwali Wish Generator',
    badge: 'Bilingual Cards',
    description:
      'Craft personalized Hindi & English greeting cards with royal palace themes, golden mandalas, and instant PNG download or WhatsApp sharing.',
    icon: Gift,
    link: '/wishes',
    cta: 'Create Greeting Card',
    accent: 'from-[#FFD700] to-[#FF8C00]',
  },
  {
    id: 'feature-name-lights',
    title: 'Name in Lights',
    badge: 'Instagram Story Ready',
    description:
      'See your name illuminated in glowing golden Diwali lights surrounded by ceremonial diyas, fairy garlands, and sparkling stars.',
    icon: Zap,
    link: '/name-in-lights',
    cta: 'Illuminate Your Name',
    accent: 'from-[#FF8C00] to-[#F59E0B]',
  },
  {
    id: 'feature-photo-frames',
    title: 'Photo Frame Maker',
    badge: '6 Royal Templates',
    description:
      'Frame your cherished festive portraits inside 6 ornate Diwali frames with interactive drag, zoom, rotation, and 100% client-side privacy.',
    icon: Camera,
    link: '/photo-frames',
    cta: 'Frame Your Photo',
    accent: 'from-[#FFD700] to-[#EAB308]',
  },
  {
    id: 'feature-fireworks',
    title: 'Fireworks Simulator',
    badge: '60FPS Interactive Canvas',
    description:
      'Launch eco-friendly sky fireworks with realistic particle physics, 6 burst patterns, synthesized sound effects, and full-screen mode.',
    icon: Flame,
    link: '/fireworks',
    cta: 'Launch Fireworks',
    accent: 'from-[#FB923C] to-[#EA580C]',
  },
  {
    id: 'feature-countdown',
    title: 'Diwali Muhurat Countdown',
    badge: 'Live Festival Timer',
    description:
      'Track every day, hour, minute, and second to Dhanteras, Choti Diwali, Lakshmi Puja, Govardhan Puja, and Bhai Dooj with golden cards.',
    icon: Clock,
    link: '#countdown',
    isAnchor: true,
    cta: 'View Live Timer',
    accent: 'from-[#FDE047] to-[#FFD700]',
  },
];

const SACRED_DIYAS_LIST = [
  { id: 1, name: 'Sukh', blessing: 'May joy illuminate every corner of your home!' },
  { id: 2, name: 'Samriddhi', blessing: 'May Goddess Lakshmi bless you with abundance!' },
  { id: 3, name: 'Shanti', blessing: 'May serenity and harmony fill your heart!' },
  { id: 4, name: 'Swasthya', blessing: 'May you and your family enjoy vibrant health!' },
  { id: 5, name: 'Prem', blessing: 'May sweet bonds of love grow stronger tonight!' },
];

export default function Home() {
  const heroRef = useRef(null);
  const [litDiyas, setLitDiyas] = useState([1, 2, 3, 4, 5]);
  const { addToast } = useToast();

  useEffect(() => {
    trackAnalyticsEvent('page_view_home', '/');

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.gsap-hero-badge',
        { opacity: 0, y: -16 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
      );
      gsap.fromTo(
        '.gsap-hero-title',
        { opacity: 0, y: 24, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, delay: 0.1, ease: 'power3.out' }
      );
      gsap.fromTo(
        '.gsap-hero-subtitle',
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.7, delay: 0.25, ease: 'power3.out' }
      );
      gsap.fromTo(
        '.gsap-hero-cta',
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.7, delay: 0.35, ease: 'power3.out' }
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const handleToggleDiya = (diya) => {
    setLitDiyas((prev) => {
      const isCurrentlyLit = prev.includes(diya.id);
      const next = isCurrentlyLit ? prev.filter((id) => id !== diya.id) : [...prev, diya.id];

      if (!isCurrentlyLit) {
        soundManager.playDiyaLightSound();
        addToast({
          title: `🪔 Lit Diya of ${diya.name}`,
          message: diya.blessing,
          type: 'festive',
        });
        if (next.length === 5) {
          soundManager.playCelebrationChime();
          confetti({
            particleCount: 80,
            spread: 90,
            origin: { y: 0.6 },
            colors: ['#FFD700', '#FF8C00', '#FFF4DC'],
          });
        }
      }
      return next;
    });
  };

  return (
    <div className="w-full overflow-x-hidden">
      <SEOHead
        title="Celebrate the Magic of Diwali 🪔"
        description="Spread Happiness, Share Love & Light Up Every Moment. Create custom Diwali wishes, Name in Lights, Photo Frames & Interactive Fireworks."
        path="/"
      />

      {/* 1. IMMERSIVE DIWALI HERO SECTION */}
      <section
        ref={heroRef}
        className="relative pt-6 pb-10 sm:pt-14 sm:pb-20 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden"
      >
        <div className="absolute top-6 left-1/2 -translate-x-1/2 -z-10 opacity-20 pointer-events-none">
          <RangoliSvg className="w-[260px] h-[260px] sm:w-[480px] sm:h-[480px]" />
        </div>

        <div className="text-center max-w-4xl mx-auto">
          <div className="gsap-hero-badge inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#29104A]/85 border border-[#FFD700]/45 text-[11px] sm:text-sm font-semibold text-[#FFD700] shadow-[0_0_24px_rgba(255,215,0,0.2)] mb-5 max-w-full">
            <Sparkles className="w-3.5 h-3.5 text-[#FFD700] shrink-0" />
            <span className="truncate">शुभ दीपावली • Festival of Lights Experience</span>
          </div>

          <h1 className="gsap-hero-title font-display text-3xl sm:text-5xl lg:text-7xl font-black tracking-tight leading-[1.15] gold-gradient-text gold-glow-text px-1">
            Celebrate the Magic of Diwali <span className="inline-block">🪔</span>
          </h1>

          <p className="gsap-hero-subtitle mt-4 sm:mt-6 text-base sm:text-2xl text-[#FFF4DC]/90 font-serif italic max-w-2xl mx-auto leading-relaxed px-2">
            &ldquo;Spread Happiness, Share Love &amp; Light Up Every Moment.&rdquo;
          </p>

          <p className="mt-2.5 text-xs sm:text-base text-[#FFF4DC]/70 max-w-xl mx-auto px-2">
            Craft royal bilingual greeting cards, illuminate your name in golden lights, frame
            family memories, and launch interactive sky fireworks.
          </p>

          {/* Hero CTA Buttons - Full width on mobile */}
          <div className="gsap-hero-cta mt-7 sm:mt-9 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-2">
            <Link
              to="/wishes"
              className="w-full sm:w-auto px-7 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl btn-royal-gold text-sm sm:text-lg flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              <span>Create Diwali Wishes</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            </Link>

            <a
              href="#festive-features"
              className="w-full sm:w-auto px-7 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl btn-festive-outline text-sm sm:text-lg flex items-center justify-center gap-2"
            >
              <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFD700] shrink-0" />
              <span>Explore Festive Magic</span>
            </a>
          </div>

          {/* Interactive 5 Sacred Diyas Altar */}
          <div className="mt-10 sm:mt-14 pt-6 sm:pt-8 border-t border-[#FFD700]/20">
            <p className="text-[10px] sm:text-xs uppercase tracking-[0.18em] text-[#FFD700]/90 font-semibold mb-4">
              ✨ Tap Any Clay Diya to Toggle Its Sacred Flame ({litDiyas.length}/5 Lit) ✨
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-8">
              {SACRED_DIYAS_LIST.map((diya) => {
                const isLit = litDiyas.includes(diya.id);
                return (
                  <div key={diya.id} className="flex flex-col items-center group">
                    <DiyaSvg
                      size={54}
                      lit={isLit}
                      interactive
                      onClick={() => handleToggleDiya(diya)}
                    />
                    <span
                      className={`mt-1 text-[10px] sm:text-[11px] font-semibold transition-colors ${
                        isLit ? 'text-[#FFD700]' : 'text-[#FFF4DC]/45'
                      }`}
                    >
                      {diya.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 2. ANIMATED DIWALI COUNTDOWN TIMER */}
      <DiwaliCountdown />

      {/* 3. FIVE FEATURE CARDS */}
      <section
        id="festive-features"
        className="py-10 sm:py-16 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto"
        aria-label="DiwaliWala Interactive Features"
      >
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-14 px-1">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#29104A] border border-[#FFD700]/35 text-[11px] sm:text-xs uppercase tracking-[0.18em] text-[#FFD700] font-bold mb-3">
            <Star className="w-3.5 h-3.5 fill-[#FFD700] shrink-0" />
            <span>5 Interactive Studios</span>
          </div>
          <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl font-bold gold-gradient-text leading-tight">
            Everything You Need for a Royal Diwali
          </h2>
          <p className="mt-2.5 text-xs sm:text-base text-[#FFF4DC]/75">
            Every experience is crafted with high-resolution HTML5 Canvas rendering, instant PNG
            downloads, and one-tap WhatsApp sharing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
          {FIVE_FEATURE_CARDS.map((card, index) => {
            const Icon = card.icon;
            const CardWrapper = card.isAnchor ? 'a' : Link;
            const wrapperProps = card.isAnchor ? { href: card.link } : { to: card.link };

            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
              >
                <CardWrapper
                  {...wrapperProps}
                  className="glass-card glass-card-hover ornate-border rounded-2xl sm:rounded-3xl p-5 sm:p-8 h-full flex flex-col justify-between group block relative overflow-hidden"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-5">
                      <div
                        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br ${card.accent} p-0.5 shadow-[0_0_24px_rgba(255,215,0,0.35)] shrink-0`}
                      >
                        <div className="w-full h-full bg-[#160B2D] rounded-[14px] flex items-center justify-center text-[#FFD700] group-hover:bg-transparent group-hover:text-[#0D0618] transition-colors">
                          <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider bg-[#0D0618]/80 border border-[#FFD700]/35 text-[#FFD700]">
                        {card.badge}
                      </span>
                    </div>

                    <h3 className="font-display text-lg sm:text-2xl font-bold text-[#FFF4DC] group-hover:text-[#FFD700] transition-colors">
                      {card.title}
                    </h3>

                    <p className="mt-2.5 text-xs sm:text-sm text-[#FFF4DC]/75 leading-relaxed">
                      {card.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#FFD700]/15 flex items-center justify-between text-xs sm:text-sm font-bold text-[#FFD700]">
                    <span>{card.cta}</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </CardWrapper>
              </motion.div>
            );
          })}

          {/* 6th Bonus Card: Instant WhatsApp Family Invite Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <div className="glass-card ornate-border rounded-2xl sm:rounded-3xl p-5 sm:p-8 h-full flex flex-col justify-between bg-gradient-to-br from-[#29104A]/80 via-[#160B2D]/90 to-[#0D0618]">
              <div>
                <div className="flex items-center justify-between mb-5">
                  <DiyaSvg size={48} lit />
                  <span className="px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider bg-[#FFD700]/20 border border-[#FFD700] text-[#FFD700]">
                    Family Celebration
                  </span>
                </div>
                <h3 className="font-display text-lg sm:text-2xl font-bold gold-gradient-text">
                  Share the Joy on WhatsApp
                </h3>
                <p className="mt-2.5 text-xs sm:text-sm text-[#FFF4DC]/80 leading-relaxed">
                  Send an instant festive blessing to your family WhatsApp groups and invite everyone
                  to create their personalized Diwali cards!
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  shareViaWhatsApp(
                    '🪔✨ शुभ दीपावली! Celebrate the Magic of Diwali with personalized wishes, Name in Lights, and Fireworks on DiwaliWala: https://diwaliwala.vercel.app'
                  )
                }
                className="mt-6 w-full py-3.5 px-4 rounded-xl sm:rounded-2xl btn-royal-gold text-xs sm:text-sm flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4 shrink-0" />
                <span>Share Festive Link on WhatsApp</span>
              </button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
