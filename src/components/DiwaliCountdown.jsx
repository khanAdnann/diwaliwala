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
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <section
      id="countdown"
      className="relative py-8 sm:py-14 px-3 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full overflow-x-hidden"
      aria-label="Diwali Countdown Timer"
    >
      <div className="glass-card ornate-border rounded-2xl sm:rounded-3xl p-4 sm:p-8 lg:p-12 relative overflow-hidden">
        {/* Ambient Golden Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 sm:w-96 h-48 bg-[#FFD700]/15 blur-[90px] pointer-events-none" />

        {/* Header Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 sm:mb-10 text-center md:text-left">
          <div className="flex items-center gap-3">
            <DiyaSvg size={44} lit className="hidden sm:block shrink-0" />
            <div>
              <div className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs uppercase tracking-[0.2em] text-[#FFD700] font-bold mb-1">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>Sacred Muhurat Countdown</span>
              </div>
              <h2 className="font-display text-xl sm:text-3xl lg:text-4xl font-bold gold-gradient-text leading-tight">
                Countdown to Maha Deepavali 🪔
              </h2>
              <p className="text-xs sm:text-sm text-[#FFF4DC]/75 mt-1">
                Celebrating on <span className="text-[#FFD700] font-semibold">{formattedTargetDate}</span>
              </p>
            </div>
          </div>

          {/* Configurable Festival Date Switcher - Full width on mobile, never overflows */}
          <div className="w-full md:w-auto flex items-center gap-2 bg-[#0D0618]/85 border border-[#FFD700]/35 rounded-xl sm:rounded-2xl px-3 py-2.5 max-w-full">
            <Calendar className="w-4 h-4 text-[#FFD700] shrink-0" />
            <label htmlFor="festival-date-select" className="sr-only">
              Select Festival Event Date
            </label>
            <select
              id="festival-date-select"
              value={selectedPreset}
              onChange={(e) => setSelectedPreset(e.target.value)}
              className="w-full bg-transparent text-xs sm:text-sm text-[#FFF4DC] font-medium focus:outline-none cursor-pointer truncate"
            >
              <option value="" className="bg-[#160B2D] text-[#FFF4DC]">
                Target: {formattedTargetDate}
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {timeUnits.map((unit) => (
            <div
              key={unit.label}
              className="relative rounded-2xl bg-gradient-to-b from-[#29104A]/90 via-[#160B2D]/95 to-[#0D0618] border border-[#FFD700]/45 p-4 sm:p-7 text-center shadow-[0_0_24px_rgba(255,215,0,0.14)] group hover:border-[#FFD700] transition-all"
            >
              <span className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-[#FFD700]/60" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#FFD700]/60" />
              <span className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full bg-[#FFD700]/60" />
              <span className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-[#FFD700]/60" />

              <div className="h-12 sm:h-20 flex items-center justify-center overflow-hidden">
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={unit.value}
                    initial={{ y: 20, opacity: 0, scale: 0.92 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: -20, opacity: 0, scale: 0.92 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="font-display text-3xl sm:text-5xl lg:text-6xl font-black gold-gradient-text gold-glow-text tracking-wider block"
                  >
                    {unit.value}
                  </motion.span>
                </AnimatePresence>
              </div>

              <div className="mt-2 pt-2 border-t border-[#FFD700]/20 flex items-center justify-center gap-1.5">
                <span className="text-[11px] sm:text-sm font-bold uppercase tracking-widest text-[#FFF4DC]">
                  {unit.label}
                </span>
                <span className="text-[10px] sm:text-xs text-[#FFD700]/80 font-hindiSans">
                  ({unit.hindi})
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Decorative Diyas Bar */}
        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-[#FFD700]/20 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left text-xs sm:text-sm text-[#FFF4DC]/80">
          <div className="flex items-center justify-center gap-2">
            <DiyaSvg size={24} lit className="shrink-0" />
            <span>
              {timeLeft.isArrived
                ? '🎉 Shubh Deepavali! The Festival of Lights is Here!'
                : 'Every passing second brings us closer to the glow of a million diyas.'}
            </span>
          </div>
          <span className="text-[#FFD700] font-semibold text-xs">
            ✨ तमसो मा ज्योतिर्गमय • From Darkness to Light
          </span>
        </div>
      </div>
    </section>
  );
}
