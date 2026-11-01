import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Download,
  Share2,
  Copy,
  Check,
  Languages,
  Palette,
  Wand2,
  RefreshCw,
} from 'lucide-react';
import SEOHead from '../components/SEOHead';
import { CARD_BACKGROUNDS, DEFAULT_GREETING_TEMPLATES } from '../config/festivalConfig';
import {
  fetchGreetingTemplates,
  saveGeneratedWish,
  trackAnalyticsEvent,
  sanitizeUserText,
} from '../lib/supabase';
import { renderGreetingCardCanvas } from '../utils/canvasRenderer';
import {
  downloadDataUrlAsPng,
  shareViaWhatsApp,
  copyTextToClipboard,
} from '../utils/shareUtils';
import { useToast } from '../context/ToastContext';

const TEXT_COLOR_SWATCHES = [
  { label: 'Festive Cream', value: '#FFF4DC' },
  { label: 'Pure Royal Gold', value: '#FFD700' },
  { label: 'Warm Marigold', value: '#FFB703' },
  { label: 'Lotus Rose', value: '#FECDD3' },
  { label: 'Celestial White', value: '#FFFFFF' },
];

export default function WishGenerator() {
  const canvasRef = useRef(null);
  const { addToast } = useToast();

  const [templates, setTemplates] = useState(DEFAULT_GREETING_TEMPLATES);
  const [templateSource, setTemplateSource] = useState('local');
  const [loadingTemplates, setLoadingTemplates] = useState(true);

  const [language, setLanguage] = useState('en');
  const [selectedTemplateId, setSelectedTemplateId] = useState(DEFAULT_GREETING_TEMPLATES[0].id);
  const [senderName, setSenderName] = useState('Adnan');
  const [receiverName, setReceiverName] = useState('');
  const [greetingText, setGreetingText] = useState(DEFAULT_GREETING_TEMPLATES[0].greeting_text);
  const [bgTheme, setBgTheme] = useState('royal-purple');
  const [textColor, setTextColor] = useState('#FFF4DC');
  const [goldenEffects, setGoldenEffects] = useState(true);
  const [copied, setCopied] = useState(false);
  const [savingWish, setSavingWish] = useState(false);

  // Load templates from Supabase on mount
  useEffect(() => {
    trackAnalyticsEvent('page_view_wishes', '/wishes');
    let mounted = true;

    async function load() {
      setLoadingTemplates(true);
      const res = await fetchGreetingTemplates();
      if (mounted) {
        setTemplates(res.templates);
        setTemplateSource(res.source);
        setLoadingTemplates(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const filteredTemplates = templates.filter((t) => t.language === language);
  const activeTemplate =
    templates.find((t) => String(t.id) === String(selectedTemplateId)) ||
    filteredTemplates[0] ||
    templates[0];

  // Switch template when language changes
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    const matching = templates.filter((t) => t.language === newLang);
    if (matching.length > 0) {
      const first = matching[0];
      setSelectedTemplateId(first.id);
      setGreetingText(first.greeting_text);
      if (first.bg_theme) setBgTheme(first.bg_theme);
    }
  };

  const handleSelectTemplate = (tpl) => {
    setSelectedTemplateId(tpl.id);
    setGreetingText(tpl.greeting_text);
    if (tpl.bg_theme) setBgTheme(tpl.bg_theme);
  };

  // Re-render canvas whenever inputs change
  const redrawCard = useCallback(() => {
    if (!canvasRef.current) return;
    renderGreetingCardCanvas(canvasRef.current, {
      senderName: sanitizeUserText(senderName, 80) || 'Your Friend',
      receiverName: sanitizeUserText(receiverName, 80),
      greetingText: sanitizeUserText(greetingText, 300),
      language,
      bgTheme,
      textColor,
      goldenEffects,
      templateTitle: activeTemplate?.title || 'Shubh Deepavali',
    });
  }, [
    senderName,
    receiverName,
    greetingText,
    language,
    bgTheme,
    textColor,
    goldenEffects,
    activeTemplate,
  ]);

  useEffect(() => {
    redrawCard();
  }, [redrawCard]);

  // Generate & Save to Supabase + Download PNG
  const handleDownloadCard = async () => {
    if (!senderName.trim()) {
      addToast({
        title: 'Sender Name Required',
        message: 'Please enter your name so your loved ones know who sent the blessing!',
        type: 'error',
      });
      return;
    }

    try {
      setSavingWish(true);
      redrawCard();
      const dataUrl = canvasRef.current.toDataURL('image/png');
      const cleanName = sanitizeUserText(senderName, 30).toLowerCase().replace(/\s+/g, '-') || 'diwali';
      downloadDataUrlAsPng(dataUrl, `diwaliwala-wish-${cleanName}.png`);

      await saveGeneratedWish({
        senderName,
        receiverName,
        templateId: String(selectedTemplateId),
        language,
      });
      trackAnalyticsEvent('download_greeting_card', '/wishes');

      confetti({
        particleCount: 55,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FF8C00', '#FFF4DC'],
      });

      addToast({
        title: 'Greeting Card Downloaded! 🪔',
        message: 'High-resolution PNG saved to your device and logged to celebration feed.',
        type: 'festive',
      });
    } catch (err) {
      addToast({
        title: 'Download Failed',
        message: err.message || 'Could not generate PNG card.',
        type: 'error',
      });
    } finally {
      setSavingWish(false);
    }
  };

  const getFormattedShareMessage = () => {
    const cleanSender = sanitizeUserText(senderName, 60) || 'Your Friend';
    const cleanReceiver = sanitizeUserText(receiverName, 60);
    const intro = cleanReceiver
      ? language === 'hi'
        ? `🪔 *प्रिय ${cleanReceiver} जी,* \n\n`
        : `🪔 *Dearest ${cleanReceiver},* \n\n`
      : '🪔 *Shubh Deepavali!* \n\n';
    const outro =
      language === 'hi'
        ? `\n\n✨ *स्नेही:* ${cleanSender}\n🌟 अपना दिवाली कार्ड बनाएं: https://diwaliwala.vercel.app/wishes`
        : `\n\n✨ *With Warm Wishes from:* ${cleanSender}\n🌟 Create your own Diwali card: https://diwaliwala.vercel.app/wishes`;
    return `${intro}${greetingText}${outro}`;
  };

  const handleCopyGreeting = async () => {
    try {
      await copyTextToClipboard(getFormattedShareMessage());
      setCopied(true);
      trackAnalyticsEvent('copy_greeting_text', '/wishes');
      addToast({
        title: 'Greeting Copied! ✨',
        message: 'Your personalized Diwali message is ready to paste anywhere.',
        type: 'success',
      });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      addToast({
        title: 'Copy Error',
        message: 'Unable to copy automatically. Please select the text manually.',
        type: 'error',
      });
    }
  };

  const handleWhatsAppShare = async () => {
    if (senderName.trim()) {
      saveGeneratedWish({
        senderName,
        receiverName,
        templateId: String(selectedTemplateId),
        language,
      }).catch(() => {});
    }
    trackAnalyticsEvent('whatsapp_share_wish', '/wishes');
    shareViaWhatsApp(getFormattedShareMessage());
  };

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <SEOHead
        title="Diwali Wish Generator — Personalized Hindi & English Greeting Cards"
        description="Create custom Diwali greeting cards in Hindi and English with royal palace backgrounds, golden sparkles, PNG download, and instant WhatsApp sharing."
        path="/wishes"
      />

      {/* Page Heading */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#29104A] border border-[#FFD700]/40 text-xs font-bold uppercase tracking-[0.2em] text-[#FFD700] mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Personalized Festive Card Studio</span>
        </div>
        <h1 className="font-display text-3xl sm:text-5xl font-black gold-gradient-text gold-glow-text">
          Diwali Wish Generator 🪔
        </h1>
        <p className="mt-3 text-sm sm:text-base text-[#FFF4DC]/80">
          Customize royal Hindi &amp; English greeting cards, add golden particle effects, and
          download or share with loved ones on WhatsApp.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Controls & Customization Form (7 cols) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-7 glass-card ornate-border rounded-3xl p-6 sm:p-8 space-y-6"
        >
          {/* 1. Language Toggle: English vs Hindi */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-[#FFD700] flex items-center gap-1.5">
                <Languages className="w-4 h-4" />
                <span>1. Select Greeting Language</span>
              </label>
              <span className="text-[11px] text-[#FFF4DC]/60">
                Templates: {loadingTemplates ? 'Loading...' : `${filteredTemplates.length} Active (${templateSource})`}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleLanguageChange('en')}
                className={`py-3 px-4 rounded-2xl text-sm font-bold border transition-all ${
                  language === 'en'
                    ? 'bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-[#0D0618] border-[#FFD700] shadow-lg'
                    : 'bg-[#0D0618]/70 text-[#FFF4DC] border-[#FFD700]/30 hover:border-[#FFD700]'
                }`}
              >
                🇬🇧 English Greetings
              </button>
              <button
                type="button"
                onClick={() => handleLanguageChange('hi')}
                className={`py-3 px-4 rounded-2xl text-sm font-bold border transition-all font-hindiSans ${
                  language === 'hi'
                    ? 'bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-[#0D0618] border-[#FFD700] shadow-lg'
                    : 'bg-[#0D0618]/70 text-[#FFF4DC] border-[#FFD700]/30 hover:border-[#FFD700]'
                }`}
              >
                🇮🇳 हिंदी शुभकामनाएं (Hindi)
              </button>
            </div>
          </div>

          {/* 2. Sender & Receiver Name Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="sender-name-input"
                className="block text-xs font-bold uppercase tracking-wider text-[#FFD700] mb-2"
              >
                2. Sender Name (Required) *
              </label>
              <input
                id="sender-name-input"
                type="text"
                maxLength={50}
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Enter your name (e.g., Adnan)"
                className="w-full px-4 py-3 rounded-xl bg-[#0D0618]/90 border border-[#FFD700]/40 text-sm text-[#FFF4DC] placeholder-[#FFF4DC]/40 focus:outline-none focus:border-[#FFD700]"
              />
            </div>
            <div>
              <label
                htmlFor="receiver-name-input"
                className="block text-xs font-bold uppercase tracking-wider text-[#FFD700] mb-2"
              >
                3. Receiver Name (Optional)
              </label>
              <input
                id="receiver-name-input"
                type="text"
                maxLength={50}
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                placeholder="e.g., Sharma Family / Priya"
                className="w-full px-4 py-3 rounded-xl bg-[#0D0618]/90 border border-[#FFD700]/40 text-sm text-[#FFF4DC] placeholder-[#FFF4DC]/40 focus:outline-none focus:border-[#FFD700]"
              />
            </div>
          </div>

          {/* 3. Choose Greeting Template */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#FFD700] mb-2.5">
              4. Choose Greeting Template
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredTemplates.map((tpl) => {
                const isSelected = String(tpl.id) === String(selectedTemplateId);
                return (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => handleSelectTemplate(tpl)}
                    className={`p-3.5 rounded-2xl text-left border transition-all ${
                      isSelected
                        ? 'bg-[#29104A] border-[#FFD700] shadow-[0_0_20px_rgba(255,215,0,0.25)]'
                        : 'bg-[#0D0618]/65 border-[#FFD700]/20 hover:border-[#FFD700]/60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-bold text-[#FFD700]">{tpl.title}</span>
                      <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-[#160B2D] text-[#FFF4DC]/75">
                        {tpl.category}
                      </span>
                    </div>
                    <p className="text-xs text-[#FFF4DC]/85 line-clamp-2 leading-relaxed">
                      {tpl.greeting_text}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Custom Greeting Message Box */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="custom-greeting-textarea"
                className="text-xs font-bold uppercase tracking-wider text-[#FFD700]"
              >
                5. Personalize Greeting Message
              </label>
              <span className="text-[11px] text-[#FFF4DC]/60">{greetingText.length}/260</span>
            </div>
            <textarea
              id="custom-greeting-textarea"
              rows={3}
              maxLength={260}
              value={greetingText}
              onChange={(e) => setGreetingText(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#0D0618]/90 border border-[#FFD700]/40 text-sm text-[#FFF4DC] focus:outline-none focus:border-[#FFD700]"
            />
          </div>

          {/* 5. Choose Background Theme */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#FFD700] flex items-center gap-1.5 mb-2.5">
              <Palette className="w-4 h-4" />
              <span>6. Choose Royal Card Background</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {CARD_BACKGROUNDS.map((bg) => (
                <button
                  key={bg.id}
                  type="button"
                  onClick={() => setBgTheme(bg.id)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    bgTheme === bg.id
                      ? 'border-[#FFD700] ring-2 ring-[#FFD700]/50 scale-[1.02]'
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

          {/* 6. Text Color & Animated Golden Effects */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-[#FFD700] mb-2">
                7. Greeting Text Color
              </span>
              <div className="flex items-center gap-2.5">
                {TEXT_COLOR_SWATCHES.map((swatch) => (
                  <button
                    key={swatch.value}
                    type="button"
                    onClick={() => setTextColor(swatch.value)}
                    title={swatch.label}
                    aria-label={swatch.label}
                    className={`w-9 h-9 rounded-full border-2 transition-transform ${
                      textColor === swatch.value
                        ? 'border-white scale-110 shadow-[0_0_14px_#FFD700]'
                        : 'border-[#FFD700]/40 hover:scale-105'
                    }`}
                    style={{ backgroundColor: swatch.value }}
                  />
                ))}
              </div>
            </div>

            <div>
              <span className="block text-xs font-bold uppercase tracking-wider text-[#FFD700] mb-2">
                8. Golden Shimmer Effects
              </span>
              <button
                type="button"
                onClick={() => setGoldenEffects((prev) => !prev)}
                className={`w-full py-2.5 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  goldenEffects
                    ? 'bg-[#FFD700]/20 border-[#FFD700] text-[#FFD700]'
                    : 'bg-[#0D0618]/70 border-[#FFD700]/30 text-[#FFF4DC]/70'
                }`}
              >
                <Wand2 className="w-4 h-4" />
                <span>{goldenEffects ? 'Golden Sparkles Enabled ✨' : 'Enable Golden Sparkles'}</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* RIGHT COLUMN: Live Canvas Preview & Export Actions (5 cols) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-5 lg:sticky lg:top-24 space-y-5"
        >
          <div className="glass-card ornate-border rounded-3xl p-5 sm:p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#FFD700] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Live HD Card Preview (1080×1080)</span>
              </span>
              <button
                type="button"
                onClick={redrawCard}
                className="text-xs text-[#FFF4DC]/75 hover:text-[#FFD700] flex items-center gap-1"
                title="Refresh Canvas"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh</span>
              </button>
            </div>

            {/* Canvas Container */}
            <div className="relative rounded-2xl overflow-hidden border-2 border-[#FFD700]/50 shadow-[0_0_40px_rgba(0,0,0,0.8)] bg-[#0D0618] aspect-square">
              <canvas
                ref={canvasRef}
                className="w-full h-full object-contain block"
                aria-label="Personalized Diwali Greeting Card Preview"
              />
            </div>

            {/* Action Buttons: Download PNG, Share WhatsApp, Copy Text */}
            <div className="mt-5 space-y-3">
              <button
                type="button"
                disabled={savingWish}
                onClick={handleDownloadCard}
                className="w-full py-3.5 px-5 rounded-2xl btn-royal-gold text-sm sm:text-base flex items-center justify-center gap-2.5 disabled:opacity-60"
              >
                <Download className="w-5 h-5" />
                <span>{savingWish ? 'Rendering HD PNG...' : 'Download Greeting Card (PNG)'}</span>
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleWhatsAppShare}
                  className="py-3 px-4 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/60 text-[#FFF4DC] font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all"
                >
                  <Share2 className="w-4 h-4 text-[#25D366]" />
                  <span>Share on WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyGreeting}
                  className="py-3 px-4 rounded-xl btn-festive-outline text-xs sm:text-sm flex items-center justify-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-[#FFD700]" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-[#FFD700]" />
                      <span>Copy Greeting Text</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

