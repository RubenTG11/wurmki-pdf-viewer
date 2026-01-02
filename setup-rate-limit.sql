-- Create table to track test question generations
CREATE TABLE IF NOT EXISTS public.test_question_generations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pdf_name TEXT NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_test_generations_user_time
  ON public.test_question_generations(user_id, generated_at DESC);

-- Enable Row Level Security
ALTER TABLE public.test_question_generations ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only see their own generations
CREATE POLICY "Users can view own generations"
  ON public.test_question_generations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own generations"
  ON public.test_question_generations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all (optional, for monitoring)
CREATE POLICY "Admins can view all generations"
  ON public.test_question_generations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to clean up old generations (older than 24 hours)
CREATE OR REPLACE FUNCTION public.cleanup_old_generations()
RETURNS void AS $$
BEGIN
  DELETE FROM public.test_question_generations
  WHERE generated_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Optional: Set up a cron job to run cleanup daily
-- (Requires pg_cron extension, might not be available on all Supabase plans)
-- SELECT cron.schedule('cleanup-test-generations', '0 0 * * *', 'SELECT public.cleanup_old_generations()');
