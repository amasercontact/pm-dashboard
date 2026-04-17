// Supabase Configuration
window.SUPABASE_URL = 'https://jvndhvkwefokqqaoxfva.supabase.co';
window.SUPABASE_KEY = 'sb_publishable_YOA7ekq-GEnDANSXUWN6Tw_ZtHvqwpU';

// Initialize Supabase client
let supabase = null;

function initSupabaseClient() {
    if (typeof window.supabase !== 'undefined') {
        supabase = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_KEY);
        console.log('Supabase client initialized successfully');
    } else {
        console.error('Supabase SDK not loaded - could not initialize client');
    }
}

// Initialize immediately
initSupabaseClient();

// Debug: Verify initialization after a short delay
setTimeout(() => {
    console.log('Supabase debug check - window.supabase:', typeof window.supabase);
    console.log('Supabase debug check - local supabase:', typeof supabase, supabase ? 'client exists' : 'null');
    if (supabase) {
        console.log('Supabase debug - client refs:', Object.keys(supabase));
    }
}, 1000);

/**
 * Wait for Supabase client to be initialized
 * @param {number} maxRetries - Maximum number of retries (default 50)
 * @param {number} delayMs - Delay between retries in ms (default 100)
 * @returns {Promise<boolean>} - True if client is ready, false otherwise
 */
async function waitForSupabase(maxRetries = 50, delayMs = 100) {
    let retries = 0;
    while (retries < maxRetries) {
        if (supabase && typeof supabase.storage !== 'undefined') {
            return true;
        }
        await new Promise(r => setTimeout(r, delayMs));
        retries++;
    }
    console.error('Supabase client not available after maximum retries');
    return false;
}

// Load ALL projects (no user filter - table doesn't have user_id)
async function loadProjectsDB() {
    if (!supabase) {
        console.error('Supabase client not initialized - supabase is:', typeof supabase);
        return [];
    }
    try {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) { 
            console.error('Load projects error:', error); 
            throw error;
        }
        console.log('Loaded projects from DB:', data);
        // Transform due_date to dueDate for frontend compatibility
        // CRITICAL FIX: Explicitly map category_id to ensure it's preserved
        return (data || []).map(p => ({
            ...p,
            category_id: p.category_id, // Explicit mapping to ensure field is not dropped
            dueDate: p.due_date,
            createdAt: p.created_at,
            updatedAt: p.updated_at
        }));
    } catch (e) {
        console.error('Exception loading projects:', e);
        throw e;
    }
}

// Force refresh - always load from Supabase, ignore localStorage cache
async function loadProjectsFresh() {
    console.log('[REFRESH] Loading fresh projects from Supabase...');
    return loadProjectsDB();
}

// Force refresh - always load all tasks from Supabase
async function loadTasksFresh() {
    console.log('[REFRESH] Loading fresh tasks from Supabase...');
    return loadAllTasksDB();
}

// Load tasks for a project
async function loadTasksDB(projectId) {
    if (!supabase) {
        console.error('Supabase client not initialized');
        return [];
    }
    try {
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('project_id', projectId)
            .order('created_at', { ascending: false });
        if (error) { console.error('Load tasks error:', error); return []; }
        // Transform due_date to dueDate and project_id to projectId for frontend compatibility
        return (data || []).map(task => ({
            ...task,
            dueDate: task.due_date,
            projectId: task.project_id,
            createdAt: task.created_at
        }));
    } catch (e) {
        console.error('Exception loading tasks:', e);
        return [];
    }
}

// Save project
async function saveProjectDB(project) {
    if (!supabase) {
        console.error('SupabaseDB.saveProject - Supabase client not initialized');
        return null;
    }
    try {
        // Transform camelCase to snake_case for Supabase
        const dbProject = {
            name: project.name,
            description: project.description,
            status: project.status,
            priority: project.priority,
            category_id: project.category_id || null,
            due_date: project.dueDate || null,
            color: project.color,
            team_members: project.teamMembers,
            notes: project.notes,
            user_id: project.userId,
            created_at: project.createdAt || new Date().toISOString(),
            updated_at: project.updatedAt || new Date().toISOString()
        };
        console.log('[SupabaseDB.saveProject] RAW project received:', JSON.stringify(project, null, 2));
        console.log('[SupabaseDB.saveProject] category_id from project:', project.category_id, 'type:', typeof project.category_id);
        console.log('[SupabaseDB.saveProject] Transformed dbProject:', JSON.stringify(dbProject, null, 2));
        console.log('[SupabaseDB.saveProject] category_id in dbProject:', dbProject.category_id);
        const { data, error } = await supabase.from('projects').insert([dbProject]).select();
        console.log('[SupabaseDB.saveProject] Supabase response - data:', JSON.stringify(data, null, 2), 'error:', error);
        if (error) { console.error('[SupabaseDB.saveProject] Save project error:', error); return null; }
        if (!data || data.length === 0) {
            console.warn('[SupabaseDB.saveProject] WARNING: No rows returned from insert!');
            return null;
        }
        console.log('[SupabaseDB.saveProject] SUCCESS - returned rows:', data.length, 'category_id:', data[0].category_id);
        return data;
    } catch (e) {
        console.error('[SupabaseDB.saveProject] Exception saving project:', e);
        return null;
    }
}

// Update project
async function updateProjectDB(id, updates) {
    if (!supabase) {
        console.error('SupabaseDB.updateProject - Supabase client not initialized');
        return null;
    }
    try {
        console.log('[SupabaseDB.updateProject] RAW updates received:', JSON.stringify(updates, null, 2));
        
        // Transform camelCase to snake_case for Supabase
        const dbUpdates = {};
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.description !== undefined) dbUpdates.description = updates.description;
        if (updates.status !== undefined) dbUpdates.status = updates.status;
        if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
        if (updates.category_id !== undefined) dbUpdates.category_id = updates.category_id;
        if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;
        if (updates.color !== undefined) dbUpdates.color = updates.color;
        if (updates.teamMembers !== undefined) dbUpdates.team_members = updates.teamMembers;
        if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
        if (updates.userId !== undefined) dbUpdates.user_id = updates.userId;
        if (updates.createdAt !== undefined) dbUpdates.created_at = updates.createdAt;
        if (updates.updatedAt !== undefined) dbUpdates.updated_at = updates.updatedAt;
        
        console.log('[SupabaseDB.updateProject] Transformed dbUpdates:', JSON.stringify(dbUpdates, null, 2));
        
        const { data, error } = await supabase.from('projects').update(dbUpdates).eq('id', id).select();
        
        console.log('[SupabaseDB.updateProject] Supabase response - data:', JSON.stringify(data, null, 2));
        console.log('[SupabaseDB.updateProject] Supabase response - error:', error);
        
        if (error) { 
            console.error('[SupabaseDB.updateProject] Supabase error:', error); 
            return null; 
        }
        
        if (!data || data.length === 0) {
            console.warn('[SupabaseDB.updateProject] WARNING: No rows returned from update! Project may not exist or update failed silently.');
            return null;
        }
        
        console.log('[SupabaseDB.updateProject] SUCCESS - returned rows:', data.length);
        console.log('[SupabaseDB.updateProject] Returned category_id from DB:', data[0].category_id);
        
        return data;
    } catch (e) {
        console.error('[SupabaseDB.updateProject] Exception:', e);
        return null;
    }
}

// Delete project
async function deleteProjectDB(id) {
    if (!supabase) {
        console.error('Supabase client not initialized');
        return;
    }
    try {
        const { error } = await supabase.from('projects').delete().eq('id', id);
        if (error) console.error('Delete project error:', error);
    } catch (e) {
        console.error('Exception deleting project:', e);
    }
}

// Save task
async function saveTaskDB(task) {
    if (!supabase) {
        console.error('Supabase client not initialized');
        return null;
    }
    try {
        // Transform camelCase to snake_case for Supabase
        const dbTask = {
            project_id: task.projectId || task.project_id || null,
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            due_date: task.dueDate || task.due_date || null,
            subtasks: task.subtasks || null,
            comments: task.comments || null,
            user_id: task.userId || task.user_id || null,
            created_at: task.createdAt || task.created_at || new Date().toISOString(),
            updated_at: task.updatedAt || task.updated_at || new Date().toISOString()
        };
        console.log('[SupabaseDB.saveTask] RAW task received:', JSON.stringify(task, null, 2));
        console.log('[SupabaseDB.saveTask] Transformed dbTask:', JSON.stringify(dbTask, null, 2));
        const { data, error } = await supabase.from('tasks').insert([dbTask]).select();
        if (error) { console.error('Save task error:', error); return null; }
        console.log('[SupabaseDB.saveTask] SUCCESS:', data);
        return data;
    } catch (e) {
        console.error('Exception saving task:', e);
        return null;
    }
}

// Update task
async function updateTaskDB(id, updates) {
    if (!supabase) {
        console.error('Supabase client not initialized');
        return null;
    }
    try {
        // Transform camelCase to snake_case for Supabase
        const dbUpdates = {};
        if (updates.projectId !== undefined) dbUpdates.project_id = updates.projectId;
        if (updates.title !== undefined) dbUpdates.title = updates.title;
        if (updates.description !== undefined) dbUpdates.description = updates.description;
        if (updates.status !== undefined) dbUpdates.status = updates.status;
        if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
        if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate;
        if (updates.subtasks !== undefined) dbUpdates.subtasks = updates.subtasks;
        if (updates.comments !== undefined) dbUpdates.comments = updates.comments;
        if (updates.userId !== undefined) dbUpdates.user_id = updates.userId;
        if (updates.createdAt !== undefined) dbUpdates.created_at = updates.createdAt;
        if (updates.updatedAt !== undefined) dbUpdates.updated_at = updates.updatedAt;
        console.log('[SupabaseDB.updateTask] RAW updates:', JSON.stringify(updates, null, 2));
        console.log('[SupabaseDB.updateTask] Transformed dbUpdates:', JSON.stringify(dbUpdates, null, 2));
        const { data, error } = await supabase.from('tasks').update(dbUpdates).eq('id', id).select();
        if (error) { console.error('Update task error:', error); return null; }
        return data;
    } catch (e) {
        console.error('Exception updating task:', e);
        return null;
    }
}

// Delete task
async function deleteTaskDB(id) {
    if (!supabase) {
        console.error('Supabase client not initialized');
        return;
    }
    try {
        const { error } = await supabase.from('tasks').delete().eq('id', id);
        if (error) console.error('Delete task error:', error);
    } catch (e) {
        console.error('Exception deleting task:', e);
    }
}

// Export SupabaseDB interface
window.SupabaseDB = {
    loadProjects: loadProjectsDB,
    loadTasks: loadTasksDB,
    saveProject: saveProjectDB,
    updateProject: updateProjectDB,
    deleteProject: deleteProjectDB,
    saveTask: saveTaskDB,
    updateTask: updateTaskDB,
    deleteTask: deleteTaskDB,
    loadProjectsFresh: loadProjectsFresh,
    loadTasksFresh: loadTasksFresh
};

console.log('SupabaseDB wrapper ready, supabase client:', supabase ? 'initialized' : 'NOT initialized');
// Load ALL tasks (no filter) with field transformation
async function loadAllTasksDB() {
    if (!supabase) {
        console.error('Supabase client not initialized');
        return [];
    }
    try {
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) { console.error('Load all tasks error:', error); return []; }
        // Transform due_date to dueDate and project_id to projectId for frontend compatibility
        return (data || []).map(task => ({
            ...task,
            dueDate: task.due_date,
            projectId: task.project_id,
            createdAt: task.created_at
        }));
    } catch (error) {
        console.error('Load all tasks error:', error);
        return [];
    }
}

// Update the exports
window.SupabaseDB.loadAllTasks = loadAllTasksDB;

// ============================================================
// File Storage Functions (via Supabase Storage)
// Bucket: project-files
// Path convention: project-files/{projectId}/{fileId}/{filename}
// ============================================================

const STORAGE_BUCKET = 'project-files';

/**
 * Upload a file to project-files storage
 * @param {File} file - The file to upload
 * @param {string} projectId - The project ID
 * @param {string} fileId - The file ID (used as folder segment)
 * @param {string|null} taskId - Optional task ID for task-attached files
 * @returns {Promise<{publicUrl: string, path: string, error: string|null}>}
 */
async function uploadFileToStorage(file, projectId, fileId, taskId = null) {
    // Wait for Supabase to be ready
    const isReady = await waitForSupabase();
    if (!isReady) {
        console.error('Supabase client not available for upload');
        return { publicUrl: null, path: null, error: 'Client not available' };
    }

    const filename = file.name;
    // Task files go to: project-files/{projectId}/tasks/{taskId}/{fileId}/{filename}
    // Project files go to: project-files/{projectId}/{fileId}/{filename}
    const storagePath = taskId
        ? `${STORAGE_BUCKET}/${projectId}/tasks/${taskId}/${fileId}/${filename}`
        : `${STORAGE_BUCKET}/${projectId}/${fileId}/${filename}`;

    console.log('Starting upload to path:', storagePath);

    try {
        const { data, error } = await supabase.storage
            .from(STORAGE_BUCKET)
            .upload(storagePath, file, {
                cacheControl: '3600',
                upsert: true
            });

        if (error) {
            console.error('Upload file error:', error);
            return { publicUrl: null, path: null, error: error.message };
        }

        console.log('Upload successful, data:', data);

        // Get public URL after upload
        const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);

        console.log('Public URL:', urlData.publicUrl);

        return { publicUrl: urlData.publicUrl, path: storagePath, error: null };
    } catch (e) {
        console.error('Exception uploading file:', e);
        return { publicUrl: null, path: null, error: e.message };
    }
}

/**
 * Get a signed URL for a file (for private buckets, or public URL for public)
 * @param {string} projectId - The project ID
 * @param {string} fileId - The file ID
 * @param {string} filename - The filename
 * @param {number} expiresIn - URL expiry in seconds (default 3600)
 * @param {string|null} taskId - Optional task ID for task-attached files
 * @returns {Promise<{url: string, error: string|null}>}
 */
async function getFileUrl(projectId, fileId, filename, expiresIn = 3600, taskId = null) {
    const isReady = await waitForSupabase();
    if (!isReady) {
        return { url: null, error: 'Client not available' };
    }

    // Task files path: project-files/{projectId}/tasks/{taskId}/{fileId}/{filename}
    // Project files path: project-files/{projectId}/{fileId}/{filename}
    const path = taskId
        ? `${STORAGE_BUCKET}/${projectId}/tasks/${taskId}/${fileId}/${filename}`
        : `${STORAGE_BUCKET}/${projectId}/${fileId}/${filename}`;

    try {
        // Try signed URL first (works for both public and private buckets)
        const { data, error } = await supabase.storage
            .from(STORAGE_BUCKET)
            .createSignedUrl(path, expiresIn);

        if (error) {
            // Fall back to public URL if signed URL fails
            console.warn('Signed URL failed, falling back to public URL:', error);
            const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
            return { url: urlData.publicUrl, error: null };
        }

        return { url: data.signedUrl, error: null };
    } catch (e) {
        console.error('Exception getting file URL:', e);
        return { url: null, error: e.message };
    }
}

/**
 * List all files in a project's storage folder
 * @param {string} projectId - The project ID
 * @returns {Promise<{files: Array, error: string|null}>}
 */
async function listProjectFiles(projectId) {
    const isReady = await waitForSupabase();
    if (!isReady) {
        return { files: [], error: 'Client not available' };
    }

    const folderPath = `${STORAGE_BUCKET}/${projectId}`;

    try {
        const { data, error } = await supabase.storage
            .from(STORAGE_BUCKET)
            .list(folderPath, {
                limit: 100,
                sortBy: { column: 'created_at', order: 'desc' }
            });

        if (error) {
            console.error('List project files error:', error);
            return { files: [], error: error.message };
        }

        // data contains folders (fileIds) and their contents
        const files = [];

        if (data && data.length > 0) {
            for (const item of data) {
                if (item.id) {
                    // This is a folder (fileId), list its contents
                    const fileIdPath = `${folderPath}/${item.name}`;
                    const { data: subFiles, error: subError } = await supabase.storage
                        .from(STORAGE_BUCKET)
                        .list(fileIdPath, {
                            limit: 100,
                            sortBy: { column: 'created_at', order: 'desc' }
                        });

                    if (!subError && subFiles) {
                        for (const subFile of subFiles) {
                            files.push({
                                fileId: item.name,
                                projectId: projectId,
                                filename: subFile.name,
                                path: `${fileIdPath}/${subFile.name}`,
                                size: subFile.metadata?.size,
                                createdAt: subFile.created_at,
                                lastModified: subFile.metadata?.lastModified
                            });
                        }
                    }
                }
            }
        }

        return { files, error: null };
    } catch (e) {
        console.error('Exception listing project files:', e);
        return { files: [], error: e.message };
    }
}

/**
 * Delete a file from project-files storage
 * @param {string} projectId - The project ID
 * @param {string} fileId - The file ID
 * @param {string} filename - The filename
 * @param {string|null} taskId - Optional task ID for task-attached files
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
async function deleteFileFromStorage(projectId, fileId, filename, taskId = null) {
    const isReady = await waitForSupabase();
    if (!isReady) {
        return { success: false, error: 'Client not available' };
    }

    // Task files path: project-files/{projectId}/tasks/{taskId}/{fileId}/{filename}
    // Project files path: project-files/{projectId}/{fileId}/{filename}
    const path = taskId
        ? `${STORAGE_BUCKET}/${projectId}/tasks/${taskId}/${fileId}/${filename}`
        : `${STORAGE_BUCKET}/${projectId}/${fileId}/${filename}`;

    try {
        const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([path]);

        if (error) {
            console.error('Delete file error:', error);
            return { success: false, error: error.message };
        }

        return { success: true, error: null };
    } catch (e) {
        console.error('Exception deleting file:', e);
        return { success: false, error: e.message };
    }
}

/**
 * List all files in a task's storage folder
 * @param {string} projectId - The project ID
 * @param {string} taskId - The task ID
 * @returns {Promise<{files: Array, error: string|null}>}
 */
async function listTaskFiles(projectId, taskId) {
    const isReady = await waitForSupabase();
    if (!isReady) {
        return { files: [], error: 'Client not available' };
    }

    const folderPath = `${STORAGE_BUCKET}/${projectId}/tasks/${taskId}`;

    try {
        const { data, error } = await supabase.storage
            .from(STORAGE_BUCKET)
            .list(folderPath, {
                limit: 100,
                sortBy: { column: 'created_at', order: 'desc' }
            });

        if (error) {
            console.error('List task files error:', error);
            return { files: [], error: error.message };
        }

        const files = [];

        if (data && data.length > 0) {
            for (const item of data) {
                if (item.id) {
                    // This is a folder (fileId), list its contents
                    const fileIdPath = `${folderPath}/${item.name}`;
                    const { data: subFiles, error: subError } = await supabase.storage
                        .from(STORAGE_BUCKET)
                        .list(fileIdPath, {
                            limit: 100,
                            sortBy: { column: 'created_at', order: 'desc' }
                        });

                    if (!subError && subFiles) {
                        for (const subFile of subFiles) {
                            files.push({
                                fileId: item.name,
                                projectId: projectId,
                                taskId: taskId,
                                filename: subFile.name,
                                path: `${fileIdPath}/${subFile.name}`,
                                size: subFile.metadata?.size,
                                createdAt: subFile.created_at,
                                lastModified: subFile.metadata?.lastModified
                            });
                        }
                    }
                }
            }
        }

        return { files, error: null };
    } catch (e) {
        console.error('Exception listing task files:', e);
        return { files: [], error: e.message };
    }
}

/**
 * Delete all files for a task (used when deleting a task - cascading cleanup)
 * @param {string} projectId - The project ID
 * @param {string} taskId - The task ID
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
async function deleteTaskFiles(projectId, taskId) {
    const isReady = await waitForSupabase();
    if (!isReady) {
        return { success: false, error: 'Client not available' };
    }

    const folderPath = `${STORAGE_BUCKET}/${projectId}/tasks/${taskId}`;

    try {
        // List all files in the task folder
        const { data, error } = await supabase.storage
            .from(STORAGE_BUCKET)
            .list(folderPath, {
                limit: 100,
                sortBy: { column: 'created_at', order: 'desc' }
            });

        if (error) {
            console.error('List task files for delete error:', error);
            return { success: false, error: error.message };
        }

        if (data && data.length > 0) {
            // Collect all file paths to delete
            const pathsToDelete = [];

            for (const item of data) {
                if (item.id) {
                    const fileIdPath = `${folderPath}/${item.name}`;
                    const { data: subFiles, error: subError } = await supabase.storage
                        .from(STORAGE_BUCKET)
                        .list(fileIdPath, {
                            limit: 100,
                            sortBy: { column: 'created_at', order: 'desc' }
                        });

                    if (!subError && subFiles) {
                        for (const subFile of subFiles) {
                            pathsToDelete.push(`${fileIdPath}/${subFile.name}`);
                        }
                    }
                }
            }

            if (pathsToDelete.length > 0) {
                const { error: deleteError } = await supabase.storage.from(STORAGE_BUCKET).remove(pathsToDelete);
                if (deleteError) {
                    console.error('Delete task files error:', deleteError);
                    return { success: false, error: deleteError.message };
                }
            }
        }

        return { success: true, error: null };
    } catch (e) {
        console.error('Exception deleting task files:', e);
        return { success: false, error: e.message };
    }
}

// Export SupabaseStorage interface
window.SupabaseStorage = {
    uploadFile: uploadFileToStorage,
    getFileUrl: getFileUrl,
    listProjectFiles: listProjectFiles,
    listTaskFiles: listTaskFiles,
    deleteFile: deleteFileFromStorage,
    deleteTaskFiles: deleteTaskFiles
};

console.log('SupabaseStorage wrapper ready');

// ============================================================
// File Metadata Database Functions (NEW - fixes localStorage issue)
// Table: task_files (stores metadata for both project-level and task-level files)
// ============================================================

/**
 * Save file metadata to database
 * @param {Object} fileData - File metadata object
 * @returns {Promise<{data: Object|null, error: String|null}>}
 */
async function saveFileMetadataDB(fileData) {
    const isReady = await waitForSupabase();
    if (!isReady) {
        console.error('Supabase client not available for saveFileMetadataDB');
        return { data: null, error: 'Client not available' };
    }
    
    try {
        const dbRecord = {
            id: fileData.id,
            project_id: fileData.project_id,
            task_id: fileData.task_id || null,
            name: fileData.name,
            type: fileData.type || null,
            size: fileData.size || null,
            storage_path: fileData.storagePath || null,
            public_url: fileData.publicUrl || null,
            uploaded_at: fileData.uploadedAt || new Date().toISOString(),
            uploaded_by: fileData.uploadedBy || null,
            upload_success: fileData.uploadSuccess || false
        };
        
        const { data, error } = await supabase
            .from('task_files')
            .insert([dbRecord])
            .select();
        
        if (error) {
            console.error('saveFileMetadataDB error:', error);
            return { data: null, error: error.message };
        }
        
        console.log('File metadata saved to DB:', data);
        return { data: data?.[0] || null, error: null };
    } catch (e) {
        console.error('Exception saveFileMetadataDB:', e);
        return { data: null, error: e.message };
    }
}

/**
 * Load all file metadata from database for a project
 * @param {string} projectId - Project ID
 * @returns {Promise<{files: Array, error: String|null}>}
 */
async function loadProjectFilesDB(projectId) {
    const isReady = await waitForSupabase();
    if (!isReady) {
        console.error('Supabase client not available for loadProjectFilesDB');
        return { files: [], error: 'Client not available' };
    }
    
    try {
        const { data, error } = await supabase
            .from('task_files')
            .select('*')
            .eq('project_id', projectId)
            .order('uploaded_at', { ascending: false });
        
        if (error) {
            console.error('loadProjectFilesDB error:', error);
            return { files: [], error: error.message };
        }
        
        // Transform database fields to frontend format
        const files = (data || []).map(f => ({
            id: f.id,
            project_id: f.project_id,
            task_id: f.task_id,
            name: f.name,
            type: f.type,
            size: f.size,
            storagePath: f.storage_path,
            publicUrl: f.public_url,
            uploadedAt: f.uploaded_at,
            uploadedBy: f.uploaded_by,
            uploadSuccess: f.upload_success
        }));
        
        console.log('Loaded project files from DB:', files.length, 'files');
        return { files, error: null };
    } catch (e) {
        console.error('Exception loadProjectFilesDB:', e);
        return { files: [], error: e.message };
    }
}

/**
 * Load all file metadata from database (all projects for current user)
 * @returns {Promise<{files: Array, error: String|null}>}
 */
async function loadAllFilesDB() {
    const isReady = await waitForSupabase();
    if (!isReady) {
        console.error('Supabase client not available for loadAllFilesDB');
        return { files: [], error: 'Client not available' };
    }
    
    try {
        const { data, error } = await supabase
            .from('task_files')
            .select('*')
            .order('uploaded_at', { ascending: false });
        
        if (error) {
            console.error('loadAllFilesDB error:', error);
            return { files: [], error: error.message };
        }
        
        // Transform database fields to frontend format
        const files = (data || []).map(f => ({
            id: f.id,
            project_id: f.project_id,
            task_id: f.task_id,
            name: f.name,
            type: f.type,
            size: f.size,
            storagePath: f.storage_path,
            publicUrl: f.public_url,
            uploadedAt: f.uploaded_at,
            uploadedBy: f.uploaded_by,
            uploadSuccess: f.upload_success
        }));
        
        console.log('Loaded all files from DB:', files.length, 'files');
        return { files, error: null };
    } catch (e) {
        console.error('Exception loadAllFilesDB:', e);
        return { files: [], error: e.message };
    }
}

/**
 * Delete file metadata from database
 * @param {string} fileId - File ID
 * @returns {Promise<{success: boolean, error: String|null}>}
 */
async function deleteFileMetadataDB(fileId) {
    const isReady = await waitForSupabase();
    if (!isReady) {
        console.error('Supabase client not available for deleteFileMetadataDB');
        return { success: false, error: 'Client not available' };
    }
    
    try {
        const { error } = await supabase
            .from('task_files')
            .delete()
            .eq('id', fileId);
        
        if (error) {
            console.error('deleteFileMetadataDB error:', error);
            return { success: false, error: error.message };
        }
        
        console.log('File metadata deleted from DB:', fileId);
        return { success: true, error: null };
    } catch (e) {
        console.error('Exception deleteFileMetadataDB:', e);
        return { success: false, error: e.message };
    }
}

/**
 * Delete all file metadata for a task from database
 * @param {string} taskId - Task ID
 * @returns {Promise<{success: boolean, error: String|null}>}
 */
async function deleteTaskFileMetadataDB(taskId) {
    const isReady = await waitForSupabase();
    if (!isReady) {
        console.error('Supabase client not available for deleteTaskFileMetadataDB');
        return { success: false, error: 'Client not available' };
    }
    
    try {
        const { error } = await supabase
            .from('task_files')
            .delete()
            .eq('task_id', taskId);
        
        if (error) {
            console.error('deleteTaskFileMetadataDB error:', error);
            return { success: false, error: error.message };
        }
        
        console.log('Task file metadata deleted from DB:', taskId);
        return { success: true, error: null };
    } catch (e) {
        console.error('Exception deleteTaskFileMetadataDB:', e);
        return { success: false, error: e.message };
    }
}

// Export SupabaseDBFile interface
window.SupabaseDBFile = {
    saveFileMetadata: saveFileMetadataDB,
    loadProjectFiles: loadProjectFilesDB,
    loadAllFiles: loadAllFilesDB,
    deleteFileMetadata: deleteFileMetadataDB,
    deleteTaskFileMetadata: deleteTaskFileMetadataDB
};

console.log('SupabaseDBFile wrapper ready');

// ============================================================
// Categories CRUD Functions
// ============================================================

/**
 * Load all categories
 * @returns {Promise<{categories: Array, error: String|null}>}
 */
async function loadCategoriesDB() {
    const isReady = await waitForSupabase();
    if (!isReady) {
        return { categories: [], error: 'Client not available' };
    }
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('name', { ascending: true });
        if (error) {
            console.error('loadCategoriesDB error:', error);
            return { categories: [], error: error.message };
        }
        console.log('Loaded categories from DB:', data?.length || 0, 'categories');
        return { categories: data || [], error: null };
    } catch (e) {
        console.error('Exception loadCategoriesDB:', e);
        return { categories: [], error: e.message };
    }
}

/**
 * Create a new category
 * @param {Object} category - { name: string, color?: string }
 * @returns {Promise<{data: Object|null, error: String|null}>}
 */
async function createCategoryDB(category) {
    const isReady = await waitForSupabase();
    if (!isReady) {
        return { data: null, error: 'Client not available' };
    }
    try {
        const { data, error } = await supabase
            .from('categories')
            .insert([{
                name: category.name,
                color: category.color || '#6366f1'
            }])
            .select();
        if (error) {
            console.error('createCategoryDB error:', error);
            return { data: null, error: error.message };
        }
        console.log('Category created:', data);
        return { data: data?.[0] || null, error: null };
    } catch (e) {
        console.error('Exception createCategoryDB:', e);
        return { data: null, error: e.message };
    }
}

/**
 * Update a category
 * @param {string} id - Category ID
 * @param {Object} updates - { name?: string, color?: string }
 * @returns {Promise<{data: Object|null, error: String|null}>}
 */
async function updateCategoryDB(id, updates) {
    const isReady = await waitForSupabase();
    if (!isReady) {
        return { data: null, error: 'Client not available' };
    }
    try {
        const { data, error } = await supabase
            .from('categories')
            .update(updates)
            .eq('id', id)
            .select();
        if (error) {
            console.error('updateCategoryDB error:', error);
            return { data: null, error: error.message };
        }
        console.log('Category updated:', data);
        return { data: data?.[0] || null, error: null };
    } catch (e) {
        console.error('Exception updateCategoryDB:', e);
        return { data: null, error: e.message };
    }
}

/**
 * Delete a category
 * @param {string} id - Category ID
 * @returns {Promise<{success: boolean, error: String|null}>}
 */
async function deleteCategoryDB(id) {
    const isReady = await waitForSupabase();
    if (!isReady) {
        return { success: false, error: 'Client not available' };
    }
    try {
        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id);
        if (error) {
            console.error('deleteCategoryDB error:', error);
            return { success: false, error: error.message };
        }
        console.log('Category deleted:', id);
        return { success: true, error: null };
    } catch (e) {
        console.error('Exception deleteCategoryDB:', e);
        return { success: false, error: e.message };
    }
}

// Export Categories interface
window.SupabaseCategories = {
    loadAll: loadCategoriesDB,
    create: createCategoryDB,
    update: updateCategoryDB,
    delete: deleteCategoryDB
};

console.log('SupabaseCategories wrapper ready');
