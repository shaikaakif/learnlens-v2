'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { 
  FileText, Sparkles, CheckCircle2, ArrowLeft, Loader2, 
  Plus, Trash2, Save, Send, AlertCircle, RefreshCw, Layers, BookOpen, Check, BarChart3
} from 'lucide-react';
import { AmbientAuroraBackground } from '@/components/ui/ambient-aurora-background';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getExamDetails, parseExamAction, saveExamDraftAction, publishExamAction } from '@/app/actions/exams';
import { triggerHaptic } from '@/lib/haptics';

interface QuestionItem {
  questionNumber: string;
  section: string;
  questionText: string;
  maxMarks: number;
  conceptTopic: string;
}

export default function ExamDetailsPage({ params }: { params: Promise<{ examId: string }> }) {
  const { examId } = use(params);

  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  
  const [isParsing, setIsParsing] = useState(false);
  const [parseStep, setParseStep] = useState<string>('Reading question paper');
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const data = await getExamDetails(examId);
      if (data) {
        setExam(data);
        const parsedObj = data.parsed_paper_json?.parsedData;
        if (parsedObj?.questions && parsedObj.questions.length > 0) {
          setQuestions(parsedObj.questions);
        } else if (data.exam_questions && data.exam_questions.length > 0) {
          setQuestions(
            data.exam_questions.map((q: any) => ({
              questionNumber: q.question_number,
              section: q.section || 'Section A',
              questionText: q.question_text,
              maxMarks: Number(q.max_marks) || 1,
              conceptTopic: q.concept_topic || 'General Concept',
            }))
          );
        }
      }
      setLoading(false);
    }
    loadData();
  }, [examId]);

  const totalMarks = questions.reduce((sum, q) => sum + (Number(q.maxMarks) || 0), 0);

  const handleTriggerParse = async () => {
    triggerHaptic('medium');
    setIsParsing(true);
    setErrorMsg(null);
    setParseStep('Reading question paper');

    const stepInterval = setInterval(() => {
      setParseStep((prev) => 
        prev === 'Reading question paper' 
          ? 'Structuring questions & marks' 
          : 'Finalizing question blueprint'
      );
    }, 2500);

    const result = await parseExamAction(examId);
    clearInterval(stepInterval);
    setIsParsing(false);

    if (result?.error) {
      setErrorMsg(result.error);
    } else if (result?.parsedPaper?.questions) {
      triggerHaptic('success');
      setQuestions(result.parsedPaper.questions);
      setSuccessMsg('Question paper successfully parsed with Gemini AI!');
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  const handleUpdateQuestion = (index: number, field: keyof QuestionItem, value: any) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddQuestion = () => {
    triggerHaptic('light');
    setQuestions((prev) => [
      ...prev,
      {
        questionNumber: `Q${prev.length + 1}`,
        section: 'Section A',
        questionText: '',
        maxMarks: 1,
        conceptTopic: 'General Concept',
      },
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    triggerHaptic('light');
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveDraft = async () => {
    triggerHaptic('medium');
    setIsSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const result = await saveExamDraftAction(examId, questions, totalMarks);
    setIsSaving(false);

    if (result?.error) {
      setErrorMsg(result.error);
    } else {
      triggerHaptic('success');
      setSuccessMsg('Draft saved successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  const handlePublish = async () => {
    if (questions.length === 0) {
      setErrorMsg('Please add at least one question before publishing.');
      return;
    }

    triggerHaptic('medium');
    setIsPublishing(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const result = await publishExamAction(examId, questions, totalMarks);
    setIsPublishing(false);

    if (result?.error) {
      setErrorMsg(result.error);
    } else {
      triggerHaptic('success');
      window.location.href = '/teacher/dashboard';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
        <h2 className="text-xl font-bold text-foreground font-serif">Examination Not Found</h2>
        <Link href="/teacher/dashboard" className="mt-4 text-sm text-primary hover:underline font-semibold">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const isPublished = exam.status === 'PUBLISHED';

  return (
    <div className="min-h-screen flex flex-col justify-between bg-background text-foreground relative overflow-hidden font-sans selection:bg-primary/20 pb-28 sm:pb-0">
      <AmbientAuroraBackground variant="auth" />

      {/* Header */}
      <header className="p-4 md:p-6 relative z-20 max-w-6xl mx-auto w-full flex items-center justify-between gap-2">
        <Link
          href="/teacher/dashboard"
          onClick={() => triggerHaptic('light')}
          className="inline-flex items-center gap-1.5 text-xs md:text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors bg-white/90 border border-border/80 px-3.5 py-2 rounded-full backdrop-blur-xl shadow-sm min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="flex items-center gap-2">
          <Link href={`/teacher/exams/${examId}/analytics`}>
            <Button variant="outline" size="sm" className="gap-1.5 rounded-xl text-xs font-semibold border-border/80 min-h-[44px]">
              <BarChart3 className="w-3.5 h-3.5 text-primary" />
              <span className="hidden xs:inline">Exam Analytics</span>
              <span className="xs:hidden">Analytics</span>
            </Button>
          </Link>

          <span className={`text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider px-2.5 sm:py-1 rounded-full border ${
            isPublished 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
              : 'bg-amber-50 text-amber-800 border-amber-200'
          }`}>
            {exam.status}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-6 relative z-10 space-y-6">
        {/* Exam Title & Context Banner */}
        <Card className="bg-white/90 backdrop-blur-2xl border-primary/20 shadow-sm p-5 md:p-8 rounded-3xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
            <div>
              <span className="text-[11px] uppercase font-mono tracking-widest text-primary font-bold">
                {exam.subject} • {exam.class_level} ({exam.section || 'A'})
              </span>
              <h1 className="text-xl md:text-3xl font-serif font-bold text-foreground mt-1">{exam.title}</h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-primary/10 px-4 py-2 rounded-2xl border border-primary/20 text-center">
                <span className="text-[10px] text-muted-foreground block font-mono">TOTAL MARKS</span>
                <span className="text-lg md:text-xl font-bold font-serif text-primary">{totalMarks}</span>
              </div>
            </div>
          </div>

          {/* AI Parser Status Banner */}
          {!isPublished && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-muted/30 p-4 rounded-2xl border border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/15 rounded-xl flex items-center justify-center text-primary font-bold shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs md:text-sm font-semibold text-foreground">Gemini Question Paper Parser</p>
                  <p className="text-[11px] md:text-xs text-muted-foreground">
                    {questions.length > 0
                      ? `${questions.length} questions parsed & ready for teacher review`
                      : 'Extract questions, marks & topics automatically'}
                  </p>
                </div>
              </div>

              <Button
                type="button"
                onClick={handleTriggerParse}
                disabled={isParsing}
                variant="outline"
                className="rounded-xl border-primary/30 text-primary hover:bg-primary/10 gap-2 shrink-0 h-11 min-h-[44px] px-4 text-xs font-semibold w-full sm:w-auto"
              >
                {isParsing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{parseStep}...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>{questions.length > 0 ? 'Re-parse Paper' : 'Parse Paper with AI'}</span>
                  </>
                )}
              </Button>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 text-xs md:text-sm text-red-800 bg-red-50 rounded-2xl border border-red-200 flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 text-xs md:text-sm text-emerald-800 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}
        </Card>

        {/* Questions Review List */}
        <Card className="bg-white/95 backdrop-blur-2xl border-primary/20 shadow-xl rounded-3xl p-5 md:p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg md:text-xl font-serif font-bold text-foreground flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary shrink-0" />
              <span>Structured Questions ({questions.length})</span>
            </h2>

            {!isPublished && (
              <Button
                type="button"
                onClick={handleAddQuestion}
                variant="outline"
                size="sm"
                className="rounded-xl gap-1 text-xs border-border/80 min-h-[44px] px-3"
              >
                <Plus className="w-3.5 h-3.5" /> Add Question
              </Button>
            )}
          </div>

          {questions.length === 0 ? (
            <div className="text-center py-10 border-2 border-dashed border-border/60 rounded-2xl space-y-3 bg-muted/20 p-4">
              <BookOpen className="w-8 h-8 text-muted-foreground/60 mx-auto" />
              <p className="text-sm font-semibold text-foreground">No questions parsed yet</p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Click "Parse Paper with AI" above to extract questions automatically, or add questions manually.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((q, idx) => (
                <div 
                  key={idx}
                  className="bg-muted/20 border border-border/60 rounded-2xl p-4 space-y-3 hover:border-primary/40 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={q.questionNumber}
                        onChange={(e) => handleUpdateQuestion(idx, 'questionNumber', e.target.value)}
                        disabled={isPublished}
                        placeholder="Q1"
                        className="w-20 h-10 rounded-lg border border-border/80 bg-white px-2.5 text-xs font-bold font-mono text-primary focus:outline-none focus:border-primary"
                      />
                      <input
                        type="text"
                        value={q.section}
                        onChange={(e) => handleUpdateQuestion(idx, 'section', e.target.value)}
                        disabled={isPublished}
                        placeholder="Section A"
                        className="flex-1 sm:w-32 h-10 rounded-lg border border-border/80 bg-white px-2.5 text-xs font-medium text-muted-foreground focus:outline-none focus:border-primary"
                      />
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
                        <span>Marks:</span>
                        <input
                          type="number"
                          value={q.maxMarks}
                          onChange={(e) => handleUpdateQuestion(idx, 'maxMarks', parseFloat(e.target.value) || 0)}
                          disabled={isPublished}
                          min={0}
                          className="w-16 h-10 rounded-lg border border-border/80 bg-white px-2 text-xs font-bold text-foreground text-center focus:outline-none focus:border-primary"
                        />
                      </div>

                      {!isPublished && (
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(idx)}
                          className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors rounded-lg"
                          aria-label="Remove question"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <textarea
                      value={q.questionText}
                      onChange={(e) => handleUpdateQuestion(idx, 'questionText', e.target.value)}
                      disabled={isPublished}
                      placeholder="Enter exact question text..."
                      rows={2}
                      className="w-full rounded-xl border border-border/80 bg-white p-3 text-xs md:text-sm text-foreground focus:outline-none focus:border-primary transition-all resize-none"
                    />

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-muted-foreground shrink-0">Concept/Topic:</span>
                      <input
                        type="text"
                        value={q.conceptTopic}
                        onChange={(e) => handleUpdateQuestion(idx, 'conceptTopic', e.target.value)}
                        disabled={isPublished}
                        placeholder="Topic tag"
                        className="flex-1 h-9 rounded-lg border border-border/60 bg-white px-2.5 text-xs text-muted-foreground focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Desktop Save & Publish Action Bar */}
          {!isPublished && (
            <div className="hidden sm:flex pt-4 border-t border-border/40 items-center justify-between gap-4">
              <Button
                type="button"
                onClick={handleSaveDraft}
                disabled={isSaving || isPublishing}
                variant="outline"
                className="rounded-xl border-border/80 h-12 min-h-[48px] px-5 text-xs font-semibold gap-2"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Draft Corrections</span>
              </Button>

              <Button
                type="button"
                onClick={handlePublish}
                disabled={isPublishing || isSaving || questions.length === 0}
                className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground h-12 min-h-[48px] px-6 text-sm font-semibold shadow-md shadow-primary/20 gap-2"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Publishing Examination...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Publish Examination</span>
                  </>
                )}
              </Button>
            </div>
          )}
        </Card>
      </main>

      {/* Sticky Mobile Action Bar for Save Draft & Publish (Visible on mobile viewports) */}
      {!isPublished && (
        <div className="fixed bottom-0 left-0 right-0 p-3 border-t border-border/80 bg-white/95 backdrop-blur-xl z-40 sm:hidden shadow-lg">
          <div className="flex items-center justify-between gap-2">
            <Button
              type="button"
              onClick={handleSaveDraft}
              disabled={isSaving || isPublishing}
              variant="outline"
              className="h-12 min-h-[48px] flex-1 rounded-xl text-xs font-semibold border-border/80 px-2 gap-1.5"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Draft</span>
            </Button>

            <Button
              type="button"
              onClick={handlePublish}
              disabled={isPublishing || isSaving || questions.length === 0}
              className="h-12 min-h-[48px] flex-1 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-md gap-1.5 px-2"
            >
              {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Publish Exam</span>
            </Button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="p-4 text-center text-xs text-muted-foreground/60 relative z-20 font-serif">
        LearnLens AI — Question Review & Publishing Platform
      </footer>
    </div>
  );
}
