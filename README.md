# ProjectFlow — PM Dashboard

**Live URL:** https://pm-dashboard-eta.vercel.app

---

## Overview

ProjectFlow is a modern project management dashboard built with vanilla JavaScript, Tailwind CSS, and Supabase for data persistence.

---

## Features

- ✅ **Projects & Tasks** — Create, manage, and track projects with tasks
- ✅ **Priority System** — Critical, High, Medium, Low priority levels
- ✅ **Status Tracking** — Active, On Hold, Completed, Cancelled
- ✅ **Calendar View** — FullCalendar integration for scheduling
- ✅ **Dashboard Analytics** — Task stats, progress charts, upcoming deadlines
- ✅ **Sorting & Filtering** — Sort by priority, status, name, or date
- ✅ **Dark/Light Mode** — Toggle between themes
- ✅ **Supabase Backend** — Real-time database for projects and tasks
- ✅ **PWA Ready** — Installable as a Progressive Web App
- ✅ **File Attachments** — Upload files to tasks
- ✅ **Auto-sync GitHub** — Vercel auto-deploys on every push

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla JS + HTML5 |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| Calendar | FullCalendar.js |
| Icons | Font Awesome 6 |
| Deployment | Vercel |
| Source Control | GitHub |

---

## Project Structure

```
pm-dashboard/
├── index.html          # Main dashboard application
├── supabase.js         # Supabase client configuration
├── sw.js               # Service worker for PWA
├── manifest.json       # PWA manifest
├── register-file.html  # File registration page
├── setup-task-files.html # File setup helper
├── SECURITY.md         # Security policy
├── README.md           # This file
└── SQL_CREATE_task_files.sql # Database schema
```

---

## Database Schema

### Projects Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Project name |
| description | TEXT | Project description |
| status | TEXT | active, on-hold, completed, cancelled |
| priority | TEXT | critical, high, medium, low |
| color | TEXT | Hex color code |
| category_id | UUID | FK to categories |
| created_at | TIMESTAMPTZ | Creation timestamp |

### Tasks Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| project_id | UUID | FK to projects |
| title | TEXT | Task title |
| description | TEXT | Task description |
| status | TEXT | todo, in-progress, review, done |
| priority | TEXT | critical, high, medium, low |
| due_date | DATE | Due date |
| created_at | TIMESTAMPTZ | Creation timestamp |

---

## Development

### Local Setup

1. Clone the repository:
```bash
git clone https://github.com/amasercontact/pm-dashboard.git
cd pm-dashboard
```

2. Open `index.html` in a browser (no build step needed)

### Supabase Setup

The app connects to a Supabase project. To use your own:

1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL schema from `SQL_CREATE_task_files.sql`
3. Update `supabase.js` with your project URL and anon key

---

## Deployment

### Automatic (Recommended)

1. Connect the GitHub repo to Vercel
2. Every push to `main` auto-deploys

### Manual

```bash
npx vercel --prod
```

---

## Features Overview

### Projects View
- Grid layout with project cards
- Filter by status and category
- Sort by priority, status, name, or date
- Progress bar showing task completion %

### Tasks View
- List view of all tasks
- Filter by project, status, and priority
- Drag-and-drop status updates
- Task detail modal with full editing

### Calendar View
- Monthly, weekly, and list views
- Tasks with due dates shown as events
- Click to open task details

### Dashboard View
- Total projects and tasks count
- Task completion statistics
- Project progress bars
- Recent activity feed
- Upcoming deadlines

---

## License

MIT License

---

## Authors

- **Ramona** — AI Assistant (OpenClaw)
- **Antonio Godinez** — Project Owner

---

## Support

For issues or feature requests, open a GitHub issue.
