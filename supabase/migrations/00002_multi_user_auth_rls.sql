-- Add user_id to profiles (allowing NULL temporarily for legacy DEMO data)
ALTER TABLE public.profiles
ADD COLUMN user_id UUID REFERENCES auth.users(id) UNIQUE;

-- Add user_id to analyses (allowing NULL temporarily for legacy DEMO data)
ALTER TABLE public.analyses
ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Enable RLS on analyses
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------
-- PROFILES POLICIES
-- --------------------------------------------------------

-- Users can only view their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);


-- --------------------------------------------------------
-- ANALYSES POLICIES
-- --------------------------------------------------------

-- Users can only view their own analyses
CREATE POLICY "Users can view own analyses" 
ON public.analyses 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert their own analyses
CREATE POLICY "Users can insert own analyses" 
ON public.analyses 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own analyses (if needed)
CREATE POLICY "Users can update own analyses" 
ON public.analyses 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_analyses_user_id ON public.analyses(user_id);
