import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ShieldCheck,
  Mail,
  Share2,
  Sparkles,
  X,
  Heart,
  Database,
  ExternalLink,
} from 'lucide-react';
import DiyaSvg from './DiyaSvg';
import { getSupabaseStatus } from '../lib/supabase';
import { shareViaWhatsApp } from '../utils/shareUtils';
import { useToast } from '../context/ToastContext';

export default function Footer() {
  const [activeModal, setActiveModal] = useState(null); // 'privacy' | 'contact' | null
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const { addToast } = useToast();
  const supabaseStatus = getSupabaseStatus();

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactForm.name.trim() || !contactForm.message.trim()) {
      addToast({
        title: 'Missing Details',
        message: 'Please enter your name and festive message.',
        type: 'error',
      });
      return;
    }
    addToast({
      title: 'Message Sent! 🪔',
      message: `Thank you ${contactForm.name.trim()}! Wishing you a bright and joyous Diwali!`,
      type: 'festive',
    });
    setContactForm({ name: '', email: '', message: '' });
    setActiveModal(null);
  };

  return (
    <footer className="relative z-10 mt-20 border-t border-[#FFD700]/25 bg-[#0D0618]/90 backdrop-blur-xl">
      {/* Top Golden Shimmer Line */}
      <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#FFD700] to-transparent opacity-60" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1: About DiwaliWala */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <DiyaSvg size={36} lit />
              <span className="font-display text-2xl font-bold gold-gradient-text">
                DiwaliWala 🪔
              </span>
            </Link>
            <p className="text-sm text-[#FFF4DC]/75 leading-relaxed">
              Experience the royal magic of India&apos;s Festival of Lights. Create personalized
              Hindi &amp; English greeting cards, glowing Name in Lights stories, custom Diwali
              photo frames, and interactive 60FPS fireworks.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#160B2D] border border-[#FFD700]/30 text-xs text-[#FFF4DC]/85">
              <Database className="w-3.5 h-3.5 text-[#FFD700]" />
              <span>
                Backend:{' '}
                {supabaseStatus.configured ? 'Supabase Cloud Connected' : 'Local-First + Supabase Ready'}
              </span>
            </div>
          </div>

          {/* Column 2: Festive Experiences */}
          <div>
            <h3 className="font-display text-base font-bold text-[#FFD700] tracking-wider uppercase mb-4">
              Festive Experiences
            </h3>
            <ul className="space-y-2.5 text-sm text-[#FFF4DC]/80">
              <li>
                <Link to="/wishes" className="hover:text-[#FFD700] transition-colors flex items-center gap-2">
                  <span>✨ Diwali Wish Generator</span>
                </Link>
              </li>
              <li>
                <Link to="/name-in-lights" className="hover:text-[#FFD700] transition-colors flex items-center gap-2">
                  <span>🏮 Name in Lights Studio</span>
                </Link>
              </li>
              <li>
                <Link to="/photo-frames" className="hover:text-[#FFD700] transition-colors flex items-center gap-2">
                  <span>🖼️ Royal Photo Frame Maker</span>
                </Link>
              </li>
              <li>
                <Link to="/fireworks" className="hover:text-[#FFD700] transition-colors flex items-center gap-2">
                  <span>🎆 Interactive Fireworks Simulator</span>
                </Link>
              </li>
              <li>
                <Link to="/#countdown" className="hover:text-[#FFD700] transition-colors flex items-center gap-2">
                  <span>⏳ Live Maha Deepavali Countdown</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Links, Privacy Policy & Contact */}
          <div>
            <h3 className="font-display text-base font-bold text-[#FFD700] tracking-wider uppercase mb-4">
              About &amp; Policies
            </h3>
            <ul className="space-y-2.5 text-sm text-[#FFF4DC]/80">
              <li>
                <Link to="/about" className="hover:text-[#FFD700] transition-colors">
                  About DiwaliWala
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveModal('privacy')}
                  className="hover:text-[#FFD700] transition-colors text-left flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4 text-[#FFD700]" />
                  <span>Privacy Policy (100% Private Photos)</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => setActiveModal('contact')}
                  className="hover:text-[#FFD700] transition-colors text-left flex items-center gap-1.5"
                >
                  <Mail className="w-4 h-4 text-[#FF8C00]" />
                  <span>Contact Us &amp; Feedback</span>
                </button>
              </li>
              <li>
                <a
                  href="/sitemap.xml"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#FFD700] transition-colors inline-flex items-center gap-1"
                >
                  <span>XML Sitemap</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Social Media & Instant Share */}
          <div>
            <h3 className="font-display text-base font-bold text-[#FFD700] tracking-wider uppercase mb-4">
              Share the Light
            </h3>
            <p className="text-xs text-[#FFF4DC]/75 mb-4 leading-relaxed">
              Invite your family &amp; friends to create their own personalized Diwali wishes and light
              virtual diyas together!
            </p>
            <button
              type="button"
              onClick={() =>
                shareViaWhatsApp(
                  '🪔 Celebrate the Magic of Diwali on DiwaliWala! Create personalized Diwali wishes, Name in Lights & Photo Frames: https://diwaliwala.vercel.app'
                )
              }
              className="w-full py-2.5 px-4 rounded-xl btn-royal-gold text-sm flex items-center justify-center gap-2 mb-4"
            >
              <Share2 className="w-4 h-4" />
              <span>Share on WhatsApp</span>
            </button>

            <div className="flex items-center gap-3">
              {[
                { label: 'Instagram', href: 'https://instagram.com', tag: 'IG' },
                { label: 'Twitter / X', href: 'https://x.com', tag: 'X' },
                { label: 'YouTube', href: 'https://youtube.com', tag: 'YT' },
                { label: 'WhatsApp', href: 'https://api.whatsapp.com', tag: 'WA' },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-10 h-10 rounded-xl bg-[#160B2D] border border-[#FFD700]/30 flex items-center justify-center text-xs font-bold text-[#FFD700] hover:bg-[#FFD700] hover:text-[#0D0618] transition-all"
                >
                  {social.tag}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="mt-12 pt-8 border-t border-[#FFD700]/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#FFF4DC]/65">
          <p>
            © {new Date().getFullYear()} <strong className="text-[#FFD700]">DiwaliWala 🪔</strong>. All
            rights reserved. Shubh Deepavali!
          </p>
          <p className="flex items-center gap-1.5">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-[#FF8C00] fill-[#FF8C00]" />
            <span>for the Festival of Lights</span>
          </p>
        </div>
      </div>

      {/* Privacy Policy & Contact Modals */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-black/75 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setActiveModal(null)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card max-w-lg w-full rounded-3xl p-6 sm:p-8 border border-[#FFD700]/45 relative"
            >
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="absolute top-5 right-5 p-2 rounded-full bg-[#160B2D] text-[#FFF4DC]/70 hover:text-[#FFD700]"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              {activeModal === 'privacy' ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2.5 text-[#FFD700]">
                    <ShieldCheck className="w-6 h-6" />
                    <h3 className="font-display text-xl font-bold">Privacy Policy &amp; Data Protection</h3>
                  </div>
                  <p className="text-sm text-[#FFF4DC]/85 leading-relaxed">
                    At <strong>DiwaliWala</strong>, your privacy and family moments are sacred:
                  </p>
                  <ul className="space-y-2.5 text-xs sm:text-sm text-[#FFF4DC]/80 list-disc pl-5">
                    <li>
                      <strong>100% Client-Side Photo Processing:</strong> Photos uploaded in the Photo
                      Frame Maker are processed directly inside your browser using HTML5 Canvas. We{' '}
                      <strong>never</strong> upload private photos to Supabase or any external server by
                      default.
                    </li>
                    <li>
                      <strong>Opt-In Cloud Saving Only:</strong> Generated cards are only uploaded to
                      cloud storage if you explicitly click the optional &ldquo;Save Cloud Link&rdquo;
                      button.
                    </li>
                    <li>
                      <strong>Row-Level Security (RLS):</strong> All Supabase database tables enforce
                      strict PostgreSQL Row-Level Security policies and input sanitization.
                    </li>
                  </ul>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="w-full py-2.5 rounded-xl btn-royal-gold text-sm"
                    >
                      Got It, Continue Celebrating
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="flex items-center gap-2.5 text-[#FFD700]">
                    <Sparkles className="w-6 h-6" />
                    <h3 className="font-display text-xl font-bold">Contact DiwaliWala Team</h3>
                  </div>
                  <p className="text-xs sm:text-sm text-[#FFF4DC]/80">
                    Have a suggestion for a new Diwali frame, greeting template, or feature? Send us a
                    note!
                  </p>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#FFD700] mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={60}
                      value={contactForm.name}
                      onChange={(e) => setContactForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="e.g., Adnan Khan"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0D0618]/90 border border-[#FFD700]/35 text-sm text-[#FFF4DC] focus:outline-none focus:border-[#FFD700]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#FFD700] mb-1">
                      Email (Optional)
                    </label>
                    <input
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm((p) => ({ ...p, email: e.target.value }))}
                      placeholder="you@example.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0D0618]/90 border border-[#FFD700]/35 text-sm text-[#FFF4DC] focus:outline-none focus:border-[#FFD700]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#FFD700] mb-1">
                      Your Message *
                    </label>
                    <textarea
                      rows={3}
                      required
                      maxLength={400}
                      value={contactForm.message}
                      onChange={(e) => setContactForm((p) => ({ ...p, message: e.target.value }))}
                      placeholder="Share your feedback or Diwali greetings..."
                      className="w-full px-4 py-2.5 rounded-xl bg-[#0D0618]/90 border border-[#FFD700]/35 text-sm text-[#FFF4DC] focus:outline-none focus:border-[#FFD700]"
                    />
                  </div>
                  <button type="submit" className="w-full py-3 rounded-xl btn-royal-gold text-sm">
                    Send Festive Message 🪔
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </footer>
  );
}

