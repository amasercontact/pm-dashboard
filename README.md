# 📋 Project Management Dashboard

A secure, offline-capable project management dashboard for Antonio and AI agents (Ramona, Midi, Cali, Diggy, Finny, Downy, Cody).

## ✨ Features

### Core Functionality
- **🔐 Secure Authentication** - Password hashing with PBKDF2, session management, auto-logout
- **📁 Project Management** - Create, edit, delete projects with status, priority, due dates, and custom colors
- **✅ Task Management** - Tasks with subtasks, priorities, assignments, and comments
- **📊 Progress Tracking** - Visual progress bars, completion percentages
- **📜 Activity Log** - Track all changes with timestamps

### 📅 Calendar View (NEW!)
- **Month & Week Views** - Toggle between calendar views
- **Project Due Dates** - See project deadlines on the calendar
- **Task Deadlines** - Tasks with due dates appear on calendar
- **Color-Coded Events** - Projects and tasks are color-coded by project
- **Click to View Details** - Click any date to see all events
- **Quick Navigation** - Navigate between months/weeks easily

### 📎 File Drop / Document Storage (NEW!)
- **Project-Specific Folders** - Each project has its own file storage
- **Drag & Drop Upload** - Simply drag files into the drop zone
- **Click to Browse** - Alternative file selection method
- **File Type Icons** - Visual icons for images, PDFs, documents, etc.
- **Download Files** - Download any uploaded file
- **Delete Files** - Remove files when no longer needed
- **IndexedDB Storage** - All files stored locally in your browser
- **File Size Display** - See file sizes at a glance

### Team Members
- 👤 **Antonio** (Human)
- 📋 **Ramona** - Coordinator / Project Manager
- 📢 **Midi** - Social Media / Marketing
- 📅 **Cali** - Calendar / Scheduling
- 🔍 **Diggy** - Research / AI News
- 💰 **Finny** - Financial / Legal
- ✍️ **Downy** - Writing / Content
- 💻 **Cody** - Coding / Tech

### Security Features
- **Password Hashing**: PBKDF2 with 100,000 iterations
- **Session Tokens**: HMAC-signed with expiration
- **Auto-Logout**: Configurable inactivity timeout (5-30 min)
- **Login Protection**: Account lockout after failed attempts
- **XSS Prevention**: Input sanitization
- **Encrypted Storage**: All data stored in IndexedDB

### Design
- 🌙 **Dark/Light Mode** - System-aware with manual toggle
- 🎨 **Project Colors** - Assign custom colors to projects for visual organization
- 📱 **Mobile-First** - Responsive, touch-friendly
- ⚡ **Fast Loading** - Tailwind CSS via CDN
- 🔔 **Notifications** - Browser notification support

### Offline Support
- 📴 **PWA** - Works offline after first load
- 💾 **Local Storage** - IndexedDB for all data (including files)
- 📥 **Export/Import** - Backup and restore as JSON

## 🚀 Quick Start

### Option 1: Direct Browser (No Server Required)

1. Open the folder containing these files
2. Double-click `index.html`
3. Or drag `index.html` into your browser

**Note**: For full PWA/offline support, use a local server.

### Option 2: Local Server (Recommended)

```bash
# Using Python 3
cd pm-dashboard
python3 -m http.server 8000

# Then open http://localhost:8000
```

```bash
# Using Node.js (npx)
cd pm-dashboard
npx serve .

# Or using PHP
php -S localhost:8000
```

### Option 3: VS Code Live Server
1. Install "Live Server" extension in VS Code
2. Right-click `index.html`
3. Select "Open with Live Server"

## 📖 How to Use

### First Time Setup
1. Open the app → Registration form appears
2. Enter username, display name, and password
3. Click "Create Account"
4. Sample project and task will be created for you

### Creating a Project
1. Click "New Project" or the ➕ button
2. Fill in project details:
   - **Name** (required)
   - **Description** - What the project is about
   - **Status** - Active, Paused, Completed, On Hold
   - **Priority** - Low, Medium, High, Urgent
   - **Color** - Choose a color for visual organization
   - **Due Date** - When it should be completed
   - **Team Members** - Assign people/agents
3. Click "Save Project"

### Creating Tasks
1. Open a project
2. Click "Add Task"
3. Fill in task details:
   - **Title** (required)
   - **Description** - Task details
   - **Status** - To Do, In Progress, Done, Blocked
   - **Priority** - Low, Medium, High, Urgent
   - **Assigned To** - Antonio or any AI agent
   - **Due Date** - Task deadline
   - **Subtasks** - Break down into smaller steps
   - **Comments** - Notes about the task

### Calendar View
1. Click **📅 Calendar** in the sidebar
2. **Month View**: See overview of the whole month with event dots
3. **Week View**: See detailed week with event previews
4. **Navigate**: Use ← → buttons to move between months/weeks
5. **View Events**: Click any date to see all events for that day
6. **Color Coding**: Events are colored by their project's color

### File Management
1. Open any project by clicking on it
2. Scroll down to the **📎 Files & Documents** section
3. **Upload**: Drag & drop files OR click to browse
4. **Download**: Click 📥 on any file
5. **Delete**: Click 🗑️ to remove a file
6. Files are stored per-project in IndexedDB

### Views
- **🏠 Dashboard** - Overview with stats and recent activity
- **📁 Projects** - All projects with filtering
- **📅 Calendar** - Calendar view of due dates (NEW!)
- **✅ My Tasks** - Tasks assigned to you
- **🤖 Agent Tasks** - Tasks grouped by AI agent
- **📜 Activity Log** - History of all changes

### Settings
1. Click your avatar/menu
2. Select "⚙️ Settings"
3. Configure:
   - **Theme**: Light, Dark, or System
   - **Notifications**: Enable browser notifications
   - **Session Timeout**: Auto-logout time
   - **Data**: Export, Import, or Clear all data

## 🔐 Security

All security features are documented in [SECURITY.md](SECURITY.md).

Key points:
- Passwords are hashed (never stored in plain text)
- Sessions expire automatically
- Failed login attempts are tracked
- All data stored locally (not sent to any server)
- Files stored in browser IndexedDB, not on any server

## 📂 File Structure

```
pm-dashboard/
├── index.html      # Main application (single file)
├── manifest.json   # PWA manifest
├── sw.js          # Service worker for offline
├── README.md      # This file
└── SECURITY.md    # Security documentation
```

## 🛠️ Troubleshooting

### "Service Worker not supported"
The app works without service workers. Just ignore the error.

### Data not persisting
- Make sure you're not in private/incognito mode
- Check browser storage limits
- Export your data as backup

### Notifications not working
1. Allow notifications when prompted
2. Check browser notification settings
3. Enable in app Settings

### Offline mode not working
1. Open the app while online
2. Wait for "Service Worker registered" in console
3. After that, it works offline

### Files not uploading
- Check browser storage quota (IndexedDB has limits)
- Try smaller files
- Export your data to free up space

## 🔧 Technical Details

### Tech Stack
- **HTML5** - Semantic markup
- **CSS3** - Tailwind CSS via CDN
- **JavaScript** - Vanilla ES6+, no build step
- **IndexedDB** - Local data storage (including files as base64)

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Android)

### Data Storage
- **IndexedDB**: Projects, tasks, activity logs, files
- **SessionStorage**: Session tokens (cleared on close)
- **LocalStorage**: Theme, notifications, timeout settings

## 📝 Data Format

Exported JSON structure:
```json
{
  "version": 2,
  "exportedAt": 1234567890,
  "exportedBy": "username",
  "projects": [...],
  "tasks": [...],
  "activity": [...],
  "files": [...] // File metadata only, base64 data removed for export size
}
```

## 🔄 Updates

Since this is a local app, updates are manual:
1. Backup your data (Settings → Export)
2. Replace `index.html` with new version
3. Import your backup

## 🤝 Contributing

This dashboard is designed for Antonio and his AI agents. Feel free to customize:
- Team members (edit TEAM_MEMBERS array)
- Status options (edit status dropdowns)
- Priority levels (edit priority dropdowns)
- Project colors (edit PROJECT_COLORS array)
- UI colors (edit Tailwind classes)

## 📄 License

Private use for Antonio and team.

---

**Built with 🔒 security, 📱 mobile-first design, and 📅 calendar + 📎 file management!**
-e 
## Vercel Deployment
Auto-deployed from GitHub
