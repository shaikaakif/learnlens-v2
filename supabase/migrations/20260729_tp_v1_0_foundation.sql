-- ============================================================================
-- LearnLens AI — Teacher Portal V1.0 Additive Database Migration
-- Migration Name: 20260729_tp_v1_0_foundation.sql
-- Description: Establishes schema, foreign keys, indexes, and RLS policies for 
--              schools, teacher_profiles, teacher_classes, exams, exam_questions,
--              exam_attempts, and links analyses to exams safely.
-- ============================================================================

-- 1. SCHOOLS TABLE
CREATE TABLE IF NOT EXISTS public.schools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT UNIQUE,
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'India',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read access to schools"
ON public.schools FOR SELECT
TO authenticated
USING (true);

-- 2. TEACHER PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.teacher_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    primary_subject TEXT NOT NULL,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.teacher_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view own profile"
ON public.teacher_profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Teachers can insert own profile"
ON public.teacher_profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Teachers can update own profile"
ON public.teacher_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3. TEACHER CLASSES TABLE
CREATE TABLE IF NOT EXISTS public.teacher_classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES public.teacher_profiles(id) ON DELETE CASCADE,
    class_level TEXT NOT NULL,
    section TEXT DEFAULT 'A',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_teacher_class_section UNIQUE (teacher_id, class_level, section)
);

ALTER TABLE public.teacher_classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage own classes"
ON public.teacher_classes FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.teacher_profiles
        WHERE id = teacher_classes.teacher_id AND user_id = auth.uid()
    )
);

-- 4. EXAMS TABLE
CREATE TABLE IF NOT EXISTS public.exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    class_level TEXT NOT NULL,
    section TEXT DEFAULT 'A',
    question_paper_path TEXT,
    parsed_paper_json JSONB DEFAULT '{}'::jsonb,
    blueprint_path TEXT,
    parsed_blueprint_json JSONB DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'PUBLISHED', 'ARCHIVED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    published_at TIMESTAMPTZ,
    archived_at TIMESTAMPTZ
);

ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage own exams"
ON public.exams FOR ALL
TO authenticated
USING (auth.uid() = teacher_id)
WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Students can view published exams for their grade"
ON public.exams FOR SELECT
TO authenticated
USING (
    status = 'PUBLISHED' AND
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE user_id = auth.uid() AND grade = exams.class_level
    )
);

-- 5. EXAM QUESTIONS TABLE
CREATE TABLE IF NOT EXISTS public.exam_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    question_number TEXT NOT NULL,
    section TEXT,
    question_text TEXT NOT NULL,
    max_marks NUMERIC NOT NULL DEFAULT 1,
    concept_topic TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can manage questions for own exams"
ON public.exam_questions FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.exams
        WHERE id = exam_questions.exam_id AND teacher_id = auth.uid()
    )
);

CREATE POLICY "Students can view questions for published exams"
ON public.exam_questions FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.exams
        WHERE id = exam_questions.exam_id
          AND status = 'PUBLISHED'
          AND EXISTS (
              SELECT 1 FROM public.profiles
              WHERE user_id = auth.uid() AND grade = exams.class_level
          )
    )
);

-- 6. EXAM ATTEMPTS TABLE
CREATE TABLE IF NOT EXISTS public.exam_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    analysis_id TEXT REFERENCES public.analyses(id) ON DELETE SET NULL,
    score_obtained NUMERIC,
    score_total NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own exam attempts"
ON public.exam_attempts FOR SELECT
TO authenticated
USING (student_id = auth.uid());

CREATE POLICY "Students can insert own exam attempts"
ON public.exam_attempts FOR INSERT
TO authenticated
WITH CHECK (student_id = auth.uid());

CREATE POLICY "Teachers can view attempts for own exams"
ON public.exam_attempts FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.exams
        WHERE id = exam_attempts.exam_id AND teacher_id = auth.uid()
    )
);

-- 7. LINK ANALYSES TO EXAMS (ADDITIVE ALTERATION)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'analyses' 
          AND column_name = 'exam_id'
    ) THEN
        ALTER TABLE public.analyses ADD COLUMN exam_id UUID REFERENCES public.exams(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 8. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_teacher_profiles_user_id ON public.teacher_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_teacher_profiles_school_id ON public.teacher_profiles(school_id);
CREATE INDEX IF NOT EXISTS idx_teacher_classes_teacher_id ON public.teacher_classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_exams_teacher_id ON public.exams(teacher_id);
CREATE INDEX IF NOT EXISTS idx_exams_status ON public.exams(status);
CREATE INDEX IF NOT EXISTS idx_exams_class_level ON public.exams(class_level);
CREATE INDEX IF NOT EXISTS idx_exam_questions_exam_id ON public.exam_questions(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_exam_id ON public.exam_attempts(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_student_id ON public.exam_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_analyses_exam_id ON public.analyses(exam_id);

-- 9. STORAGE BUCKET DOCUMENTATION
-- Storage bucket 'question-papers' must be configured in Supabase Storage with Private access.
-- Storage RLS policy requirement:
--   INSERT: authenticated users where auth.uid() matches bucket path folder (e.g., folder = auth.uid()::text)
--   SELECT: authenticated teachers for own files, and students for published exam papers.
