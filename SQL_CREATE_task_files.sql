-- Create task_files table for storing file metadata in the database
-- This replaces localStorage-only storage which was per-browser

CREATE TABLE IF NOT EXISTS public.task_files (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    task_id TEXT, -- NULL for project-level files, set for task-level files
    name TEXT NOT NULL,
    type TEXT,
    size BIGINT,
    storage_path TEXT,
    public_url TEXT,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    uploaded_by TEXT,
    upload_success BOOLEAN DEFAULT FALSE
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_task_files_project_id ON public.task_files(project_id);
CREATE INDEX IF NOT EXISTS idx_task_files_task_id ON public.task_files(task_id);

-- Enable RLS (Row Level Security)
ALTER TABLE public.task_files ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid duplicates when re-running)
DROP POLICY IF EXISTS "Authenticated users can read file metadata" ON public.task_files;
DROP POLICY IF EXISTS "Authenticated users can insert file metadata" ON public.task_files;
DROP POLICY IF EXISTS "Authenticated users can update file metadata" ON public.task_files;
DROP POLICY IF EXISTS "Authenticated users can delete file metadata" ON public.task_files;
DROP POLICY IF EXISTS "Anyone can read file metadata" ON public.task_files;
DROP POLICY IF EXISTS "Anyone can insert file metadata" ON public.task_files;
DROP POLICY IF EXISTS "Anyone can update file metadata" ON public.task_files;
DROP POLICY IF EXISTS "Anyone can delete file metadata" ON public.task_files;

-- Policy: Allow anyone (including anon) to read files from their projects
-- This is needed because the PM Dashboard uses the anon key, not Supabase Auth
CREATE POLICY "Anyone can read file metadata"
    ON public.task_files FOR SELECT
    TO anon
    USING (true);

-- Policy: Allow anyone (including anon) to insert file metadata
CREATE POLICY "Anyone can insert file metadata"
    ON public.task_files FOR INSERT
    TO anon
    WITH CHECK (true);

-- Policy: Allow anyone (including anon) to update file metadata
CREATE POLICY "Anyone can update file metadata"
    ON public.task_files FOR UPDATE
    TO anon
    USING (true)
    WITH CHECK (true);

-- Policy: Allow anyone (including anon) to delete file metadata
CREATE POLICY "Anyone can delete file metadata"
    ON public.task_files FOR DELETE
    TO anon
    USING (true);

-- Function to get all files for a project (including task-level files)
CREATE OR REPLACE FUNCTION public.get_project_files(p_project_id TEXT)
RETURNS SETOF public.task_files
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY SELECT * FROM public.task_files WHERE project_id = p_project_id ORDER BY uploaded_at DESC;
END;
$$;

-- Function to get files for a specific task
CREATE OR REPLACE FUNCTION public.get_task_files(p_task_id TEXT)
RETURNS SETOF public.task_files
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY SELECT * FROM public.task_files WHERE task_id = p_task_id ORDER BY uploaded_at DESC;
END;
$$;

-- Function to delete all files for a task
CREATE OR REPLACE FUNCTION public.delete_task_files(p_task_id TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM public.task_files WHERE task_id = p_task_id;
END;
$$;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION public.get_project_files TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_task_files TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_task_files TO authenticated;
