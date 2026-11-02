import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Flame,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Sparkles,
  Play,
  Hand,
  Trash2,
} from 'lucide-react';
import SEOHead from '../components/SEOHead';
import { trackAnalyticsEvent } from '../lib/supabase';
import { useToast } from '../context/ToastContext';
import { soundManager } from '../utils/soundEngine';

const FIREWORK_PATTERNS = [
  { id: 'random', label: '🎲 Mix' },
  { id: 'sphere', label: '🏵️ Sphere' },
  { id: 'ring', label: '⭕ Chakra' },
  { id: 'willow', label: '🌴 Willow' },
  { id: 'heart', label: '💛 Heart' },
  { id: 'star', label: '⭐ Star' },
];

const COLOR_MODES = [
  { id: 'festival', label: 'Gold & Saffron', colors: ['#FFD700', '#FF8C00', '#FFF4DC', '#F59E0B'] },
  { id: 'navratri', label: 'Royal Multicolor', colors: ['#FFD700', '#FB7185', '#38BDF8', '#4ADE80', '#C084FC'] },
  { id: 'crimson', label: 'Ruby & Gold', colors: ['#F43F5E', '#FFD700', '#FB923C', '#FFF4DC'] },
  { id: 'peacock', label: 'Emerald & Cyan', colors: ['#10B981', '#06B6D4', '#FFD700', '#FFF4DC'] },
];

export default function FireworksSimulator() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const rocketsRef = useRef([]);
  const particlesRef = useRef([]);
  const isMobileRef = useRef(typeof window !== 'undefined' && window.innerWidth < 768);
  const { addToast } = useToast();

  const [mode, setMode] = useState('auto');
  const [pattern, setPattern] = useState('random');
  const [colorModeId, setColorModeId] = useState('festival');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [burstCount, setBurstCount] = useState(0);

  const soundRef = useRef(soundEnabled);
  soundRef.current = soundEnabled;
  const patternRef = useRef(pattern);
  patternRef.current = pattern;
  const colorModeRef = useRef(colorModeId);
  colorModeRef.current = colorModeId;

  useEffect(() => {
    trackAnalyticsEvent('page_view_fireworks', '/fireworks');
  }, []);

  // High-performance explosion generator with mobile-adaptive particle counts
  const createExplosion = useCallback((x, y, forcedPattern = null) => {
    const isMobile = isMobileRef.current;
    const maxPool = isMobile ? 220 : 480;

    // Trim oldest particles if pool is near capacity to guarantee 60FPS on phones
    if (particlesRef.current.length > maxPool) {
      particlesRef.current.length = maxPool;
    }

    const paletteObj =
      COLOR_MODES.find((c) => c.id === colorModeRef.current) || COLOR_MODES[0];
    const palette = paletteObj.colors;
    const activePattern =
      (forcedPattern || patternRef.current) === 'random'
        ? ['sphere', 'ring', 'willow', 'heart', 'star'][Math.floor(Math.random() * 5)]
        : forcedPattern || patternRef.current;

    const count = isMobile
      ? activePattern === 'willow'
        ? 42
        : 36
      : activePattern === 'willow'
      ? 72
      : 60;

    for (let i = 0; i < count; i += 1) {
      const color = palette[i % palette.length];
      let vx = 0;
      let vy = 0;
      let gravity = 0.055;
      let drag = 0.98;
      let decay = isMobile ? Math.random() * 0.016 + 0.014 : Math.random() * 0.013 + 0.011;

      if (activePattern === 'sphere') {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * (isMobile ? 4.8 : 5.6) + 1.2;
        vx = Math.cos(angle) * speed;
        vy = Math.sin(angle) * speed;
      } else if (activePattern === 'ring') {
        const angle = (Math.PI * 2 * i) / count;
        const ringSpeed = i % 2 === 0 ? (isMobile ? 4.4 : 5.0) : 2.6;
        vx = Math.cos(angle) * ringSpeed;
        vy = Math.sin(angle) * ringSpeed;
      } else if (activePattern === 'willow') {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3.8 + 0.8;
        vx = Math.cos(angle) * speed;
        vy = Math.sin(angle) * speed;
        gravity = 0.08;
        drag = 0.974;
        decay = isMobile ? 0.012 : 0.009;
      } else if (activePattern === 'heart') {
        const t = (Math.PI * 2 * i) / count;
        const hx = 16 * Math.pow(Math.sin(t), 3);
        const hy = -(
          13 * Math.cos(t) -
          5 * Math.cos(2 * t) -
          2 * Math.cos(3 * t) -
          Math.cos(4 * t)
        );
        const scale = isMobile ? 0.22 : 0.26;
        vx = hx * scale + (Math.random() - 0.5) * 0.35;
        vy = hy * scale + (Math.random() - 0.5) * 0.35;
      } else if (activePattern === 'star') {
        const points = 5;
        const angle = (Math.PI * 2 * i) / count;
        const starFactor = 1 + 0.55 * Math.cos(points * angle);
        const speed = (isMobile ? 3.1 : 3.6) * starFactor;
        vx = Math.cos(angle) * speed;
        vy = Math.sin(angle) * speed;
      }

      particlesRef.current.push({
        x,
        y,
        prevX: x,
        prevY: y,
        vx,
        vy,
        color,
        alpha: 1,
        decay,
        gravity,
        drag,
        radius: isMobile ? 2.0 : 2.2,
      });
    }

    // Core Golden Sparkles
    const coreCount = isMobile ? 8 : 14;
    for (let s = 0; s < coreCount; s += 1) {
      const a = (Math.PI * 2 * s) / coreCount;
      const sp = Math.random() * 2.0 + 0.5;
      particlesRef.current.push({
        x,
        y,
        prevX: x,
        prevY: y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        color: '#FFF4DC',
        alpha: 1,
        decay: 0.028,
        gravity: 0.03,
        drag: 0.98,
        radius: 1.8,
      });
    }

    if (soundRef.current) {
      soundManager.playFireworkExplosionSound();
    }

    setBurstCount((c) => c + 1);
  }, []);

  const launchRocket = useCallback((targetX, targetY) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (rocketsRef.current.length > 10) return;

    const startX = canvas.width * 0.2 + Math.random() * (canvas.width * 0.6);
    const startY = canvas.height;
    const angle = Math.atan2(targetY - startY, targetX - startX);
    const distance = Math.hypot(targetX - startX, targetY - startY);
    const speed = Math.max(12, Math.min(18, distance / 24));

    if (soundRef.current) {
      soundManager.playRocketLaunchSound();
    }

    rocketsRef.current.push({
      x: startX,
      y: startY,
      prevX: startX,
      prevY: startY,
      targetX,
      targetY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
    });
  }, []);

  // Ultra-fast 60FPS Canvas Render Loop (No shadowBlur, additive 'lighter' blending, O(1) swap-and-pop)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d', { alpha: false });
    let animId;

    const updateCanvasSize = () => {
      if (!canvas || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      isMobileRef.current = window.innerWidth < 768;
      canvas.width = rect.width || window.innerWidth;
      canvas.height = rect.height || 520;
      ctx.fillStyle = '#0D0618';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize, { passive: true });

    // Initial launch
    const initTimer = setTimeout(() => {
      if (!canvasRef.current) return;
      const w = canvasRef.current.width;
      const h = canvasRef.current.height;
      launchRocket(w * 0.35, h * 0.3);
      launchRocket(w * 0.65, h * 0.26);
    }, 200);

    const renderLoop = () => {
      // 1. Fast trail fade using source-over
      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1;
      ctx.fillStyle = 'rgba(13, 6, 24, 0.26)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 2. Switch to hardware-accelerated additive glow ('lighter') — 0% blur cost!
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';

      // 3. Update & Draw Rockets
      const rockets = rocketsRef.current;
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 2.5;
      for (let r = rockets.length - 1; r >= 0; r -= 1) {
        const rk = rockets[r];
        rk.prevX = rk.x;
        rk.prevY = rk.y;
        rk.x += rk.vx;
        rk.y += rk.vy;

        ctx.globalAlpha = 0.95;
        ctx.beginPath();
        ctx.moveTo(rk.prevX, rk.prevY);
        ctx.lineTo(rk.x, rk.y);
        ctx.stroke();

        const distToTarget = Math.hypot(rk.targetX - rk.x, rk.targetY - rk.y);
        if (distToTarget < 20 || rk.y <= rk.targetY || rk.vy >= 0) {
          createExplosion(rk.x, rk.y);
          rockets[r] = rockets[rockets.length - 1];
          rockets.pop();
        }
      }

      // 4. Update & Draw Particles (O(1) swap-and-pop removal)
      const particles = particlesRef.current;
      for (let p = particles.length - 1; p >= 0; p -= 1) {
        const pt = particles[p];
        pt.prevX = pt.x;
        pt.prevY = pt.y;
        pt.vx *= pt.drag;
        pt.vy *= pt.drag;
        pt.vy += pt.gravity;
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.alpha -= pt.decay;

        if (pt.alpha <= 0.03) {
          particles[p] = particles[particles.length - 1];
          particles.pop();
          continue;
        }

        ctx.globalAlpha = pt.alpha;
        ctx.strokeStyle = pt.color;
        ctx.lineWidth = pt.radius;
        ctx.beginPath();
        ctx.moveTo(pt.prevX, pt.prevY);
        ctx.lineTo(pt.x, pt.y);
        ctx.stroke();
      }

      animId = window.requestAnimationFrame(renderLoop);
    };

    animId = window.requestAnimationFrame(renderLoop);

    return () => {
      clearTimeout(initTimer);
      window.removeEventListener('resize', updateCanvasSize);
      window.cancelAnimationFrame(animId);
    };
  }, [createExplosion, launchRocket]);

  // Adaptive auto-launch interval (slower on mobile to keep frame times low)
  useEffect(() => {
    if (mode !== 'auto') return undefined;
    const delay = isMobileRef.current ? 1200 : 920;
    const interval = setInterval(() => {
      const canvas = canvasRef.current;
      if (!canvas || document.hidden) return;
      const tx = canvas.width * 0.15 + Math.random() * (canvas.width * 0.7);
      const ty = canvas.height * 0.15 + Math.random() * (canvas.height * 0.4);
      launchRocket(tx, ty);
    }, delay);

    return () => clearInterval(interval);
  }, [mode, launchRocket]);

  const handleCanvasPointerDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    launchRocket(x, y);
  };

  const handleGrandFinale = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    trackAnalyticsEvent('fireworks_grand_finale', '/fireworks');
    const rocketCount = isMobileRef.current ? 5 : 8;
    for (let i = 0; i < rocketCount; i += 1) {
      setTimeout(() => {
        if (!canvasRef.current) return;
        const tx = canvas.width * (0.15 + (i * 0.7) / Math.max(1, rocketCount - 1));
        const ty = canvas.height * (0.18 + (i % 3) * 0.1);
        launchRocket(tx, ty);
      }, i * 130);
    }
  };

  const handleToggleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      addToast({
        title: 'Fullscreen Notice',
        message: 'Fullscreen mode is restricted by your current browser window.',
        type: 'info',
      });
    }
  };

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  return (
    <div className="py-6 sm:py-8 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full overflow-x-hidden">
      <SEOHead
        title="Interactive Diwali Fireworks Simulator — Full-Screen 60FPS Sky Show"
        description="Click anywhere to launch realistic Diwali fireworks! Features 6 explosion patterns, golden sparkles, auto & manual modes, sound effects, and full-screen view."
        path="/fireworks"
      />

      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-5 text-center md:text-left">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#29104A] border border-[#FFD700]/40 text-[11px] sm:text-xs font-bold uppercase tracking-[0.18em] text-[#FFD700] mb-2">
            <Flame className="w-3.5 h-3.5 shrink-0" />
            <span>Eco-Friendly 60FPS Sky Aatishbaazi</span>
          </div>
          <h1 className="font-display text-2xl sm:text-4xl font-black gold-gradient-text gold-glow-text">
            Interactive Fireworks Simulator 🎆
          </h1>
          <p className="text-xs sm:text-sm text-[#FFF4DC]/75 mt-1">
            Tap anywhere in the night sky to launch rockets!
          </p>
        </div>

        <button
          type="button"
          onClick={handleGrandFinale}
          className="w-full md:w-auto px-5 py-3 rounded-xl sm:rounded-2xl btn-royal-gold text-xs sm:text-sm flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>Launch Grand Finale</span>
        </button>
      </div>

      {/* Main Interactive Fireworks Stage Container */}
      <div
        ref={containerRef}
        className={`relative rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-[#FFD700]/55 bg-[#0D0618] shadow-[0_0_40px_rgba(255,140,0,0.18)] flex flex-col justify-between ${
          isFullscreen
            ? 'w-screen h-screen rounded-none border-0'
            : 'h-[460px] sm:h-[600px] lg:h-[680px]'
        }`}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={handleCanvasPointerDown}
          onTouchStart={handleCanvasPointerDown}
          className="absolute inset-0 w-full h-full cursor-crosshair block touch-none"
          aria-label="Interactive Fireworks Night Sky Canvas — Tap anywhere to launch fireworks"
        />

        {/* Top Overlay HUD Bar */}
        <div className="relative z-10 p-2.5 sm:p-4 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          <div className="pointer-events-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0D0618]/85 border border-[#FFD700]/35 text-[11px] sm:text-xs text-[#FFF4DC]">
            <span className="flex items-center gap-1 font-bold text-[#FFD700]">
              <Sparkles className="w-3.5 h-3.5" />
              {burstCount}
            </span>
            <span className="text-[#FFF4DC]/40">|</span>
            <span>Tap Sky!</span>
          </div>

          <div className="pointer-events-auto flex flex-wrap items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => setMode((m) => (m === 'auto' ? 'manual' : 'auto'))}
              className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl border text-[11px] sm:text-xs font-bold flex items-center gap-1 transition-all ${
                mode === 'auto'
                  ? 'bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-[#0D0618] border-[#FFD700]'
                  : 'bg-[#0D0618]/85 text-[#FFF4DC] border-[#FFD700]/40 hover:border-[#FFD700]'
              }`}
            >
              {mode === 'auto' ? (
                <>
                  <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>Auto</span>
                </>
              ) : (
                <>
                  <Hand className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#FFD700]" />
                  <span>Manual</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                if (next) soundManager.playFireworkExplosionSound();
              }}
              className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl border text-[11px] sm:text-xs font-bold flex items-center gap-1 transition-all ${
                soundEnabled
                  ? 'bg-[#FFD700]/25 border-[#FFD700] text-[#FFD700]'
                  : 'bg-[#0D0618]/85 border-[#FFD700]/35 text-[#FFF4DC]/80'
              }`}
              aria-label="Toggle Firework Sound Effects"
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{soundEnabled ? 'SFX: ON' : 'SFX: OFF'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                rocketsRef.current.length = 0;
                particlesRef.current.length = 0;
              }}
              className="p-1.5 sm:p-2 rounded-xl bg-[#0D0618]/85 border border-[#FFD700]/35 text-[#FFF4DC]/75 hover:text-[#FFD700]"
              title="Clear Sky"
              aria-label="Clear Sky"
            >
              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            <button
              type="button"
              onClick={handleToggleFullscreen}
              className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-[#0D0618]/85 border border-[#FFD700]/45 text-[11px] sm:text-xs font-bold text-[#FFD700] hover:bg-[#29104A] flex items-center gap-1 transition-all"
            >
              {isFullscreen ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">{isFullscreen ? 'Exit' : 'Fullscreen'}</span>
            </button>
          </div>
        </div>

        {/* Bottom Control Dock */}
        <div className="relative z-10 p-2.5 sm:p-4 bg-gradient-to-t from-[#0D0618] via-[#0D0618]/90 to-transparent pointer-events-none">
          <div className="pointer-events-auto flex flex-col lg:flex-row items-center justify-between gap-2.5 sm:gap-4 glass-card rounded-xl sm:rounded-2xl p-2.5 sm:p-3.5 border border-[#FFD700]/35">
            <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5">
              {FIREWORK_PATTERNS.map((pat) => (
                <button
                  key={pat.id}
                  type="button"
                  onClick={() => setPattern(pat.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-semibold transition-all ${
                    pattern === pat.id
                      ? 'bg-[#FFD700] text-[#0D0618] font-bold shadow'
                      : 'bg-[#0D0618]/75 text-[#FFF4DC]/85 hover:text-[#FFD700]'
                  }`}
                >
                  {pat.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {COLOR_MODES.map((cm) => (
                <button
                  key={cm.id}
                  type="button"
                  onClick={() => setColorModeId(cm.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-semibold border flex items-center gap-1.5 transition-all ${
                    colorModeId === cm.id
                      ? 'bg-[#29104A] border-[#FFD700] text-[#FFD700]'
                      : 'bg-[#0D0618]/75 border-[#FFD700]/20 text-[#FFF4DC]/75'
                  }`}
                >
                  <span className="flex -space-x-1">
                    {cm.colors.slice(0, 3).map((hex) => (
                      <span
                        key={hex}
                        className="w-2 h-2 rounded-full border border-black/40"
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </span>
                  <span>{cm.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
