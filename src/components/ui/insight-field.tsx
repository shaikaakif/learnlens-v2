"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface InsightFieldProps {
  className?: string;
  variant?: "hero" | "subtle" | "analysis";
  interactive?: boolean;
}

export function InsightField({ className, variant = "hero", interactive = true }: InsightFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  useEffect(() => {
    if (!interactive || prefersReducedMotion || variant === "analysis") return;

    let rafId: number;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      // Normalize to -1 to 1 based on screen center
      targetX = (e.clientX / window.innerWidth) * 2 - 1;
      targetY = (e.clientY / window.innerHeight) * 2 - 1;
    };

    const handleScroll = () => {
      // On mobile/scroll, we just add a subtle vertical shift based on scroll depth
      const scrollDepth = window.scrollY / (document.body.scrollHeight - window.innerHeight);
      targetY = (scrollDepth * 2) - 1;
    };

    const updateParallax = () => {
      // Lerp for smooth, weighted movement (Living Intelligence feel)
      currentX += (targetX - currentX) * 0.05;
      currentY += (targetY - currentY) * 0.05;

      if (containerRef.current) {
        // We use CSS variables so we don't trigger React renders
        containerRef.current.style.setProperty('--mouse-x', currentX.toString());
        containerRef.current.style.setProperty('--mouse-y', currentY.toString());
      }
      
      rafId = requestAnimationFrame(updateParallax);
    };

    // Attach listeners
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    
    // Start loop
    rafId = requestAnimationFrame(updateParallax);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, [interactive, prefersReducedMotion, variant]);

  // Variant specific styling
  const isHero = variant === "hero";
  const isAnalysis = variant === "analysis";
  const isSubtle = variant === "subtle";

  return (
    <div 
      ref={containerRef}
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden z-0 transition-opacity duration-1000",
        className
      )}
      style={{
        // Default positions
        '--mouse-x': '0',
        '--mouse-y': '0',
      } as React.CSSProperties}
    >
      {/* 
        Instead of massive expensive blur filters on moving DOM elements, 
        we use CSS radial gradients which are infinitely cheaper to render and composite.
      */}
      <div 
        className={cn(
          "absolute top-0 left-0 w-full h-full opacity-60 mix-blend-multiply",
          isAnalysis && "animate-pulse duration-3000"
        )}
        style={{
          background: `radial-gradient(circle at calc(50% + (var(--mouse-x) * 3%)) calc(40% + (var(--mouse-y) * 4%)), rgba(188, 227, 205, 0.4) 0%, rgba(255,255,255,0) 50%)`,
          transform: isAnalysis ? "scale(1.05)" : "scale(1)",
          transition: "transform 3s ease-in-out",
        }}
      />
      
      <div 
        className={cn(
          "absolute top-0 left-0 w-full h-full opacity-40 mix-blend-multiply",
          isAnalysis && "animate-pulse duration-2000 delay-500"
        )}
        style={{
          background: `radial-gradient(circle at calc(70% - (var(--mouse-x) * 5%)) calc(60% - (var(--mouse-y) * 2%)), rgba(126, 163, 104, 0.3) 0%, rgba(255,255,255,0) 55%)`,
          transform: isAnalysis ? "scale(1.1)" : "scale(1)",
          transition: "transform 4s ease-in-out",
        }}
      />

      <div 
        className={cn(
          "absolute top-0 left-0 w-full h-full opacity-30 mix-blend-multiply",
          isAnalysis && "animate-pulse duration-4000 delay-1000"
        )}
        style={{
          background: `radial-gradient(circle at calc(30% + (var(--mouse-x) * 2%)) calc(70% + (var(--mouse-y) * 6%)), rgba(59, 147, 86, 0.2) 0%, rgba(255,255,255,0) 60%)`,
          transform: isAnalysis ? "scale(0.95)" : "scale(1)",
          transition: "transform 5s ease-in-out",
        }}
      />
      
      {/* Overlay for depth */}
      <div className="absolute inset-0 bg-background/20 backdrop-blur-[2px]" />
    </div>
  );
}
