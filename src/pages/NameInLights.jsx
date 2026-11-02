import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Star,
  Sparkles,
  Download,
  Share2,
  Type,
  Palette,
  Smartphone,
  Monitor,
  Play,
  Pause,
} from 'lucide-react';
import SEOHead from '../components/SEOHead';
import { CARD_BACKGROUNDS } from '../config/festivalConfig';
import { renderNameInLightsCanvas } from '../utils/canvasRenderer';
import { downloadDataUrlAsPng, shareViaWhatsApp } from '../utils/shareUtils';
import { trackAnalyticsEvent, sanitizeUserText } from '../lib/supabase';
import { useToast } from '../context/ToastContext';
import { soundManager } from '../utils/soundEngine';

const FONT_OPTIONS = [
  { id: 'cinzel', name: 'Royal Cinzel', sample: 'Happy Diwali' },
  { id: 'script', name: 'Festive Calligraphy', sample: 'Happy Diwali' },
  { id: 'playfair', name: 'Imperial Playfair', sample: 'Happy Diwali' },
  { id: 'hindi', name: 'Sacred Heritage', sample: 'शुभ दीपावली' },
];

const GLOW_PALETTES = [
  { name: '24K Temple Gold', value: '#FFD700' },
  { name: 'Saffron Marigold', value: '#FF8C00' },
  { name: 'Rose Lotus Glow', value: '#FB7185' },
  { name: 'Celestial Amber', value: '#FBBF24' },
  { name: 'Royal Cyan Spark', value: '#38BDF8' },
];

export default function NameInLights() {
  const canvasRef = useRef(null);
  const { addToast } = useToast();

  const [userName, setUserName] = useState('Adnan');
  const [customPrefix, setCustomPrefix] = useState('Happy Diwali');
  const [fontStyle, setFontStyle] = useState('cinzel');
  const [bgTheme, setBgTheme] = useState('royal-purple');
  const [glowColor, setGlowColor] = useState('#FFD700');
  const [aspectRatio, setAspectRatio] = useState('story');
  const [animateSparkles, setAnimateSparkles] = useState(true);

  useEffect(() => {
    trackAnalyticsEvent('page_view_name_in_lights', '/name-in-lights');
  }, []);

  useEffect(() => {
    let frameId;
    let phase = 0;

    const drawFrame = () => {
      if (canvasRef.current) {
        renderNameInLightsCanvas(
          canvasRef.current,
          {
            userName: sanitizeUserText(userName, 36) || 'Adnan',
            customPrefix: sanitizeUserText(customPrefix, 36) || 'Happy Diwali',
            fontStyle,
            bgTheme,
            glowColor,
            aspectRatio,
          },
          phase
        );
      }
      if (animateSparkles) {
        phase += 0.06;
        frameId = window.requestAnimationFrame(drawFrame);
      }
    };

    drawFrame();

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, [userName, customPrefix, fontStyle, bgTheme, glowColor, aspectRatio, animateSparkles]);

  const handleDownloadStory = () => {
    if (!canvasRef.current) return;
    const clean = sanitizeUserText(userName, 30).toLowerCase().replace(/\s+/g, '-') || 'adnan';
    const dataUrl = canvasRef.current.toDataURL('image/png');
    downloadDataUrlAsPng(dataUrl, `diwaliwala-name-in-lights-${clean}.png`);
    soundManager.playCelebrationChime();
    trackAnalyticsEvent('download_name_in_lights', '/name-in-lights');

    confetti({
      particleCount: 60,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FF8C00', '#FFF4DC'],
    });

    addToast({
      title: 'Name in Lights Downloaded! 🏮',
      message: `Saved ${
        aspectRatio === 'story' ? 'Instagram Story (1080×1350)' : 'HD Landscape (1280×720)'
      } PNG!`,
      type: 'festive',
    });
  };

  const handleShareWhatsApp = () => {
    const clean = sanitizeUserText(userName, 40) || 'Adnan';
    trackAnalyticsEvent('whatsapp_share_name_in_lights', '/name-in-lights');
    shareViaWhatsApp(
      `🪔✨ *${customPrefix} ${clean}!* ✨🪔\n\nMay your life shine brighter than a thousand diyas this Diwali!\n\n🏮 Illuminate your own Name in Lights on DiwaliWala: https://diwaliwala.vercel.app/name-in-lights`
    );
  };

  return (
    <div className="py-6 sm:py-10 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full overflow-x-hidden">
      <SEOHead
        title="Name in Lights — Personalized Glowing Diwali Name Generator"
        description="Illuminate your name in golden Diwali lights with fairy garlands, glowing diyas, and rangoli patterns. Download HD Instagram Story PNGs!"
        path="/name-in-lights"
      />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-10 px-1">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#29104A] border border-[#FFD700]/40 text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em] text-[#FFD700] mb-3">
          <Star className="w-3.5 h-3.5 shrink-0" />
          <span>Instagram Story &amp; Status Art Generator</span>
        </div>
        <h1 className="font-display text-2xl sm:text-4xl lg:text-5xl font-black gold-gradient-text gold-glow-text leading-tight">
          Magical Name in Lights 🏮
        </h1>
        <p className="mt-2.5 text-xs sm:text-base text-[#FFF4DC]/80">
          Enter any name to illuminate it in glowing golden typography surrounded by hanging fairy
          lights, ceremonial diyas, and sacred rangoli art.
        </p>
      </div>

      {/* Responsive Layout:
          - Mobile (<1024px): Preview FIRST (order-1), Controls SECOND (order-2)
          - Desktop (>=1024px): Controls LEFT 42% (lg:w-[42%] lg:order-1), Preview RIGHT 58% (lg:w-[58%] lg:order-2)
      */}
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-stretch lg:items-start w-full">
        {/* PREVIEW COLUMN: Order 1 on Mobile, Order 2 (Right 58%) on Desktop */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="order-1 lg:order-2 w-full lg:w-[58%] lg:sticky lg:top-24"
        >
          <div className="glass-card ornate-border rounded-2xl sm:rounded-3xl p-4 sm:p-6 w-full max-w-xl mx-auto lg:max-w-none">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#FFD700] flex items-center gap-1.5 truncate">
                <Sparkles className="w-4 h-4 shrink-0" />
                <span className="truncate">
                  {customPrefix} {userName || 'Adnan'}!
                </span>
              </span>
              <span className="text-[10px] sm:text-[11px] text-[#FFF4DC]/65 shrink-0">
                {aspectRatio === 'story' ? '1080×1350 Story' : '1280×720 HD'}
              </span>
            </div>

            <div className="w-full max-w-[360px] sm:max-w-[440px] lg:max-w-[480px] mx-auto rounded-2xl overflow-hidden border-2 border-[#FFD700]/55 bg-[#06030C] shadow-[0_0_35px_rgba(255,215,0,0.18)] flex items-center justify-center">
              <canvas
                ref={canvasRef}
                className="w-full h-auto max-h-[440px] sm:max-h-[500px] object-contain block"
                aria-label={`Happy Diwali ${userName} Name in Lights Preview`}
              />
            </div>

            <div className="mt-4 sm:mt-5 space-y-2.5">
              <button
                type="button"
                onClick={handleDownloadStory}
                className="w-full py-3.5 px-5 rounded-xl sm:rounded-2xl btn-royal-gold text-sm sm:text-base flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5 shrink-0" />
                <span>Download Name in Lights (PNG)</span>
              </button>

              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="w-full py-3 px-4 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/60 text-[#FFF4DC] font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all"
              >
                <Share2 className="w-4 h-4 text-[#25D366] shrink-0" />
                <span>Share via WhatsApp</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* CONTROLS COLUMN: Order 2 on Mobile, Order 1 (Left 42%) on Desktop */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="order-2 lg:order-1 w-full lg:w-[42%] glass-card ornate-border rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-5 max-w-xl mx-auto lg:max-w-none"
        >
          {/* 1. Name & Greeting Prefix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label
                htmlFor="lights-name-input"
                className="block text-xs font-bold uppercase tracking-wider text-[#FFD700] mb-1.5"
              >
                1. Enter Your Name *
              </label>
              <input
                id="lights-name-input"
                type="text"
                maxLength={28}
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="e.g., Adnan"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0618]/90 border border-[#FFD700]/45 text-base font-bold text-[#FFD700] focus:outline-none focus:border-[#FFD700]"
              />
            </div>

            <div>
              <label
                htmlFor="lights-prefix-input"
                className="block text-xs font-bold uppercase tracking-wider text-[#FFD700] mb-1.5"
              >
                2. Headline Prefix
              </label>
              <input
                id="lights-prefix-input"
                type="text"
                maxLength={28}
                value={customPrefix}
                onChange={(e) => setCustomPrefix(e.target.value)}
                placeholder="Happy Diwali"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0D0618]/90 border border-[#FFD700]/45 text-sm text-[#FFF4DC] focus:outline-none focus:border-[#FFD700]"
              />
            </div>
          </div>

          {/* Quick Name Presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-[#FFF4DC]/60 mr-1">Try:</span>
            {['Adnan', 'Aarav', 'Priya', 'Ananya', 'Khan Family'].map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => setUserName(sample)}
                className="px-2.5 py-1 rounded-full text-[11px] bg-[#0D0618]/80 border border-[#FFD700]/30 text-[#FFF4DC]/85 hover:border-[#FFD700] hover:text-[#FFD700] transition-colors"
              >
                {sample}
              </button>
            ))}
          </div>

          {/* 2. Format Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#FFD700] mb-2">
              3. Canvas Format
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setAspectRatio('story')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  aspectRatio === 'story'
                    ? 'bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-[#0D0618] border-[#FFD700]'
                    : 'bg-[#0D0618]/75 border-[#FFD700]/30 text-[#FFF4DC]'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5 shrink-0" />
                <span>Story (4:5)</span>
              </button>

              <button
                type="button"
                onClick={() => setAspectRatio('landscape')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  aspectRatio === 'landscape'
                    ? 'bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-[#0D0618] border-[#FFD700]'
                    : 'bg-[#0D0618]/75 border-[#FFD700]/30 text-[#FFF4DC]'
                }`}
              >
                <Monitor className="w-3.5 h-3.5 shrink-0" />
                <span>Banner (16:9)</span>
              </button>
            </div>
          </div>

          {/* 3. Font Style Selection */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#FFD700] flex items-center gap-1.5 mb-2">
              <Type className="w-4 h-4 shrink-0" />
              <span>4. Illuminated Font Style</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {FONT_OPTIONS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFontStyle(f.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    fontStyle === f.id
                      ? 'bg-[#29104A] border-[#FFD700] shadow-[0_0_16px_rgba(255,215,0,0.25)]'
                      : 'bg-[#0D0618]/70 border-[#FFD700]/25 hover:border-[#FFD700]/60'
                  }`}
                >
                  <span className="block text-xs font-bold text-[#FFD700]">{f.name}</span>
                  <span className="block text-xs text-[#FFF4DC] mt-0.5 truncate">{f.sample}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Festive Background Selection */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#FFD700] flex items-center gap-1.5 mb-2">
              <Palette className="w-4 h-4 shrink-0" />
              <span>5. Night Sky Backdrop</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CARD_BACKGROUNDS.map((bg) => (
                <button
                  key={bg.id}
                  type="button"
                  onClick={() => setBgTheme(bg.id)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    bgTheme === bg.id
                      ? 'border-[#FFD700] ring-2 ring-[#FFD700]/50'
                      : 'border-[#FFD700]/25 opacity-80 hover:opacity-100'
                  }`}
                  style={{
                    background: `linear-gradient(135deg, ${bg.secondary}, ${bg.primary})`,
                  }}
                >
                  <span className="block text-[11px] font-bold text-[#FFF4DC] truncate">
                    {bg.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 5. Text Light Glow Color & Animation Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-[#FFD700] mb-2">
                6. Glow Color
              </span>
              <div className="flex items-center gap-2.5">
                {GLOW_PALETTES.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setGlowColor(c.value)}
                    title={c.name}
                    aria-label={c.name}
                    className={`w-8 h-8 rounded-full border-2 transition-transform ${
                      glowColor === c.value
                        ? 'border-white scale-110 shadow-[0_0_14px_#FFD700]'
                        : 'border-[#FFD700]/40 hover:scale-105'
                    }`}
                    style={{ backgroundColor: c.value }}
                  />
                ))}
              </div>
            </div>

            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-[#FFD700] mb-2">
                7. Light Motion
              </span>
              <button
                type="button"
                onClick={() => setAnimateSparkles((prev) => !prev)}
                className="w-full py-2 px-3 rounded-xl border border-[#FFD700]/40 bg-[#0D0618]/80 text-xs font-bold text-[#FFD700] flex items-center justify-center gap-1.5"
              >
                {animateSparkles ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{animateSparkles ? 'Twinkling On ✨' : 'Paused'}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
