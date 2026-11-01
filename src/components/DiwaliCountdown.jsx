import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Sparkles } from 'lucide-react';
import { getConfigurableDiwaliDate, FESTIVAL_PRESET_DATES } from '../config/festivalConfig';
import DiyaSvg from './DiyaSvg';

function calculateRemainingTime(targetDate) {
  const now = Date.now();
  const target = targetDate.getTime();
  const diff = Math.max(0, target - now);

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / 1000 / 60) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return {
    days: String(days).padStart(2, '0'),
    hours: String(hours).padStart(2, '0'),
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0'),
    isArrived: diff === 0,
  };
}

export default function DiwaliCountdown() {
  const [selectedPreset, setSelectedPreset] = useState('');
  const [targetDate, setTargetDate] = useState(() => getConfigurableDiwaliDate());
  const [timeLeft, setTimeLeft] = useState(() =>
    calculateRemainingTime(getConfigurableDiwaliDate())
  );

  useEffect(() => {
    const resolved = getConfigurableDiwaliDate(selectedPreset || null);
    setTargetDate(resolved);
    setTimeLeft(calculateRemainingTime(resolved));

    const timer = setInterval(() => {
      setTimeLeft(calculateRemainingTime(resolved));
    }, 1000);

    return () => clearInterval(timer);
  }, [selectedPreset]);

  const timeUnits = [
    { label: 'Days', hindi: 'दिन', value: timeLeft.days },
    { label: 'Hours', hindi: 'घंटे', value: timeLeft.hours },
    { label: 'Minutes', hindi: 'मिनट', value: timeLeft.minutes },
    { label: 'Seconds', hindi: 'सेकंड', value: timeLeft.seconds },
  ];

  const formattedTargetDate = targetDate.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <section
      id="countdown"
      className="relative py-14 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto"
      aria-label="Diwali Countdown Timer"
    >
      <div className="glass-card ornate-border rounded-3xl p-6 sm:p-10 lg:p-12 relative overflow-hidden">
        {/* Ambient Golden Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-[#FFD700]/15 blur-[90px] pointer-events-none" />

        {/* Header Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10 text-center md:text-left">
          <div className="flex items-center gap-3">
            <DiyaSvg size={48} lit className="hidden sm:block" />
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.22em] text-[#FFD700] font-bold mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Sacred Muhurat Countdown</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold gold-gradient-text">
                Countdown to Maha Deepavali 🪔
              </h2>
              <p className="text-xs sm:text-sm text-[#FFF4DC]/75 mt-1">
                Celebrating on <span className="text-[#FFD700] font-semibold">{formattedTargetDate}</span>
              </p>
            </div>
          </div>

          {/* Configurable Festival Date Switcher */}
          <div className="flex items-center gap-2 bg-[#0D0618]/85 border border-[#FFD700]/35 rounded-2xl px-3.5 py-2">
            <Calendar className="w-4 h-4 text-[#FFD700] shrink-0" />
            <label htmlFor="festival-date-select" className="sr-only">
              Select Festival Event Date
            </label>
            <select
              id="festival-date-select"
              value={selectedPreset}
              onChange={(e) => setSelectedPreset(e.target.value)}
              className="bg-transparent text-xs sm:text-sm text-[#FFF4DC] font-medium focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-[#160B2D] text-[#FFF4DC]">
                Default Target ({formattedTargetDate})
              </option>
              {FESTIVAL_PRESET_DATES.map((preset) => (
                <option
                  key={preset.value}
                  value={preset.value}
                  className="bg-[#160B2D] text-[#FFF4DC]"
                >
                  {preset.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 4 Golden Glowing Timer Cards: Days | Hours | Minutes | Seconds */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {timeUnits.map((unit) => (
            <div
              key={unit.label}
              className="relative rounded-2xl bg-gradient-to-b from-[#29104A]/90 via-[#160B2D]/95 to-[#0D0618] border border-[#FFD700]/45 p-5 sm:p-7 text-center shadow-[0_0_30px_rgba(255,215,0,0.14)] group hover:border-[#FFD700] transition-all"
            >
              {/* Corner Golden Studs */}
              <span className="absolute top-2.5 left-2.5 w-1.5 h-1.5 rounded-full bg-[#FFD700]/60" />
              <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-[#FFD700]/60" />
              <span className="absolute bottom-2.5 left-2.5 w-1.5 h-1.5 rounded-full bg-[#FFD700]/60" />
              <span className="absolute bottom-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-[#FFD700]/60" />

              <div className="h-16 sm:h-20 flex items-center justify-center overflow-hidden">
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={unit.value}
                    initial={{ y: 24, opacity: 0, scale: 0.9 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: -24, opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.28, ease: 'easeOut' }}
                    className="font-display text-4xl sm:text-5xl lg:text-6xl font-black gold-gradient-text gold-glow-text tracking-wider block"
                  >
                    {unit.value}
                  </motion.span>
                </AnimatePresence>
              </div>

              <div className="mt-2 pt-2 border-t border-[#FFD700]/20 flex items-center justify-center gap-2">
                <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-[#FFF4DC]">
                  {unit.label}
                </span>
                <span className="text-xs text-[#FFD700]/80 font-hindiSans">({unit.hindi})</span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Decorative Diyas Bar */}
        <div className="mt-8 pt-6 border-t border-[#FFD700]/20 flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm text-[#FFF4DC]/80">
          <div className="flex items-center gap-2">
            <DiyaSvg size={28} lit />
            <span>
              {timeLeft.isArrived
                ? '🎉 Shubh Deepavali! The Festival of Lights is Here!'
                : 'Every passing second brings us closer to the glow of a million diyas.'}
            </span>
          </div>
          <span className="text-[#FFD700] font-semibold">
            ✨ तमसो मा ज्योतिर्गमय • Lead Us From Darkness to Light
          </span>
        </div>
      </div>
    </section>
  );
}

