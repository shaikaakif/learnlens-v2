import React from 'react';
import { Card } from '@/components/ui/card';

interface MobileCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function MobileCard({ children, className = '', onClick }: MobileCardProps) {
  return (
    <Card 
      onClick={onClick}
      className={`bg-white/95 backdrop-blur-2xl border-primary/20 shadow-sm rounded-3xl p-4 md:p-6 transition-all ${
        onClick ? 'cursor-pointer hover:border-primary/50 hover:shadow-md active:scale-[0.99]' : ''
      } ${className}`}
    >
      {children}
    </Card>
  );
}
