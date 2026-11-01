import React, { useEffect, useRef } from 'react';

/**
 * High-performance ambient night sky background with floating golden particles,
 * twinkling stars, floating sky lanterns, and occasional subtle distant fireworks.
 */
export default function FestiveBackground({ intensity = 'normal' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize, { passive: true });

    const particleCount = intensity === 'high' ? 65 : 42;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2.2 + 0.6,
      vx: (Math.random() - 0.5) * 0.35,
      vy: -(Math.random() * 0.55 + 0.15),
      alpha: Math.random() * 0.75 + 0.2,
      pulseSpeed: Math.random() * 0.03 + 0.01,
      pulsePhase: Math.random() * Math.PI * 2,
      color: Math.random() > 0.35 ? '#FFD700' : Math.random() > 0.5 ? '#FF8C00' : '#FFF4DC',
    }));

    // Subtle background firework bursts
    const bursts = [];
    const spawnMiniBurst = () => {
      if (bursts.length > 2) return;
      const bx = Math.random() * width * 0.8 + width * 0.1;
      const by = Math.random() * height * 0.45 + height * 0.08;
      const colors = ['#FFD700', '#FF8C00', '#FFF4DC', '#FF5E7E', '#38BDF8'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const sparks = Array.from({ length: 22 }, (_, idx) => {
        const angle = (Math.PI * 2 * idx) / 22;
        const speed = Math.random() * 1.8 + 0.8;
        return {
          x: bx,
          y: by,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 0.85,
          color,
        };
      });
      bursts.push({ sparks });
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw floating golden dust particles
      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.pulsePhase += p.pulseSpeed;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        const currentAlpha = Math.max(0.15, Math.min(0.95, p.alpha + Math.sin(p.pulsePhase) * 0.25));
        ctx.save();
        ctx.globalAlpha = currentAlpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Occasionally trigger a subtle distant firework
      if (Math.random() < 0.012) {
        spawnMiniBurst();
      }

      for (let b = bursts.length - 1; b >= 0; b -= 1) {
        const burst = bursts[b];
        let alive = false;
        for (let s = 0; s < burst.sparks.length; s += 1) {
          const sp = burst.sparks[s];
          sp.x += sp.vx;
          sp.y += sp.vy;
          sp.vy += 0.025; // gentle gravity
          sp.alpha -= 0.014;
          if (sp.alpha > 0.02) {
            alive = true;
            ctx.save();
            ctx.globalAlpha = sp.alpha;
            ctx.fillStyle = sp.color;
            ctx.beginPath();
            ctx.arc(sp.x, sp.y, 1.6, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          }
        }
        if (!alive) {
          bursts.splice(b, 1);
        }
      }

      animationFrameId = window.requestAnimationFrame(render);
    };

    animationFrameId = window.requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [intensity]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {/* Ambient Radial Luxury Spotlights */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[480px] rounded-full bg-[#29104A]/50 blur-[130px]" />
      <div className="absolute top-1/3 -left-32 w-80 h-80 rounded-full bg-[#FF8C00]/10 blur-[110px]" />
      <div className="absolute bottom-10 -right-32 w-96 h-96 rounded-full bg-[#FFD700]/10 blur-[120px]" />

      {/* Floating Sky Lanterns (Akash Kandil) */}
      <div className="hidden md:block absolute top-24 left-[7%] opacity-65 animate-lantern">
        <div className="w-10 h-14 rounded-t-2xl rounded-b-lg bg-gradient-to-b from-[#FFD700] via-[#FF8C00] to-[#9A3412] shadow-[0_0_30px_rgba(255,215,0,0.65)] border border-[#FFF4DC]/60 relative">
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-4 h-3 bg-[#FFD700]/80 blur-[2px] rounded-full" />
        </div>
      </div>
      <div
        className="hidden lg:block absolute top-40 right-[8%] opacity-55 animate-lantern"
        style={{ animationDelay: '2.5s' }}
      >
        <div className="w-8 h-12 rounded-t-2xl rounded-b-lg bg-gradient-to-b from-[#FFF4DC] via-[#FFD700] to-[#FF8C00] shadow-[0_0_25px_rgba(255,140,0,0.6)] border border-[#FFF4DC]/50 relative" />
      </div>

      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}

