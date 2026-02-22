# ~ discovery

**Prioritizing Scy's ideas** — a personal RICE scoring tool for organizing product ideas across multiple projects.

## What it does

Discovery helps you capture ideas, score them with the [RICE framework](https://www.intercom.com/blog/rice-simple-prioritization-for-product-managers/) (Reach, Impact, Confidence, Effort), and decide what to build next.

- **Multi-project support** — organize ideas into separate projects from a landing page
- **Table view** — sortable spreadsheet with all RICE dimensions, status, and inline actions
- **Kanban view** — drag cards between status columns (Open → To-do → In Progress → Paused → Testing → Done)
- **Drag-and-drop reordering** — manual ordering in both table and kanban views
- **RICE auto-scoring** — scores update live as you adjust reach, impact, confidence, and effort
- **Local-only storage** — everything lives in `localStorage`, no backend

## RICE formula

```
score = (reach × impact × confidence%) / effort
```

| Parameter  | Range         | Notes                       |
|------------|---------------|-----------------------------|
| Reach      | 1–10          | How many people this affects |
| Impact     | 0.25x – 3x    | Minimal → Massive           |
| Confidence | 0–100%        | How sure you are             |
| Effort     | 1+ hours      | Time to implement            |

## Getting started

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`.

## Scripts

| Command           | What it does                  |
|-------------------|-------------------------------|
| `npm run dev`     | Start dev server with HMR     |
| `npm run build`   | Type-check + production build  |
| `npm run preview` | Preview the production build   |
| `npm run lint`    | Run ESLint                     |

## Tech stack

- React 19 + TypeScript
- Vite 7
- [dnd-kit](https://dndkit.com/) for drag-and-drop
- CSS Modules with a custom galaxy/glassmorphism theme
- No router — state-driven navigation via React context

## Project structure

```
src/
├── components/        # UI components
│   ├── ProjectsPage   # Landing page with project grid
│   ├── ProjectCard     # Project card with stats
│   ├── ProjectForm     # Create/edit project modal
│   ├── Header          # Dual-mode header (landing vs project)
│   ├── TableView       # Sortable RICE table
│   ├── KanbanBoard     # Status-column kanban
│   ├── KanbanColumn    # Single kanban column
│   ├── KanbanCard      # Draggable idea card
│   ├── TableRow        # Draggable table row
│   ├── IdeaForm        # Create/edit idea modal
│   ├── RiceScore       # Score badge component
│   └── ConfirmDialog   # Delete confirmation
├── context/
│   └── IdeasContext    # All app state, reducer, persistence
├── styles/            # CSS Modules (galaxy theme)
├── utils/
│   └── rice           # RICE calculation + score colors
└── types.ts           # TypeScript interfaces + constants
```

## Data persistence

All data is stored in `localStorage` under three keys:

| Key                    | Contents                           |
|------------------------|------------------------------------|
| `discovery-ideas`      | Array of ideas with RICE scores    |
| `discovery-projects`   | Array of projects                  |
| `discovery-prefs`      | View mode, sort mode, last project |

If you have ideas from before multi-project support was added, they auto-migrate into a "My Ideas" project on first load.
