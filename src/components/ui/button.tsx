"use client";

import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'secondary'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', onPointerMove, ...props }, ref) => {
    
    // Optional pointer tracking for the subtle radial highlight
    const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      e.currentTarget.style.setProperty('--x', `${x}px`);
      e.currentTarget.style.setProperty('--y', `${y}px`);
      if (onPointerMove) onPointerMove(e);
    };

    return (
      <button
        ref={ref}
        onPointerMove={handlePointerMove}
        className={cn(
          "relative inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background animate-spring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] overflow-hidden group min-h-[44px] min-w-[44px]",
          {
            'bg-primary text-primary-foreground shadow-sm hover:shadow-md border border-primary/20': variant === 'default',
            'border border-input bg-card shadow-sm hover:bg-muted hover:text-foreground': variant === 'outline',
            'hover:bg-muted hover:text-foreground': variant === 'ghost',
            'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90': variant === 'destructive',
            'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80': variant === 'secondary',
            'h-11 px-5 py-2': size === 'default',
            'h-11 rounded-lg px-4': size === 'sm',
            'h-14 rounded-xl px-8 text-base': size === 'lg',
            'h-11 w-11': size === 'icon',
          },
          className
        )}
        {...props}
      >
        {/* Pointer-tracking subtle radial highlight (visible on hover) */}
        <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0" 
              style={{
                background: variant === 'default' 
                  ? 'radial-gradient(circle 40px at var(--x, 50%) var(--y, 50%), rgba(255,255,255,0.2), transparent)'
                  : 'radial-gradient(circle 40px at var(--x, 50%) var(--y, 50%), rgba(0,0,0,0.05), transparent)'
              }} 
        />
        <span className="relative z-10 flex items-center gap-2">{props.children}</span>
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button }
