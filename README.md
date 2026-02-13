# IPTV

A web application to import, store, and watch IPTV playlists. Add M3U playlists by URL or file upload, and the app parses channels into a local SQLite database for browsing and streaming.

## Features

- Import M3U playlists from a URL or file upload
- Channels stored locally in SQLite for fast offline browsing
- Channels organized by category/group
- Built-in HLS video player for live streams
- Server-side rendered for fast initial loads
- Dark themed responsive UI

## Tech Stack

- **Framework** — React Router 7 (SSR) with React 19
- **Language** — TypeScript (strict mode)
- **Build Tool** — Vite 7
- **Styling** — Tailwind CSS 4
- **Database** — SQLite via better-sqlite3 + Drizzle ORM
- **Video** — HLS.js
- **Linting** — Biome

## Prerequisites

- Node.js 20+
- npm

## Getting Started

Install dependencies:

```bash
npm ci
```

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with HMR |
| `npm run build` | Create production build |
| `npm run start` | Run production server |
| `npm run lint` | Check code with Biome |
| `npm run lint:fix` | Auto-fix lint issues |
| `npm run typecheck` | Run TypeScript type checking |

## Docker

Build and run with Docker:

```bash
docker build -t iptv .
docker run -p 3000:3000 iptv
```

## Project Structure

```
app/
├── components/     # Reusable React components
├── db/             # Drizzle schema, client, and migrations
├── lib/            # Server-side services (M3U parser, playlist service)
├── routes/         # React Router route modules
├── root.tsx        # Root layout
└── routes.ts       # Route definitions
```

## License

MIT
