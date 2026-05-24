\# StockPilot

A Duolingo-style gamified website for teaching kids how to trade stocks.

## Quick Start

### Prerequisites
- Node.js 18+
- npm

### Frontend (React + Vite + Tailwind)

```bash
cd client
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Backend (Node.js + Express + SQLite)

```bash
cd server
cp .env.example .env
npm install
npm run seed   # Seeds the database with modules, lessons, badges, stocks
npm run dev
```

API runs at [http://localhost:4000](http://localhost:4000)

## Project Structure

```
â”œâ”€â”€ BLUEPRINT.md              # Complete product blueprint & specification
â”œâ”€â”€ client/                   # React frontend
â”‚   â”œâ”€â”€ src/
â”‚   â”‚   â”œâ”€â”€ components/       # Reusable UI components
â”‚   â”‚   â”‚   â”œâ”€â”€ Navbar.jsx        # Sidebar + mobile navigation
â”‚   â”‚   â”‚   â”œâ”€â”€ Gamification.jsx  # Hearts, XP bar, badges, stats
â”‚   â”‚   â”‚   â”œâ”€â”€ Charts.jsx        # Stock charts, sparklines, portfolio charts
â”‚   â”‚   â”‚   â””â”€â”€ Feedback.jsx      # Animations: correct/wrong, badge unlock, lesson complete
â”‚   â”‚   â”œâ”€â”€ data/
â”‚   â”‚   â”‚   â””â”€â”€ lessons.js        # Full curriculum data (5 modules, 17 lessons)
â”‚   â”‚   â”œâ”€â”€ lib/
â”‚   â”‚   â”‚   â””â”€â”€ stockEngine.js    # Fake stock price generator + market events
â”‚   â”‚   â”œâ”€â”€ pages/
â”‚   â”‚   â”‚   â”œâ”€â”€ Landing.jsx           # Landing page with auth
â”‚   â”‚   â”‚   â”œâ”€â”€ Dashboard.jsx         # Main dashboard
â”‚   â”‚   â”‚   â”œâ”€â”€ LessonsPage.jsx       # Module/lesson overview
â”‚   â”‚   â”‚   â”œâ”€â”€ LessonScreen.jsx      # Interactive lesson player
â”‚   â”‚   â”‚   â”œâ”€â”€ TradingSimulator.jsx  # Stock trading simulator
â”‚   â”‚   â”‚   â”œâ”€â”€ Leaderboard.jsx       # Rankings
â”‚   â”‚   â”‚   â”œâ”€â”€ Profile.jsx           # User profile + badges
â”‚   â”‚   â”‚   â”œâ”€â”€ SettingsPage.jsx      # Settings + difficulty
â”‚   â”‚   â”‚   â””â”€â”€ ParentalDashboard.jsx # Parental controls
â”‚   â”‚   â”œâ”€â”€ store/
â”‚   â”‚   â”‚   â””â”€â”€ useStore.js       # Zustand state management
â”‚   â”‚   â”œâ”€â”€ App.jsx               # Router + layout
â”‚   â”‚   â”œâ”€â”€ main.jsx              # Entry point
â”‚   â”‚   â””â”€â”€ index.css             # Tailwind + custom classes
â”‚   â”œâ”€â”€ index.html
â”‚   â”œâ”€â”€ tailwind.config.js
â”‚   â”œâ”€â”€ vite.config.js
â”‚   â””â”€â”€ package.json
â”‚
â””â”€â”€ server/                   # Node.js backend
    â”œâ”€â”€ src/
    â”‚   â”œâ”€â”€ routes/
    â”‚   â”‚   â”œâ”€â”€ auth.js           # Signup, login, user profile
    â”‚   â”‚   â”œâ”€â”€ lessons.js        # Lesson CRUD, progress tracking
    â”‚   â”‚   â”œâ”€â”€ trading.js        # Stock data, buy/sell, portfolio
    â”‚   â”‚   â””â”€â”€ gamification.js   # Hearts, XP, streaks, badges, leaderboard
    â”‚   â”œâ”€â”€ db.js                 # SQLite database setup + schema
    â”‚   â”œâ”€â”€ auth.js               # JWT token generation + middleware
    â”‚   â”œâ”€â”€ stockEngine.js        # Server-side stock generator
    â”‚   â”œâ”€â”€ seed.js               # Database seeder
    â”‚   â””â”€â”€ index.js              # Express app entry point
    â”œâ”€â”€ schema.sql                # PostgreSQL schema (production)
    â”œâ”€â”€ .env.example
    â””â”€â”€ package.json
```

## Features

- **5 Learning Modules** with 17 lessons covering stock basics â†’ advanced trading
- **Interactive Quizzes** with instant feedback, hearts system, and XP rewards
- **Trading Simulator** with 10 fake stocks, realistic price generation, and market events
- **Gamification**: Hearts, XP/Levels, Streaks, 15 Badges, Leaderboard
- **Parental Controls** with PIN gate, feature restrictions, time limits, and reports
- **Responsive Design** - works on desktop and mobile
- **Clean White Flat UI** - minimalistic, kid-friendly design

## Tech Stack

| Layer      | Technology                                    |
|------------|-----------------------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS, Zustand         |
| Charts     | Recharts                                       |
| Animations | Framer Motion                                  |
| Icons      | Lucide React                                   |
| Backend    | Node.js, Express                               |
| Database   | SQLite (dev) / PostgreSQL (production)          |
| Auth       | JWT + bcrypt                                   |
