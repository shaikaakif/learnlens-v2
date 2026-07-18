-- Create the profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    grade TEXT NOT NULL,
    school_name TEXT,
    board TEXT,
    subjects TEXT[] DEFAULT '{}',
    favorite_subject TEXT,
    learning_goals TEXT,
    areas_to_improve TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS (Bypassed by server-side Service Role Key)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
