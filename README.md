# 🎨 Mad Libs Stories - Collaborative Story Builder

A fun, interactive kids' mad libs story-building app where children can create hilarious collaborative stories together! Share stories with friends via unique links and take turns building unforgettable narratives.

## ✨ Features

- **🎬 Create & Share Stories**: Generate unique share codes and links to invite friends
- **👥 Collaborative Writing**: Multiple players can add to the same story
- **📝 Turn-Based Gameplay**: Take turns adding parts to create the story
- **🔗 Easy Sharing**: Share via code, link, or native sharing options
- **🌈 Kid-Friendly Interface**: Colorful, engaging, and easy-to-use design
- **💾 Story Persistence**: Stories are saved in the database and can be shared anytime
- **📱 Responsive Design**: Works on desktop, tablet, and mobile devices

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Set up the database:**
```bash
npm run db:migrate
```

Already have a database from before migrations were added (made with `prisma db push`)? Mark the starting schema as applied once, then migrate:
```bash
npx prisma migrate resolve --applied 0_init
npm run db:migrate
```

If that database already has the Mad Libs tables (you ran `prisma db push` after Mad Libs mode was added), also run `npx prisma migrate resolve --applied 20261005000000_add_mad_libs` before `npm run db:migrate`.

3. **Start the development server:**
```bash
npm run dev
```

4. **Open your browser:**
Navigate to (https://fictional-engine-967p4gwwgrqgh76vw-3000.app.github.dev/)

## ✉️ Email Invites

The share dialog can email a join link to a friend. Set these environment variables (for example in `.env`) to turn it on:

```
SMTP_HOST=smtp.example.com
SMTP_PORT=587            # 465 uses TLS automatically
SMTP_USER=your-username  # optional if your server allows unauthenticated sending
SMTP_PASS=your-password
MAIL_FROM="Mad Libs Stories <invites@example.com>"
APP_URL=https://your-site.example  # optional; defaults to the site the request came from
```

Without `SMTP_HOST` and `MAIL_FROM` the invite form tells players to share the link instead. Each IP can send up to 10 invites every 10 minutes. Invite links prefill the player's email on the join page, and it is saved on their `Player` record.

## 📖 How to Use

### Play Mad Libs
1. On the home page pick **🎭 Mad Libs** and choose a story
2. Share the link so friends can join
3. Everyone takes turns filling in words like "adjective" or "animal" without seeing the story
4. When the last blank is filled, everyone sees the big reveal with each player's words highlighted

New Mad Libs stories live in `lib/madlibTemplates.ts`. Write blanks as `{kind}` using a kind from `lib/madlibs.ts`.

> Upgrading an existing database? Run `npx prisma db push` to add the Mad Libs tables.

### Create a Story
1. Go to the home page
2. Enter your name
3. Give your story a title
4. Click "🚀 Start New Story"
5. You'll be taken to the story editor

### Edit & Build the Story
1. View the current story content
2. Add your part in the text area
3. Click "✨ Add to Story" to contribute
4. Watch other players' contributions appear in real-time

### Share the Story
1. Click "📤 Share Story" button
2. Copy the share link or code
3. Send it to friends via any method
4. Friends can join directly from the link or enter the code manually

### Join a Story
1. Click "🔗 Join Existing Story" on the home page
2. Paste the share link or enter the share code
3. Enter your name
4. Click "🎉 Join Story"
5. Start adding to the story!

## 🏗️ Project Structure

```
/app
  /api
    /stories/[id]    - Get/update individual stories
    /players         - Create new players/join story
    /turns          - Add new turns to story
    /join           - Join story via share code
  /components
    /StoryEditor.tsx    - Main editor interface
    /ShareModal.tsx     - Share story modal
    /StoryDisplay.tsx   - Display story content
  /stories/[id]        - Story editor page
  /join/[shareCode]    - Join page for share links
  page.tsx            - Home page

/prisma
  schema.prisma       - Database schema
```

## 🗄️ Database Schema

### Story
- `id`: Unique identifier
- `title`: Story title
- `content`: Full story text
- `shareCode`: Unique share code for invitations
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

### Player
- `id`: Unique identifier
- `name`: Player's display name
- `storyId`: Associated story
- `joinedAt`: Join timestamp

### Turn
- `id`: Unique identifier
- `storyId`: Associated story
- `playerId`: Player who added this turn
- `content`: The text added
- `order`: Turn sequence number
- `createdAt`: Creation timestamp

## 🛠️ Available Commands

```bash
# Development
npm run dev                  # Start dev server at http://localhost:3000

# Production
npm run build               # Build for production
npm run start               # Start production server

# Database
npx prisma migrate dev      # Run migrations
npx prisma studio          # Open Prisma Studio GUI
npx prisma generate        # Generate Prisma client

# Linting
npm run lint               # Run ESLint
```

## 📱 Browser Support

- Chrome/Chromium (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🎮 Gameplay Tips

- **Be Creative**: Use adjectives, nouns, verbs to make the story funny
- **Short & Sweet**: Keep contributions short for better flow
- **Funny Combinations**: The randomness makes the best stories
- **Build on Ideas**: Reference previous parts to create cohesion
- **Take Turns**: Give others time to add their parts

## 🚀 Deployment

This app is ready for deployment on Vercel:

```bash
npm run build
npm run start
```

For Vercel:
```bash
vercel deploy
```

Update environment variables:
```
DATABASE_URL=<your-database-url>
NEXT_PUBLIC_API_URL=<your-production-url>
```

## 🤝 Contributing

Feel free to fork and submit pull requests for improvements!

## 📝 License

This project is open source and available for personal and educational use.

## 🎉 Have Fun!

Create hilarious stories, share laughs with friends, and enjoy the collaborative magic of Mad Libs!
