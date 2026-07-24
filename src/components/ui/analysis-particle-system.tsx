"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  radius: number;
  color: string;
  alpha: number;
  baseAlpha: number;
  vx: number;
  vy: number;
  pulseSpeed: number;
  pulsePhase: number;
}

const PARTICLE_COLORS = [
  "rgba(16, 185, 129, ",   // Emerald
  "rgba(168, 85, 247, ",   // Lavender / Purple
  "rgba(244, 114, 182, ",  // Cherry Blossom Pink
  "rgba(251, 113, 133, ",  // Rose Gold / Soft Rose
  "rgba(34, 211, 238, ",   // Soft Cyan / Aqua
  "rgba(99, 102, 241, ",   // Indigo
  "rgba(251, 146, 60, ",   // Warm Coral
  "rgba(250, 204, 21, ",   // Amber Gold
  "rgba(147, 51, 234, ",   // Deep Violet
];

export function AnalysisParticleSystem() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Check reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    // Initialize 24 ambient floating particles
    const particleCount = prefersReducedMotion ? 10 : 26;
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const baseAlpha = 0.15 + Math.random() * 0.3;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 2 + Math.random() * 6,
        color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
        alpha: baseAlpha,
        baseAlpha,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -0.2 - Math.random() * 0.4, // Gentle upward float
        pulseSpeed: 0.01 + Math.random() * 0.02,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }

    const render = () => {
      // Pause if tab is inactive
      if (document.hidden) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        if (!prefersReducedMotion) {
          p.x += p.vx;
          p.y += p.vy;
          p.pulsePhase += p.pulseSpeed;

          // Gentle breathing opacity
          p.alpha = p.baseAlpha + Math.sin(p.pulsePhase) * 0.1;

          // Wrap boundaries smoothly
          if (p.y < -20) {
            p.y = height + 20;
            p.x = Math.random() * width;
          }
          if (p.x < -20) p.x = width + 20;
          if (p.x > width + 20) p.x = -20;
        }

        // Draw particle soft radial glow
        ctx.save();
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 2.5);
        gradient.addColorStop(0, `${p.color}${p.alpha})`);
        gradient.addColorStop(0.5, `${p.color}${p.alpha * 0.4})`);
        gradient.addColorStop(1, `${p.color}0)`);

        ctx.fillStyle = gradient;
        ctx.arc(p.x, p.y, p.radius * 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 select-none opacity-80"
    />
  );
}
