import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Lightweight, mobile-optimized ambient night sky background.
 * Automatically pauses its canvas loop on `/fireworks` so the mobile GPU
 * dedicates 100% of its frame budget to the interactive fireworks simulator.
 */
export default function FestiveBackground() {
  const canvasRef = useRef(null);
  const location = useLocation();
  const isFireworksPage = location.pathname === '/fireworks';

  useEffect(() => {
    if (isFireworksPage) return undefined;

    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    const isMobile = width < 768;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize, { passive: true });

    const particleCount = isMobile ? 18 : 36;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 2 + 0.8,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -(Math.random() * 0.45 + 0.15),
      alpha: Math.random() * 0.65 + 0.2,
      pulseSpeed: Math.random() * 0.025 + 0.01,
      pulsePhase: Math.random() * Math.PI * 2,
      color: Math.random() > 0.35 ? '#FFD700' : Math.random() > 0.5 ? '#FF8C00' : '#FFF4DC',
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

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

        const currentAlpha = Math.max(
          0.15,
          Math.min(0.9, p.alpha + Math.sin(p.pulsePhase) * 0.2)
        );
        ctx.globalAlpha = currentAlpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = window.requestAnimationFrame(render);
    };

    animationFrameId = window.requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [isFireworksPage]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] sm:w-[900px] h-[380px] rounded-full bg-[#29104A]/45 blur-[110px]" />
      {!isFireworksPage && <canvas ref={canvasRef} className="w-full h-full block" />}
    </div>
  );
}
