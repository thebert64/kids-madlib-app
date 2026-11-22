# Kids Mad Libs Story Builder - Development Guide

## Project Overview
A collaborative, shareable kids' mad libs story-building game where children can create stories together in real-time or turn-based gameplay. Features include:
- **Sharable Story Links**: Generate unique URLs to invite friends
- **Real-time Collaboration**: Live updates with polling mechanism
- **Turn-based Mode**: Take turns adding to stories
- **Story Management**: Save, view, and share stories
- **Kid-friendly UI**: Colorful, interactive interface

## Tech Stack
- **Frontend**: Next.js 14+ with App Router, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite with Prisma ORM
- **Deployment**: Vercel ready

## Key Commands
- `npm install` - Install dependencies
- `npm run dev` - Start development server (http://localhost:3000)
- `npm run build` - Build for production
- `npx prisma migrate dev` - Run database migrations
- `npx prisma studio` - Open Prisma Studio for data inspection

## Database Setup
Uses SQLite by default (./prisma/app.db in project root). Database is auto-initialized on first run.

## Project Pages
- **Home** (`/`): Create or join stories
- **Story Editor** (`/stories/[id]`): Collaborative story editing
- **Join via Code** (`/join`): Enter share code or link
- **Join Direct Link** (`/join/[shareCode]`): Direct share link handler

## API Routes
- `POST /api/stories` - Create new story
- `GET /api/stories/[id]` - Fetch story
- `PUT /api/stories/[id]` - Update story content
- `POST /api/players` - Add player to story
- `POST /api/turns` - Add turn to story
- `POST /api/join` - Join story via share code

## Development Workflow
1. Make code changes
2. Dev server hot-reloads automatically
3. Database updates automatically
4. Test sharing by opening share link in new window/incognito

## Deployment Notes
- Update NEXT_PUBLIC_API_URL env var in production
- Deploy to Vercel for best experience
- Database migrations run automatically

