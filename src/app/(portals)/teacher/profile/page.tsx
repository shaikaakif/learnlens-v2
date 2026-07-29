'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  User, Building2, BookOpen, Layers, CheckCircle2, 
  ArrowLeft, Loader2, Sparkles, LogOut, Check, Save
} from 'lucide-react';
import { AmbientAuroraBackground } from '@/components/ui/ambient-aurora-background';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { updateTeacherProfile } from '@/app/actions/teacher-profile';
import { teacherLogout, getTeacherProfile } from '@/app/actions/teacher-auth';
import { triggerHaptic } from '@/lib/haptics';

const SUBJECT_OPTIONS = [
  { id: 'Mathematics', label: 'Mathematics', icon: '📐' },
  { id: 'Physics', label: 'Physics', icon: '⚡' },
  { id: 'Chemistry', label: 'Chemistry', icon: '🧪' },
  { id: 'Biology', label: 'Biology', icon: '🧬' },
  { id: 'English', label: 'English', icon: '📖' },
  { id: 'Computer Science', label: 'Computer Science', icon: '💻' },
  { id: 'Social Studies', label: 'Social Studies', icon: '🌍' },
  { id: 'Hindi', label: 'Hindi', icon: '✍️' },
];

const CLASS_OPTIONS = [
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'
];

export default function TeacherProfilePage() {
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [primarySubject, setPrimarySubject] = useState('');
  const [classesTaught, setClassesTaught] = useState<string[]>([]);

  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const data = await getTeacherProfile();
      if (data) {
        setFullName(data.full_name || '');
        setPrimarySubject(data.primary_subject || '');
        setSchoolName(data.schools?.name || '');
        if (data.teacher_classes) {
          setClassesTaught(data.teacher_classes.map((c: any) => c.class_level));
        }
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  const toggleClassSelect = (cls: string) => {
    triggerHaptic('light');
    setClassesTaught((prev) => 
      prev.includes(cls) ? prev.filter((c) => c !== cls) : [...prev, cls]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('medium');
    setIsSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const result = await updateTeacherProfile({
      fullName,
      schoolName,
      primarySubject,
      classesTaught,
    });

    setIsSaving(false);

    if (result?.error) {
      setErrorMsg(result.error);
    } else {
      triggerHaptic('success');
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-foreground relative overflow-hidden font-sans selection:bg-primary/20">
      <AmbientAuroraBackground variant="auth" />

      {/* Header */}
      <header className="p-4 md:p-6 relative z-20 max-w-5xl mx-auto w-full flex items-center justify-between">
        <Link
          href="/teacher/dashboard"
          onClick={() => triggerHaptic('light')}
          className="inline-flex items-center gap-2 text-xs md:text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors bg-white/90 border border-border/80 px-4 py-2 rounded-full backdrop-blur-xl shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <form action={teacherLogout}>
          <Button variant="ghost" size="sm" type="submit" className="gap-2 text-muted-foreground hover:text-foreground">
            <LogOut className="w-4 h-4" /> Sign Out
          </Button>
        </form>
      </header>

      {/* Main Form */}
      <main className="flex-1 max-w-2xl w-full mx-auto p-4 relative z-10">
        <Card className="shadow-2xl shadow-primary/5 border-primary/25 bg-white/95 backdrop-blur-2xl rounded-3xl overflow-hidden p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-border/40 pb-4">
            <div>
              <span className="text-xs uppercase font-bold font-mono tracking-widest text-primary">Educator Account</span>
              <CardTitle className="text-2xl md:text-3xl font-serif font-bold text-foreground mt-1">Teacher Profile</CardTitle>
            </div>
            <div className="w-12 h-12 bg-primary/15 rounded-2xl flex items-center justify-center text-primary shadow-inner">
              <User className="w-6 h-6" />
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            {errorMsg && (
              <p className="text-xs text-destructive bg-destructive/10 p-3.5 rounded-xl border border-destructive/20">{errorMsg}</p>
            )}

            {successMsg && (
              <div className="p-3.5 text-xs md:text-sm text-emerald-800 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Name */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-primary" /> Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="flex h-12 w-full rounded-xl border border-border/80 bg-background/60 px-4 py-2 text-sm aurora-input focus-visible:outline-none placeholder:text-muted-foreground/60 transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 font-medium"
              />
            </div>

            {/* School */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-primary" /> School / Institution
              </label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                required
                className="flex h-12 w-full rounded-xl border border-border/80 bg-background/60 px-4 py-2 text-sm aurora-input focus-visible:outline-none placeholder:text-muted-foreground/60 transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 font-medium"
              />
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-primary" /> Primary Subject
              </label>
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                {SUBJECT_OPTIONS.map((sub) => {
                  const isSelected = primarySubject === sub.id;
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => {
                        triggerHaptic('light');
                        setPrimarySubject(sub.id);
                      }}
                      className={`p-3 rounded-xl text-left border flex items-center justify-between transition-all ${
                        isSelected
                          ? 'bg-primary/10 border-primary text-foreground font-semibold ring-2 ring-primary/20 shadow-sm'
                          : 'bg-background/50 border-border/80 hover:border-primary/50 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <span className="text-xs md:text-sm flex items-center gap-2">
                        <span>{sub.icon}</span>
                        <span className="truncate">{sub.label}</span>
                      </span>
                      {isSelected && <Check className="w-4 h-4 text-primary shrink-0 ml-1" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Classes Taught */}
            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-primary" /> Classes Taught
              </label>
              <div className="flex flex-wrap gap-2.5 pt-1">
                {CLASS_OPTIONS.map((cls) => {
                  const isSelected = classesTaught.includes(cls);
                  return (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => toggleClassSelect(cls)}
                      className={`px-4 py-2 rounded-full text-xs font-medium border transition-all ${
                        isSelected
                          ? 'bg-primary text-primary-foreground border-primary shadow-sm scale-105'
                          : 'bg-background/60 border-border/80 text-muted-foreground hover:border-primary/50 hover:text-foreground'
                      }`}
                    >
                      {cls}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-border/40 flex items-center justify-end gap-3">
              <Button
                type="submit"
                disabled={isSaving}
                className="h-12 px-6 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow-md shadow-primary/20 flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Profile Changes</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      </main>

      <footer className="p-4 text-center text-xs text-muted-foreground/60 relative z-20 font-serif">
        LearnLens AI — Profile Management
      </footer>
    </div>
  );
}
