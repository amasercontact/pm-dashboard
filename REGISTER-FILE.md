# Register CURRICULUM.pdf to Task - Instructions

## What was done
✅ **File uploaded to storage:** `CURRICULUM.pdf` is already in Supabase Storage at the correct path for the "Week 3: Data Structures" task.

## To see the file in the dashboard

### Option 1: Run in Browser Console (Easiest)
Open your browser's DevTools console (F12 → Console) while on the PM Dashboard, then paste and run:

```javascript
(function() {
    const FILE_DATA = {
        id: '8971b429-f89e-4958-9b66-fbf27a5fca1a',
        project_id: '273b4434-9d89-460e-af60-4eaba4f13592',
        task_id: '4cc197c9-be96-4cfb-92f2-d6d787f704c0',
        name: 'CURRICULUM.pdf',
        type: 'application/pdf',
        size: 63160,
        storagePath: 'project-files/273b4434-9d89-460e-af60-4eaba4f13592/tasks/4cc197c9-be96-4cfb-92f2-d6d787f704c0/8971b429-f89e-4958-9b66-fbf27a5fca1a/CURRICULUM.pdf',
        publicUrl: 'https://jvndhvkwefokqqaoxfva.supabase.co/storage/v1/object/public/project-files/273b4434-9d89-460e-af60-4eaba4f13592/tasks/4cc197c9-be96-4cfb-92f2-d6d787f704c0/8971b429-f89e-4958-9b66-fbf27a5fca1a/CURRICULUM.pdf',
        uploadedAt: new Date().toISOString(),
        uploadedBy: JSON.parse(localStorage.getItem('pm_current_user') || '{}').id || 'unknown',
        uploadSuccess: true
    };
    
    const currentUser = JSON.parse(localStorage.getItem('pm_current_user'));
    if (!currentUser) { alert('Please log in to the dashboard first!'); return; }
    
    const userKey = 'pm_user_' + currentUser.email;
    const userData = JSON.parse(localStorage.getItem(userKey) || '{"files":[]}');
    if (!userData.files) userData.files = [];
    
    if (userData.files.find(f => f.id === FILE_DATA.id)) {
        console.log('File already registered!');
    } else {
        userData.files.push(FILE_DATA);
        localStorage.setItem(userKey, JSON.stringify(userData));
        console.log('✅ File registered! Reload the dashboard to see it attached to the task.');
    }
})();
```

### Option 2: Open the helper page
1. Go to the PM Dashboard and log in
2. Open this URL in the same browser: `http://localhost:3006/register-file.html`
3. Click "Register File"
4. Reload the dashboard

## Dashboard URL
Currently running at: **http://localhost:3006**

## File Details
- **Task:** Week 3: Data Structures - Lists & Dictionaries
- **File:** CURRICULUM.pdf (63KB)
- **Storage:** Supabase (already uploaded ✓)
