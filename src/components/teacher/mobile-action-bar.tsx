import React from 'react';

interface MobileActionBarProps {
  children: React.ReactNode;
  className?: string;
}

export function MobileActionBar({ children, className = '' }: MobileActionBarProps) {
  return (
    <div className={`fixed bottom-0 left-0 right-0 p-4 border-t border-border/80 bg-white/95 backdrop-blur-xl z-40 sm:static sm:p-0 sm:border-t-0 sm:bg-transparent shadow-lg sm:shadow-none ${className}`}>
      <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
        {children}
      </div>
    </div>
  );
}
