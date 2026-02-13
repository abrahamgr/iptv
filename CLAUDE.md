# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack IPTV playlist management app. Users add M3U playlists (via URL or file upload), channels are parsed and stored in SQLite, and streams play via HLS.js.

## Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server with HMR (port 3000) |
| `npm run build` | Production build (client + server) |
| `npm run start` | Run production server |
| `npm run lint` | Check with Biome |
| `npm run lint:fix` | Auto-fix with Biome |
| `npm run typecheck` | Generate route types + tsc |

No test framework is configured.

## Tech Stack

- **Framework**: React Router 7 (SSR mode) with React 19
- **Build**: Vite 7, TypeScript 5.9 (strict)
- **Styling**: Tailwind CSS 4 (dark theme throughout)
- **Database**: SQLite (better-sqlite3) with Drizzle ORM
- **Media**: HLS.js for stream playback
- **Linting**: Biome (tabs, single quotes, no semicolons)
- **Git hooks**: Lefthook runs Biome on staged files

## Architecture

**Path alias**: `~/` maps to `app/`

**Routes** (manually configured in `app/routes.ts`):
- `/` — list playlists
- `/playlists/new` — add playlist (URL or file upload)
- `/playlists/:id` — view channels grouped by category
- `/playlists/:id/watch/:channelId` — HLS video player

**Data flow**: Route actions validate input → service layer parses M3U & persists → route loaders fetch data → components render.

**Server-only modules** use `.server.ts` suffix:
- `app/db/schema.server.ts` — Drizzle schema (playlists, channels tables)
- `app/db/client.server.ts` — singleton DB connection (WAL mode, foreign keys)
- `app/lib/playlist-service.server.ts` — CRUD operations, M3U fetching
- `app/lib/m3u-parser.server.ts` — M3U format parser

**Key conventions**:
- Route loaders for reads, actions for mutations (React Router pattern)
- Type-safe route params via `Route.*` types from react-router typegen
- SQLite batch inserts capped at 100 rows (999-variable limit)
- Channels cascade-delete with their playlist
- Database stored at `data/iptv.db`, migrations in `app/db/migrations/`

## Code Style Guidelines

- Use TypeScript for all code; prefer `type` over `interface`
- Never use classes; prefer functional/declarative patterns
- Use descriptive variable names with auxiliary verbs (isLoading, hasError)
- Directory names: lowercase with dashes (auth-wizard)
- Use named exports for components
- Structure files: exported component, subcomponents, helpers, static content, types
- Follow Biomejs rules setup
