# SmartSeason – Field Monitoring System

A fully responsive web application for tracking crop progress across multiple fields during a growing season.

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin (Coordinator) | admin@smartseason.io | admin123 |
| Field Agent | james@smartseason.io | agent123 |
| Field Agent | aisha@smartseason.io | agent123 |
| Field Agent | samuel@smartseason.io | agent123 |

---

## Setup Instructions

### Option A — Use as a React Artifact (Claude.ai)
Paste the contents of `SmartSeason.jsx` directly into Claude's artifact runner as a React component.

### Option B — Standalone React App

```bash
npx create-react-app smartseason
cd smartseason
# Replace src/App.js with SmartSeason.jsx contents
npm start
```

### Option C — Full-Stack (Recommended for Production)

**Backend**: Laravel / Node.js + Express  
**Frontend**: React (Vite)  
**Database**: PostgreSQL

```bash
# Frontend
npm create vite@latest smartseason-frontend -- --template react
cd smartseason-frontend
npm install
# Add SmartSeason.jsx as src/App.jsx
npm run dev
```

---

## Design Decisions

### Field Status Logic

Status is **computed at runtime** from field data — not stored — to avoid stale values:

| Condition | Status |
|-----------|--------|
| `stage === "Harvested"` | **Completed** |
| Days since planting > 130% of expected for that stage | **At Risk** |
| No notes filed and planted > 30 days ago | **At Risk** |
| All other cases | **Active** |

Expected stage durations used: Planted ≤ 14 days, Growing ≤ 90 days, Ready ≤ 110 days.

### Architecture

- **Role-based access**: Admins see all fields and the Agents page; Field Agents see only assigned fields.
- **Computed status**: Status is derived, never stored — single source of truth.
- **Separation of concerns**: Data layer (state), business logic (computeStatus), and UI are clearly separated.
- **Optimistic updates**: Field changes are applied immediately in the UI for responsiveness.

### Assumptions

- A field is "At Risk" if it has been planted over 30 days without any agent notes (no monitoring activity).
- Field Agents cannot create or delete fields — only Admins can.
- Both Admins and assigned Field Agents can update stage and add notes.
- The system date is used for status calculations.

---

## Features

- **Authentication** with role-based routing (Admin / Field Agent)
- **Admin Dashboard**: All fields overview, stage breakdown, agent summary, ready-to-harvest alerts
- **Field Agent Dashboard**: Assigned fields, activity feed
- **Fields Page**: Filterable/searchable grid with status indicators
- **Agents Page** (Admin only): Per-agent stats and field assignments
- **Field Detail Modal**: Stage progression tracker, metadata, notes history, inline stage update
- **Add/Edit Field** (Admin): Full form with agent assignment
- **Toast notifications** for all actions
- **Fully responsive**: Mobile-first sidebar with overlay navigation

---

## Tech Stack (this prototype)

- React 18 (hooks only, no external state library)
- Google Fonts (Playfair Display + DM Sans)
- Pure CSS (no Tailwind, no component libraries)
- Zero backend dependencies (mock data in-memory)
