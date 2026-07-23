import { cn } from "@/lib/utils";

interface AmbientAuroraBackgroundProps {
  className?: string;
  variant?: "hero" | "auth" | "standard" | "subtle";
}

export function AmbientAuroraBackground({
  className,
  variant = "hero",
}: AmbientAuroraBackgroundProps) {
  const isHero = variant === "hero";
  const isAuth = variant === "auth";
  const isSubtle = variant === "subtle";

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden z-0 select-none",
        className
      )}
    >
      {/* 1. Cherry Blossom Pink & Rosewood Glow (Upper Right Atmospheric Wash) */}
      <div
        className={cn(
          "absolute rounded-full blur-[80px] md:blur-[110px] transition-all duration-1000 animate-aurora-slow",
          isHero && "top-[-8%] right-[-5%] w-[42rem] h-[42rem] bg-gradient-to-br from-rose-400/50 via-pink-400/40 to-rose-600/35 opacity-70",
          isAuth && "top-[-10%] right-[5%] w-[34rem] h-[34rem] bg-gradient-to-br from-rose-400/45 via-pink-300/35 to-rose-500/30 opacity-70",
          isSubtle && "top-[-5%] right-[2%] w-[34rem] h-[34rem] bg-gradient-to-br from-rose-400/35 via-pink-300/30 to-rose-500/25 opacity-55",
          !isHero && !isAuth && !isSubtle && "top-[-5%] right-[0%] w-[36rem] h-[36rem] bg-gradient-to-br from-rose-400/40 to-pink-300/30 opacity-65"
        )}
      />

      {/* 2. LearnLens Pistachio / Emerald Glow (Top Left Brand Anchor) */}
      <div
        className={cn(
          "absolute rounded-full blur-[80px] md:blur-[110px] transition-all duration-1000 animate-aurora-mid",
          isHero && "top-[-5%] left-[-8%] w-[44rem] h-[44rem] bg-gradient-to-tr from-emerald-400/55 via-teal-300/45 to-emerald-200/30 opacity-75",
          isAuth && "top-[10%] left-[10%] w-[32rem] h-[32rem] bg-gradient-to-tr from-emerald-400/45 via-teal-300/35 to-emerald-200/25 opacity-75",
          isSubtle && "top-[-2%] left-[0%] w-[36rem] h-[36rem] bg-gradient-to-tr from-emerald-400/40 via-teal-300/30 to-emerald-200/20 opacity-60",
          !isHero && !isAuth && !isSubtle && "top-0 left-[0%] w-[36rem] h-[36rem] bg-emerald-400/40 opacity-70"
        )}
      />

      {/* 3. Royal Lavender & Violet Glow (Center Right Fluid Layer) */}
      <div
        className={cn(
          "absolute rounded-full blur-[90px] md:blur-[120px] transition-all duration-1000 animate-aurora-alt",
          isHero && "top-[25%] right-[10%] w-[40rem] h-[40rem] bg-gradient-to-tr from-purple-400/45 via-violet-400/40 to-indigo-300/30 opacity-65",
          isAuth && "bottom-[10%] right-[10%] w-[30rem] h-[30rem] bg-purple-300/40 opacity-65",
          isSubtle && "top-[25%] right-[15%] w-[30rem] h-[30rem] bg-gradient-to-tr from-purple-400/30 via-violet-300/25 to-indigo-200/20 opacity-50",
          !isHero && !isAuth && !isSubtle && "top-[30%] right-[5%] w-[32rem] h-[32rem] bg-purple-300/35 opacity-60"
        )}
      />

      {/* 4. Electric Aqua / Cyan Ribbon (Lower Left Contrast Layer) */}
      <div
        className={cn(
          "absolute rounded-full blur-[85px] md:blur-[115px] transition-all duration-1000 animate-aurora-slow",
          isHero && "bottom-[-10%] left-[15%] w-[42rem] h-[42rem] bg-gradient-to-bl from-cyan-400/50 via-sky-300/40 to-teal-300/35 opacity-70",
          isAuth && "top-[35%] left-[20%] w-[30rem] h-[30rem] bg-cyan-300/40 opacity-70",
          isSubtle && "bottom-[-5%] left-[10%] w-[32rem] h-[32rem] bg-gradient-to-bl from-cyan-400/35 via-sky-300/25 to-teal-200/20 opacity-55",
          !isHero && !isAuth && !isSubtle && "bottom-0 left-[10%] w-[34rem] h-[34rem] bg-cyan-300/35 opacity-65"
        )}
      />

      {/* 5. Golden Amber & Soft Warm Sunburst (Center Accent Spark) */}
      <div
        className={cn(
          "absolute rounded-full blur-[95px] transition-all duration-1000 animate-aurora-mid",
          isHero && "top-[35%] left-[40%] w-[32rem] h-[32rem] bg-gradient-to-r from-amber-300/45 via-orange-300/35 to-rose-300/30 opacity-60",
          isAuth && "top-[20%] right-[30%] w-[22rem] h-[22rem] bg-amber-200/35 opacity-60",
          isSubtle && "top-[35%] left-[35%] w-[26rem] h-[26rem] bg-gradient-to-r from-amber-300/30 via-orange-200/25 to-rose-200/20 opacity-45",
          !isHero && !isAuth && !isSubtle && "top-[35%] left-[35%] w-[24rem] h-[24rem] bg-amber-200/30 opacity-55"
        )}
      />

      {/* Frosted Atmospheric Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-transparent to-background/30 pointer-events-none" />
    </div>
  );
}
