"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, CheckCircle2, AlertCircle } from 'lucide-react';
import { Student } from '@/types';
import { DEMO_STUDENT_ID } from '@/lib/constants';
import { saveStudentProfile } from './actions';

export default function ProfilePage({ profileData }: { profileData: Student | null }) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  const [formData, setFormData] = useState<Student>(profileData || {
    id: DEMO_STUDENT_ID,
    full_name: '',
    grade: 'Class 10',
    school_name: '',
    board: 'CBSE',
    subjects: [],
    favorite_subject: '',
    learning_goals: '',
    areas_to_improve: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setStatus('idle');
  };

  const handleSubjectsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const subjects = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, subjects }));
    setStatus('idle');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name) {
      setStatus('error');
      setErrorMessage('Full name is required');
      return;
    }
    
    setIsSaving(true);
    setStatus('saving');
    
    try {
      const result = await saveStudentProfile(formData);
      if (result.success) {
        setStatus('success');
        // Vibrate for success if supported
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate([15]);
        }
      } else {
        setStatus('error');
        setErrorMessage(result.error || 'Failed to save profile');
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20 md:pb-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <User className="w-8 h-8 text-primary" /> Student Profile
        </h1>
        <p className="text-muted-foreground">Manage your personalization details so LearnLens can provide better context during analysis.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="pt-6 space-y-6">
            
            {/* Identity */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Identity</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="full_name" className="text-sm font-medium">Full Name <span className="text-destructive">*</span></label>
                  <input
                    id="full_name"
                    name="full_name"
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="e.g. Aakif"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="school_name" className="text-sm font-medium">School Name</label>
                  <input
                    id="school_name"
                    name="school_name"
                    type="text"
                    value={formData.school_name || ''}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>

            {/* Academics */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Academics</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="grade" className="text-sm font-medium">Class / Grade <span className="text-destructive">*</span></label>
                  <select
                    id="grade"
                    name="grade"
                    required
                    value={formData.grade}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="Class 8">Class 8</option>
                    <option value="Class 9">Class 9</option>
                    <option value="Class 10">Class 10</option>
                    <option value="Class 11">Class 11</option>
                    <option value="Class 12">Class 12</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="board" className="text-sm font-medium">Education Board</label>
                  <select
                    id="board"
                    name="board"
                    value={formData.board || 'CBSE'}
                    onChange={handleChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="CBSE">CBSE</option>
                    <option value="ICSE">ICSE</option>
                    <option value="State Board">State Board</option>
                    <option value="IGCSE">IGCSE</option>
                    <option value="IB">IB</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="subjects" className="text-sm font-medium">Subjects (Comma separated)</label>
                <input
                  id="subjects"
                  name="subjects"
                  type="text"
                  value={formData.subjects?.join(', ') || ''}
                  onChange={handleSubjectsChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Math, Science, English..."
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="favorite_subject" className="text-sm font-medium">Favorite Subject</label>
                <input
                  id="favorite_subject"
                  name="favorite_subject"
                  type="text"
                  value={formData.favorite_subject || ''}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>

            {/* Goals */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Goals & Focus</h3>
              <div className="space-y-2">
                <label htmlFor="learning_goals" className="text-sm font-medium">Learning Goals</label>
                <textarea
                  id="learning_goals"
                  name="learning_goals"
                  rows={2}
                  value={formData.learning_goals || ''}
                  onChange={handleChange}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="What do you want to achieve?"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="areas_to_improve" className="text-sm font-medium">Areas to Improve</label>
                <textarea
                  id="areas_to_improve"
                  name="areas_to_improve"
                  rows={2}
                  value={formData.areas_to_improve || ''}
                  onChange={handleChange}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Any specific topics or skills?"
                />
              </div>
            </div>

          </CardContent>
          <CardFooter className="bg-muted/30 border-t border-border/40 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:w-auto flex items-center justify-center sm:justify-start">
              {status === 'success' && (
                <span className="text-success text-sm flex items-center gap-1 font-medium animate-in fade-in slide-in-from-left-2">
                  <CheckCircle2 className="w-4 h-4" /> Profile saved successfully
                </span>
              )}
              {status === 'error' && (
                <span className="text-destructive text-sm flex items-center gap-1 font-medium animate-in fade-in slide-in-from-left-2">
                  <AlertCircle className="w-4 h-4" /> {errorMessage}
                </span>
              )}
            </div>
            <Button type="submit" size="lg" disabled={isSaving} className="w-full sm:w-auto">
              {isSaving ? 'Saving...' : 'Save Profile'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
