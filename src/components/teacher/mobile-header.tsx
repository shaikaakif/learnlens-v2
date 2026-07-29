import Link from 'next/link';
import { Users, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { teacherLogout } from '@/app/actions/teacher-auth';

interface MobileHeaderProps {
  schoolName: string;
}

export function MobileHeader({ schoolName }: MobileHeaderProps) {
  return (
    <header className="bg-white/95 border-b border-border/80 px-4 md:px-8 py-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-sm sticky top-0 z-30 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/15 rounded-xl flex items-center justify-center text-primary font-bold shadow-inner shrink-0">
          <Users className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-base md:text-lg font-serif font-bold text-foreground truncate">Teacher Portal</h1>
          <p className="text-xs text-muted-foreground truncate">{schoolName}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1 sm:pt-0 border-t sm:border-t-0 border-border/40 justify-end">
        <Link href="/teacher/profile" className="flex-1 sm:flex-none">
          <Button variant="outline" size="sm" className="w-full sm:w-auto h-10 min-h-[44px] gap-2 rounded-xl text-xs font-semibold border-border/80">
            <Settings className="w-4 h-4 text-primary" />
            <span>Profile Settings</span>
          </Button>
        </Link>

        <form action={teacherLogout} className="flex-1 sm:flex-none">
          <Button variant="ghost" size="sm" type="submit" className="w-full sm:w-auto h-10 min-h-[44px] gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </Button>
        </form>
      </div>
    </header>
  );
}
