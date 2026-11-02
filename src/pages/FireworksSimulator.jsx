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

  const createExplosion = useCallback((x, y, forcedPattern = null) => {
    const paletteObj =
      COLOR_MODES.find((c) => c.id === colorModeRef.current) || COLOR_MODES[0];
    const palette = paletteObj.colors;
    const activePattern =
      (forcedPattern || patternRef.current) === 'random'
        ? ['sphere', 'ring', 'willow', 'heart', 'star'][Math.floor(Math.random() * 5)]
        : forcedPattern || patternRef.current;

    const count = activePattern === 'willow' ? 85 : 70;

    for (let i = 0; i < count; i += 1) {
      const color = palette[i % palette.length];
      let vx = 0;
      let vy = 0;
      let gravity = 0.055;
      let drag = 0.982;
      let decay = Math.random() * 0.012 + 0.01;

      if (activePattern === 'sphere') {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5.5 + 1.4;
        vx = Math.cos(angle) * speed;
        vy = Math.sin(angle) * speed;
      } else if (activePattern === 'ring') {
        const angle = (Math.PI * 2 * i) / count;
        const ringSpeed = i % 2 === 0 ? 5.0 : 2.8;
        vx = Math.cos(angle) * ringSpeed;
        vy = Math.sin(angle) * ringSpeed;
      } else if (activePattern === 'willow') {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4.0 + 0.8;
        vx = Math.cos(angle) * speed;
        vy = Math.sin(angle) * speed;
        gravity = 0.085;
        drag = 0.975;
        decay = 0.008;
      } else if (activePattern === 'heart') {
        const t = (Math.PI * 2 * i) / count;
        const hx = 16 * Math.pow(Math.sin(t), 3);
        const hy = -(
          13 * Math.cos(t) -
          5 * Math.cos(2 * t) -
          2 * Math.cos(3 * t) -
          Math.cos(4 * t)
        );
        vx = hx * 0.26 + (Math.random() - 0.5) * 0.4;
        vy = hy * 0.26 + (Math.random() - 0.5) * 0.4;
      } else if (activePattern === 'star') {
        const points = 5;
        const angle = (Math.PI * 2 * i) / count;
        const starFactor = 1 + 0.55 * Math.cos(points * angle);
        const speed = 3.6 * starFactor;
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
        radius: Math.random() * 2.2 + 1.3,
        sparkle: Math.random() > 0.45,
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
    const startX = canvas.width * 0.2 + Math.random() * (canvas.width * 0.6);
    const startY = canvas.height;
    const angle = Math.atan2(targetY - startY, targetX - startX);
    const distance = Math.hypot(targetX - startX, targetY - startY);
    const speed = Math.max(11, Math.min(17, distance / 26));

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
      color: '#FFD700',
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    let animId;

    const updateCanvasSize = () => {
      if (!canvas || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      canvas.width = rect.width || window.innerWidth;
      canvas.height = rect.height || 560;
    };
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    setTimeout(() => {
      if (!canvasRef.current) return;
      const w = canvasRef.current.width;
      const h = canvasRef.current.height;
      launchRocket(w * 0.3, h * 0.32);
      launchRocket(w * 0.5, h * 0.24);
      launchRocket(w * 0.7, h * 0.32);
    }, 250);

    const renderLoop = () => {
      ctx.fillStyle = 'rgba(13, 6, 24, 0.22)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let r = rocketsRef.current.length - 1; r >= 0; r -= 1) {
        const rk = rocketsRef.current[r];
        rk.prevX = rk.x;
        rk.prevY = rk.y;
        rk.x += rk.vx;
        rk.y += rk.vy;

        ctx.save();
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2.6;
        ctx.shadowColor = '#FF8C00';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(rk.prevX, rk.prevY);
        ctx.lineTo(rk.x, rk.y);
        ctx.stroke();
        ctx.restore();

        const distToTarget = Math.hypot(rk.targetX - rk.x, rk.targetY - rk.y);
        if (distToTarget < 18 || rk.y <= rk.targetY || rk.vy >= 0) {
          createExplosion(rk.x, rk.y);
          rocketsRef.current.splice(r, 1);
        }
      }

      for (let p = particlesRef.current.length - 1; p >= 0; p -= 1) {
        const pt = particlesRef.current[p];
        pt.prevX = pt.x;
        pt.prevY = pt.y;
        pt.vx *= pt.drag;
        pt.vy *= pt.drag;
        pt.vy += pt.gravity;
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.alpha -= pt.decay;

        if (pt.alpha <= 0.02) {
          particlesRef.current.splice(p, 1);
          continue;
        }

        ctx.save();
        const flickerAlpha =
          pt.sparkle && Math.random() > 0.65 ? Math.min(1, pt.alpha * 1.35) : pt.alpha;
        ctx.globalAlpha = Math.max(0, flickerAlpha);
        ctx.strokeStyle = pt.color;
        ctx.fillStyle = pt.color;
        ctx.lineWidth = pt.radius;
        ctx.shadowColor = pt.color;
        ctx.shadowBlur = 8;

        ctx.beginPath();
        ctx.moveTo(pt.prevX, pt.prevY);
        ctx.lineTo(pt.x, pt.y);
        ctx.stroke();
        ctx.restore();
      }

      animId = window.requestAnimationFrame(renderLoop);
    };

    animId = window.requestAnimationFrame(renderLoop);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      window.cancelAnimationFrame(animId);
    };
  }, [createExplosion, launchRocket]);

  useEffect(() => {
    if (mode !== 'auto') return undefined;
    const interval = setInterval(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const tx = canvas.width * 0.15 + Math.random() * (canvas.width * 0.7);
      const ty = canvas.height * 0.14 + Math.random() * (canvas.height * 0.42);
      launchRocket(tx, ty);
    }, 950);

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
    for (let i = 0; i < 8; i += 1) {
      setTimeout(() => {
        if (!canvasRef.current) return;
        const tx = canvas.width * (0.12 + (i * 0.76) / 7);
        const ty = canvas.height * (0.18 + (i % 3) * 0.1);
        launchRocket(tx, ty);
      }, i * 110);
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
          <span>Launch Grand Finale (8x)</span>
        </button>
      </div>

      {/* Main Interactive Fireworks Stage Container */}
      <div
        ref={containerRef}
        className={`relative rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-[#FFD700]/55 bg-[#0D0618] shadow-[0_0_50px_rgba(255,140,0,0.2)] flex flex-col justify-between ${
          isFullscreen
            ? 'w-screen h-screen rounded-none border-0'
            : 'h-[480px] sm:h-[600px] lg:h-[680px]'
        }`}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={handleCanvasPointerDown}
          onTouchStart={handleCanvasPointerDown}
          className="absolute inset-0 w-full h-full cursor-crosshair block touch-none"
          aria-label="Interactive Fireworks Night Sky Canvas — Click anywhere to launch fireworks"
        />

        {/* Top Overlay HUD Bar */}
        <div className="relative z-10 p-2.5 sm:p-4 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
          <div className="pointer-events-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0D0618]/85 backdrop-blur-md border border-[#FFD700]/35 text-[11px] sm:text-xs text-[#FFF4DC]">
            <span className="flex items-center gap-1 font-bold text-[#FFD700]">
              <Sparkles className="w-3.5 h-3.5" />
              {burstCount}
            </span>
            <span className="text-[#FFF4DC]/40">|</span>
            <span>Tap Sky!</span>
          </div>

          {/* Right HUD Controls */}
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
                rocketsRef.current = [];
                particlesRef.current = [];
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
