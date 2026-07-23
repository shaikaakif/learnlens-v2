"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Activity, FileText, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AmbientAuroraBackground } from '@/components/ui/ambient-aurora-background';

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { href: '/student/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/student/analyze', icon: FileText, label: 'Analyze' },
    { href: '/student/progress', icon: Activity, label: 'Progress' },
    { href: '/student/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="min-h-[100dvh] bg-muted/20 flex flex-col md:flex-row pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0 relative overflow-hidden">
      {/* Living Aurora Ambient Background */}
      <AmbientAuroraBackground variant="subtle" />
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-background border-r border-border flex-col shrink-0">
        <div className="p-6 border-b border-border/60">
          <h2 className="text-2xl font-serif font-bold text-foreground flex items-center gap-2">
            Learn<span className="text-primary italic">Lens</span>
          </h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="w-5 h-5" /> {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full relative z-0">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-10 pb-8 h-full">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar (PWA Style) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border/50 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_24px_-8px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link 
                key={item.href} 
                href={item.href} 
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors min-w-[64px]",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <item.icon className={cn("w-6 h-6 transition-transform", isActive && "scale-110")} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  );
}
