import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Menu,
  X,
  Flame,
  Star,
  Camera,
  Gift,
  Home,
  Info,
  Music,
  Volume2,
  VolumeX,
} from 'lucide-react';
import DiyaSvg from './DiyaSvg';
import { trackAnalyticsEvent } from '../lib/supabase';
import { soundManager } from '../utils/soundEngine';

const NAV_ITEMS = [
  { name: 'Home', path: '/', icon: Home },
  { name: 'Wishes', path: '/wishes', icon: Gift },
  { name: 'Name in Lights', path: '/name-in-lights', icon: Star },
  { name: 'Photo Frames', path: '/photo-frames', icon: Camera },
  { name: 'Fireworks', path: '/fireworks', icon: Flame },
  { name: 'About', path: '/about', icon: Info },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [soundState, setSoundState] = useState({
    sfxEnabled: soundManager.sfxEnabled,
    musicEnabled: soundManager.musicEnabled,
  });
  const location = useLocation();

  useEffect(() => {
    const unsub = soundManager.subscribe(setSoundState);
    return unsub;
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const triggerFestiveShower = () => {
    soundManager.playCelebrationChime();
    trackAnalyticsEvent('navbar_sparkle_burst', location.pathname);
    confetti({
      particleCount: 65,
      spread: 80,
      origin: { y: 0.15 },
      colors: ['#FFD700', '#FF8C00', '#FFF4DC', '#E11D48'],
    });
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0D0618]/90 backdrop-blur-xl border-b border-[#FFD700]/30 shadow-[0_8px_32px_rgba(0,0,0,0.65)]'
          : 'bg-gradient-to-b from-[#0D0618]/90 to-transparent border-b border-[#FFD700]/15'
      }`}
    >
      <nav
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between"
        aria-label="Main Navigation"
      >
        {/* Brand Logo: DiwaliWala 🪔 */}
        <Link
          to="/"
          className="flex items-center gap-2.5 group focus:outline-none"
          aria-label="DiwaliWala Home"
        >
          <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-[#29104A]/80 border border-[#FFD700]/45 shadow-[0_0_20px_rgba(255,215,0,0.25)] group-hover:border-[#FFD700] transition-all">
            <DiyaSvg size={34} lit />
          </div>
          <div>
            <span className="font-display text-xl sm:text-2xl font-bold tracking-wide gold-gradient-text gold-glow-text flex items-center gap-1.5">
              DiwaliWala <span aria-hidden="true">🪔</span>
            </span>
            <span className="block text-[10px] uppercase tracking-[0.22em] text-[#FFF4DC]/65 font-medium">
              Festival of Lights
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-1.5 bg-[#160B2D]/75 border border-[#FFD700]/25 rounded-full px-3 py-1.5 backdrop-blur-md">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-[#0D0618] shadow-[0_0_20px_rgba(255,215,0,0.45)]'
                      : 'text-[#FFF4DC]/85 hover:text-[#FFD700] hover:bg-[#29104A]/60'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Right Actions: Festive Music, Sound FX, Golden Sparkle Burst & Mobile Menu */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <button
            type="button"
            onClick={() => soundManager.toggleMusic()}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold border transition-all ${
              soundState.musicEnabled
                ? 'bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-[#0D0618] border-[#FFD700] shadow-[0_0_16px_rgba(255,215,0,0.45)]'
                : 'bg-[#160B2D]/85 border-[#FFD700]/40 text-[#FFF4DC] hover:border-[#FFD700]'
            }`}
            title="Toggle Ambient Diwali Raga Music"
          >
            <Music className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">
              {soundState.musicEnabled ? 'Music: ON' : 'Festive Music'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => soundManager.toggleSfx()}
            className={`p-2 rounded-full border transition-all ${
              soundState.sfxEnabled
                ? 'bg-[#29104A] border-[#FFD700]/55 text-[#FFD700]'
                : 'bg-[#0D0618]/80 border-[#FFD700]/25 text-[#FFF4DC]/50'
            }`}
            title={soundState.sfxEnabled ? 'Sound Effects: ON' : 'Sound Effects: Muted'}
            aria-label="Toggle Sound Effects"
          >
            {soundState.sfxEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>

          <button
            type="button"
            onClick={triggerFestiveShower}
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-full text-xs btn-festive-outline"
            title="Shower Golden Blessings"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FFD700]" />
            <span>Shower Gold</span>
          </button>

          <Link
            to="/wishes"
            className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm btn-royal-gold"
          >
            <span>Create Wish</span>
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="lg:hidden inline-flex items-center justify-center p-2.5 rounded-xl bg-[#29104A]/80 border border-[#FFD700]/40 text-[#FFD700] hover:bg-[#29104A] transition-colors"
            aria-expanded={mobileOpen}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden overflow-hidden bg-[#160B2D]/95 backdrop-blur-2xl border-b border-[#FFD700]/30"
          >
            <div className="px-4 pt-3 pb-6 space-y-2">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/'}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-[#0D0618] shadow-lg'
                          : 'text-[#FFF4DC] hover:bg-[#29104A]/70 hover:text-[#FFD700]'
                      }`
                    }
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    triggerFestiveShower();
                    setMobileOpen(false);
                  }}
                  className="flex-1 py-3 rounded-xl text-sm btn-festive-outline flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-[#FFD700]" />
                  <span>Shower Blessings</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

