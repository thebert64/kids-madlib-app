# Quick Start Guide

## Prerequisites
- Node.js 18+ installed
- npm or yarn

## Setup & Run

### Step 1: Generate Prisma Client
```bash
npx prisma generate
```

### Step 2: Initialize Database
```bash
# If this is your first time:
npx prisma db push

# Or if you have migration files:
npx prisma migrate deploy
```

### Step 3: Start Development Server
```bash
npm run dev
```

The app will open at: **http://localhost:3000**

---

## Testing the App

1. **Create a Story:**
   - Enter your name
   - Enter a story title
   - Click "🚀 Start New Story"
   - You'll be taken to the story editor

2. **Add to Story:**
   - Type something in the text area
   - Click "✨ Add to Story"
   - Your text will appear in the story

3. **Share Story:**
   - Click "📤 Share Story" button
   - Copy the link or code
   - Send to friends or open in another window

4. **Join Story:**
   - Paste the share link or code
   - Enter your name
   - Click "🎉 Join Story"

---

## If You Get Errors

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for common issues and solutions.

---

## Build for Production

```bash
npm run build
npm run start
```

---

## Database

- Uses **SQLite** by default (stored in `prisma/app.db`)
- To view/edit data: `npx prisma studio`
- To reset database: `rm prisma/app.db` then `npx prisma db push`

---

## Project Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npx prisma studio` | Open Prisma data studio |
| `npx prisma db push` | Create/update database |
| `npx prisma generate` | Generate Prisma client |

---

Need help? Check TROUBLESHOOTING.md! 🆘
