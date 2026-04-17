# Fix for Task File Metadata - Setup Required

## Problem
Files uploaded to tasks were only stored in browser localStorage, making them:
- Only visible in the browser where they were uploaded
- Lost when localStorage was cleared
- Not visible in the PM Dashboard from other browsers/devices

## Solution
Store file metadata in the Supabase database (`task_files` table) instead of just localStorage.

## Changes Made

### 1. supabase.js
Added `SupabaseDBFile` interface with functions:
- `saveFileMetadata(fileData)` - Saves file metadata to database
- `loadProjectFiles(projectId)` - Loads files for a specific project
- `loadAllFiles()` - Loads all files from database
- `deleteFileMetadata(fileId)` - Deletes file metadata from database
- `deleteTaskFileMetadata(taskId)` - Deletes all file metadata for a task

### 2. index.html
Modified to:
- Save file metadata to database when uploading files
- Load file metadata from database when syncing with Supabase
- Delete file metadata from database when deleting files
- Delete file metadata from database when deleting tasks

## One-Time Database Setup Required

You need to create the `task_files` table in Supabase. Run this SQL in the Supabase SQL Editor:

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor** → **New Query**
4. Paste and run the SQL below:

```sql
-- Create task_files table for storing file metadata in the database
CREATE TABLE IF NOT EXISTS public.task_files (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    task_id TEXT,
    name TEXT NOT NULL,
    type TEXT,
    size BIGINT,
    storage_path TEXT,
    public_url TEXT,
    uploaded_at TIMESTAMPTZ DEFAULT NOW(),
    uploaded_by TEXT,
    upload_success BOOLEAN DEFAULT FALSE
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_task_files_project_id ON public.task_files(project_id);
CREATE INDEX IF NOT EXISTS idx_task_files_task_id ON public.task_files(task_id);

-- Enable RLS
ALTER TABLE public.task_files ENABLE ROW LEVEL SECURITY;

-- RLS Policies - using 'anon' because the PM Dashboard uses the anon key (not Supabase Auth)
CREATE POLICY "task_files_select" ON public.task_files FOR SELECT TO anon USING (true);
CREATE POLICY "task_files_insert" ON public.task_files FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "task_files_update" ON public.task_files FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "task_files_delete" ON public.task_files FOR DELETE TO anon USING (true);
```

Alternatively, you can use the SQL file: `SQL_CREATE_task_files.sql`

## After Setup
Once the table is created, files uploaded to tasks will:
1. Be uploaded to Supabase Storage (already working)
2. Have their metadata saved to the `task_files` table (new)
3. Be visible in the PM Dashboard from any browser (new)

## Existing Files
Existing files in localStorage will still work but won't be in the database. 
They will appear as "saved locally (upload pending)" until uploaded to the database.
To migrate existing files, you would need to manually re-upload them or write a migration script.

## Files Modified
- `supabase.js` - Added SupabaseDBFile functions
- `index.html` - Modified file upload/delete to use database
- `SQL_CREATE_task_files.sql` - SQL script to create the table (run once)
