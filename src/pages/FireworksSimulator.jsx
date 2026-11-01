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
  { id: 'random', label: '🎲 Royal Mix' },
  { id: 'sphere', label: '🏵️ Chrysanthemum' },
  { id: 'ring', label: '⭕ Double Chakra' },
  { id: 'willow', label: '🌴 Golden Willow' },
  { id: 'heart', label: '💛 Heart of Light' },
  { id: 'star', label: '⭐ Starburst' },
];

const COLOR_MODES = [
  { id: 'festival', label: 'Diwali Gold & Saffron', colors: ['#FFD700', '#FF8C00', '#FFF4DC', '#F59E0B'] },
  { id: 'navratri', label: 'Royal Jewel Multicolor', colors: ['#FFD700', '#FB7185', '#38BDF8', '#4ADE80', '#C084FC'] },
  { id: 'crimson', label: 'Ruby & Pure Gold', colors: ['#F43F5E', '#FFD700', '#FB923C', '#FFF4DC'] },
  { id: 'peacock', label: 'Peacock Emerald & Cyan', colors: ['#10B981', '#06B6D4', '#FFD700', '#FFF4DC'] },
];

/**
 * Web Audio API sound synthesizer for realistic firework launch & explosion crackle
 */
function playFireworkExplosionSound(audioCtxRef) {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioCtxRef.current) {
      audioCtxRef.current = new AudioContextClass();
    }
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    // 1. Deep resonant thump
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(28, now + 0.38);

    oscGain.gain.setValueAtTime(0.28, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(oscGain);
    oscGain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.42);

    // 2. White-noise sparkle crackle burst
    const bufferSize = ctx.sampleRate * 0.45;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i += 1) {
      output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.14));
    }

    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, now);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.22, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.44);

    whiteNoise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    whiteNoise.start(now);
  } catch {
    // Ignore audio context autoplay blocks
  }
}

export default function FireworksSimulator() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const audioCtxRef = useRef(null);
  const rocketsRef = useRef([]);
  const particlesRef = useRef([]);
  const { addToast } = useToast();

  const [mode, setMode] = useState('auto'); // 'auto' | 'manual'
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

  // Spawn an explosion of particles at (targetX, targetY)
  const createExplosion = useCallback((x, y, forcedPattern = null) => {
    const paletteObj =
      COLOR_MODES.find((c) => c.id === colorModeRef.current) || COLOR_MODES[0];
    const palette = paletteObj.colors;
    const activePattern =
      (forcedPattern || patternRef.current) === 'random'
        ? ['sphere', 'ring', 'willow', 'heart', 'star'][Math.floor(Math.random() * 5)]
        : forcedPattern || patternRef.current;

    const count = activePattern === 'willow' ? 95 : 80;

    for (let i = 0; i < count; i += 1) {
      const color = palette[i % palette.length];
      let vx = 0;
      let vy = 0;
      let gravity = 0.055;
      let drag = 0.982;
      let decay = Math.random() * 0.012 + 0.01;

      if (activePattern === 'sphere') {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 5.8 + 1.4;
        vx = Math.cos(angle) * speed;
        vy = Math.sin(angle) * speed;
      } else if (activePattern === 'ring') {
        const angle = (Math.PI * 2 * i) / count;
        const ringSpeed = i % 2 === 0 ? 5.2 : 3.0;
        vx = Math.cos(angle) * ringSpeed;
        vy = Math.sin(angle) * ringSpeed;
      } else if (activePattern === 'willow') {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4.2 + 0.8;
        vx = Math.cos(angle) * speed;
        vy = Math.sin(angle) * speed;
        gravity = 0.085;
        drag = 0.975;
        decay = 0.0075;
      } else if (activePattern === 'heart') {
        const t = (Math.PI * 2 * i) / count;
        const hx = 16 * Math.pow(Math.sin(t), 3);
        const hy = -(
          13 * Math.cos(t) -
          5 * Math.cos(2 * t) -
          2 * Math.cos(3 * t) -
          Math.cos(4 * t)
        );
        vx = hx * 0.28 + (Math.random() - 0.5) * 0.4;
        vy = hy * 0.28 + (Math.random() - 0.5) * 0.4;
      } else if (activePattern === 'star') {
        const points = 5;
        const angle = (Math.PI * 2 * i) / count;
        const starFactor = 1 + 0.55 * Math.cos(points * angle);
        const speed = 3.8 * starFactor;
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

    // Golden Core Sparkles
    for (let s = 0; s < 22; s += 1) {
      const a = Math.random() * Math.PI * 2;
      const sp = Math.random() * 2.2 + 0.4;
      particlesRef.current.push({
        x,
        y,
        prevX: x,
        prevY: y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        color: '#FFF4DC',
        alpha: 1,
        decay: 0.022,
        gravity: 0.03,
        drag: 0.98,
        radius: 1.8,
        sparkle: true,
      });
    }

    if (soundRef.current) {
      playFireworkExplosionSound(audioCtxRef);
    }

    setBurstCount((c) => c + 1);
  }, []);

  // Launch a rocket from bottom towards (targetX, targetY)
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

  // Main 60FPS HTML5 Canvas Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    let animId;

    const updateCanvasSize = () => {
      if (!canvas || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      canvas.width = rect.width || window.innerWidth;
      canvas.height = rect.height || 680;
    };
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Launch initial celebratory salvo
    setTimeout(() => {
      if (!canvasRef.current) return;
      const w = canvasRef.current.width;
      const h = canvasRef.current.height;
      launchRocket(w * 0.3, h * 0.32);
      launchRocket(w * 0.5, h * 0.24);
      launchRocket(w * 0.7, h * 0.32);
    }, 250);

    const renderLoop = () => {
      // Semi-transparent night sky trail clear for realistic glowing tails
      ctx.fillStyle = 'rgba(13, 6, 24, 0.22)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update & Draw Ascending Rockets
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

      // Update & Draw Explosion Particles
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

  // Automatic Fireworks Interval when mode === 'auto'
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

  // Click / Tap on Canvas to Launch Firework
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

  // Grand Finale Salvo (8 simultaneous rockets!)
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

  // Toggle Full-Screen Mode
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
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <SEOHead
        title="Interactive Diwali Fireworks Simulator — Full-Screen 60FPS Sky Show"
        description="Click anywhere to launch realistic Diwali fireworks! Features 6 explosion patterns, golden sparkles, auto & manual modes, sound effects, and full-screen view."
        path="/fireworks"
      />

      {/* Top Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#29104A] border border-[#FFD700]/40 text-xs font-bold uppercase tracking-[0.2em] text-[#FFD700] mb-2">
            <Flame className="w-3.5 h-3.5" />
            <span>Eco-Friendly 60FPS Sky Aatishbaazi</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-black gold-gradient-text gold-glow-text">
            Interactive Fireworks Simulator 🎆
          </h1>
          <p className="text-xs sm:text-sm text-[#FFF4DC]/75 mt-1">
            Click or tap anywhere in the night sky to launch rockets! Switch patterns, colors, sound,
            and full-screen mode below.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleGrandFinale}
            className="px-5 py-3 rounded-2xl btn-royal-gold text-xs sm:text-sm flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Launch Grand Finale (8x)</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Fireworks Stage Container */}
      <div
        ref={containerRef}
        className={`relative rounded-3xl overflow-hidden border-2 border-[#FFD700]/55 bg-[#0D0618] shadow-[0_0_50px_rgba(255,140,0,0.2)] flex flex-col justify-between ${
          isFullscreen ? 'w-screen h-screen rounded-none border-0' : 'h-[620px] sm:h-[680px]'
        }`}
      >
        {/* Interactive Canvas */}
        <canvas
          ref={canvasRef}
          onMouseDown={handleCanvasPointerDown}
          onTouchStart={handleCanvasPointerDown}
          className="absolute inset-0 w-full h-full cursor-crosshair block"
          aria-label="Interactive Fireworks Night Sky Canvas — Click anywhere to launch fireworks"
        />

        {/* Top Overlay HUD Bar */}
        <div className="relative z-10 p-4 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
          <div className="pointer-events-auto inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-[#0D0618]/85 backdrop-blur-md border border-[#FFD700]/35 text-xs text-[#FFF4DC]">
            <span className="flex items-center gap-1.5 font-bold text-[#FFD700]">
              <Sparkles className="w-3.5 h-3.5" />
              Bursts: {burstCount}
            </span>
            <span className="text-[#FFF4DC]/40">|</span>
            <span>Click / Tap Sky to Launch!</span>
          </div>

          {/* Right HUD Controls: Auto/Manual, Sound Toggle, Fullscreen Button */}
          <div className="pointer-events-auto flex flex-wrap items-center gap-2">
            {/* Auto vs Manual Mode Toggle */}
            <button
              type="button"
              onClick={() => setMode((m) => (m === 'auto' ? 'manual' : 'auto'))}
              className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                mode === 'auto'
                  ? 'bg-gradient-to-r from-[#FFD700] to-[#FF8C00] text-[#0D0618] border-[#FFD700]'
                  : 'bg-[#0D0618]/85 text-[#FFF4DC] border-[#FFD700]/40 hover:border-[#FFD700]'
              }`}
            >
              {mode === 'auto' ? (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Auto Show: ON</span>
                </>
              ) : (
                <>
                  <Hand className="w-3.5 h-3.5 text-[#FFD700]" />
                  <span>Manual Mode</span>
                </>
              )}
            </button>

            {/* Sound Toggle */}
            <button
              type="button"
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                if (next) {
                  playFireworkExplosionSound(audioCtxRef);
                }
              }}
              className={`px-3.5 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                soundEnabled
                  ? 'bg-[#FFD700]/25 border-[#FFD700] text-[#FFD700]'
                  : 'bg-[#0D0618]/85 border-[#FFD700]/35 text-[#FFF4DC]/80 hover:border-[#FFD700]'
              }`}
              aria-label="Toggle Firework Sound Effects"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span>{soundEnabled ? 'Sound: ON' : 'Sound: OFF'}</span>
            </button>

            {/* Clear Sky Button */}
            <button
              type="button"
              onClick={() => {
                rocketsRef.current = [];
                particlesRef.current = [];
              }}
              className="p-2 rounded-xl bg-[#0D0618]/85 border border-[#FFD700]/35 text-[#FFF4DC]/75 hover:text-[#FFD700]"
              title="Clear Sky"
              aria-label="Clear Sky"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            {/* Full-Screen Button */}
            <button
              type="button"
              onClick={handleToggleFullscreen}
              className="px-3.5 py-2 rounded-xl bg-[#0D0618]/85 border border-[#FFD700]/45 text-xs font-bold text-[#FFD700] hover:bg-[#29104A] flex items-center gap-1.5 transition-all"
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-4 h-4" />
                  <span>Exit Fullscreen</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-4 h-4" />
                  <span>Full Screen</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Bottom Control Dock: Explosion Pattern & Color Palette Selector */}
        <div className="relative z-10 p-4 bg-gradient-to-t from-[#0D0618] via-[#0D0618]/90 to-transparent pointer-events-none">
          <div className="pointer-events-auto flex flex-col lg:flex-row items-center justify-between gap-4 glass-card rounded-2xl p-3.5 border border-[#FFD700]/35">
            {/* Explosion Patterns */}
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#FFD700] mr-1">
                Pattern:
              </span>
              {FIREWORK_PATTERNS.map((pat) => (
                <button
                  key={pat.id}
                  type="button"
                  onClick={() => setPattern(pat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    pattern === pat.id
                      ? 'bg-[#FFD700] text-[#0D0618] font-bold shadow'
                      : 'bg-[#0D0618]/75 text-[#FFF4DC]/85 hover:text-[#FFD700]'
                  }`}
                >
                  {pat.label}
                </button>
              ))}
            </div>

            {/* Color Palettes */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#FFD700] mr-1">
                Colors:
              </span>
              {COLOR_MODES.map((cm) => (
                <button
                  key={cm.id}
                  type="button"
                  onClick={() => setColorModeId(cm.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 transition-all ${
                    colorModeId === cm.id
                      ? 'bg-[#29104A] border-[#FFD700] text-[#FFD700]'
                      : 'bg-[#0D0618]/75 border-[#FFD700]/20 text-[#FFF4DC]/75'
                  }`}
                >
                  <span className="flex -space-x-1">
                    {cm.colors.slice(0, 3).map((hex) => (
                      <span
                        key={hex}
                        className="w-2.5 h-2.5 rounded-full border border-black/40"
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

