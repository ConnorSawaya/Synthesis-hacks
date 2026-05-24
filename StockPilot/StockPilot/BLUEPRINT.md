# StockPilot - Duolingo-Style Stock Trading Education for Kids

## Complete Product Blueprint

---

## 1. Site Map & Page Flow

```
Landing Page
â”œâ”€â”€ Sign Up / Log In
â”‚   â”œâ”€â”€ Kid Account (with parental email)
â”‚   â””â”€â”€ Parent Account
â”‚
â”œâ”€â”€ Dashboard (Home)
â”‚   â”œâ”€â”€ Daily Streak Widget
â”‚   â”œâ”€â”€ Hearts / Lives Display
â”‚   â”œâ”€â”€ XP / Level Progress
â”‚   â”œâ”€â”€ Continue Learning CTA
â”‚   â””â”€â”€ Quick Stats
â”‚
â”œâ”€â”€ Lessons (Learning Path)
â”‚   â”œâ”€â”€ Module 1: Stock Basics
â”‚   â”‚   â”œâ”€â”€ Lesson 1.1: What is a Stock?
â”‚   â”‚   â”œâ”€â”€ Lesson 1.2: How the Market Works
â”‚   â”‚   â”œâ”€â”€ Lesson 1.3: Bulls & Bears
â”‚   â”‚   â”œâ”€â”€ Lesson 1.4: Reading a Stock Ticker
â”‚   â”‚   â””â”€â”€ Quiz: Module 1
â”‚   â”œâ”€â”€ Module 2: Your First Trade
â”‚   â”‚   â”œâ”€â”€ Lesson 2.1: Buying & Selling
â”‚   â”‚   â”œâ”€â”€ Lesson 2.2: Portfolios
â”‚   â”‚   â”œâ”€â”€ Lesson 2.3: Profit & Loss
â”‚   â”‚   â””â”€â”€ Simulated Trade Challenge
â”‚   â”œâ”€â”€ Module 3: Trading Strategies
â”‚   â”‚   â”œâ”€â”€ Lesson 3.1: Buy Low, Sell High
â”‚   â”‚   â”œâ”€â”€ Lesson 3.2: Diversification
â”‚   â”‚   â”œâ”€â”€ Lesson 3.3: Risk vs Reward
â”‚   â”‚   â””â”€â”€ Strategy Challenge
â”‚   â”œâ”€â”€ Module 4: Reading Charts
â”‚   â”‚   â”œâ”€â”€ Lesson 4.1: Line Charts
â”‚   â”‚   â”œâ”€â”€ Lesson 4.2: Candlestick Basics
â”‚   â”‚   â”œâ”€â”€ Lesson 4.3: Trends & Patterns
â”‚   â”‚   â””â”€â”€ Chart Reading Challenge
â”‚   â””â”€â”€ Module 5+: Advanced (Unlockable)
â”‚       â”œâ”€â”€ Lesson: Market Events
â”‚       â”œâ”€â”€ Lesson: Sectors & Industries
â”‚       â””â”€â”€ Sandbox Trading Mode
â”‚
â”œâ”€â”€ Trading Simulator
â”‚   â”œâ”€â”€ Market Overview
â”‚   â”œâ”€â”€ Stock Detail / Buy-Sell
â”‚   â”œâ”€â”€ Portfolio Tracker
â”‚   â””â”€â”€ Trade History
â”‚
â”œâ”€â”€ Leaderboard
â”‚   â”œâ”€â”€ Global Rankings
â”‚   â”œâ”€â”€ Friends / Classroom
â”‚   â””â”€â”€ Weekly Challenges
â”‚
â”œâ”€â”€ Profile & Badges
â”‚   â”œâ”€â”€ Badge Collection
â”‚   â”œâ”€â”€ Trophy Case
â”‚   â”œâ”€â”€ Stats & Achievements
â”‚   â””â”€â”€ Avatar Customization
â”‚
â”œâ”€â”€ Settings
â”‚   â”œâ”€â”€ Account Settings
â”‚   â”œâ”€â”€ Notification Preferences
â”‚   â”œâ”€â”€ Difficulty Toggle
â”‚   â””â”€â”€ Theme Toggle (Light/Dark)
â”‚
â””â”€â”€ Parental Dashboard (Parent Accounts)
    â”œâ”€â”€ Child Progress Overview
    â”œâ”€â”€ Feature Restrictions
    â”œâ”€â”€ Export Reports
    â””â”€â”€ Notification Settings
```

---

## 2. UI/UX Design Outline

### Design System

| Token             | Value                                    |
|-------------------|------------------------------------------|
| Primary Color     | `#4F46E5` (Indigo)                       |
| Success           | `#10B981` (Green)                        |
| Danger            | `#EF4444` (Red)                          |
| Warning           | `#F59E0B` (Amber)                        |
| Background        | `#FFFFFF` (White)                        |
| Surface           | `#F9FAFB` (Light gray)                   |
| Text Primary      | `#111827`                                |
| Text Secondary    | `#6B7280`                                |
| Border            | `#E5E7EB`                                |
| Border Radius     | `12px` (cards), `8px` (buttons/inputs)   |
| Font              | Inter / system-ui                        |
| Shadows           | Flat design - minimal or none            |

### Key Screens

**Dashboard:** Clean card layout. Top row: streak fire icon + count, hearts (â¤ï¸Ã—5), XP bar. Main area: lesson path (vertical node tree like Duolingo). Sidebar: mini leaderboard, daily challenge.

**Lesson Screen:** Full-width white card. Progress bar at top. Question/content in center. Answer options as large tappable cards. Bottom: hearts display, skip button.

**Trading Simulator:** Split layout. Left: stock list with mini sparklines. Right: selected stock chart (line chart), buy/sell controls, portfolio summary card below.

**Leaderboard:** Simple table with rank, avatar, name, XP. Tabs for Global / Friends / Classroom. Current user highlighted.

**Profile:** Avatar at top, stats grid (lessons, XP, streaks, badges), scrollable badge grid below.

---

## 3. Gamification Rules Table

| Mechanic          | Rule                                                       |
|-------------------|------------------------------------------------------------|
| Hearts            | Start with 5. Lose 1 per wrong answer. Refill +1/hour (max 5). Full refill at midnight. |
| XP                | +10 per correct answer. +25 per lesson complete. +50 per module complete. +5 per profitable trade. |
| Streaks           | +1 day for completing â‰¥1 lesson. Reset to 0 if a day is missed. Streak freeze (1 per week) preserves streak. |
| Streak Rewards    | 3-day: +20 XP. 7-day: +50 XP + badge. 30-day: +200 XP + gold badge. |
| Level Unlock      | Must score â‰¥80% on module quiz to unlock next module.      |
| Badges            | First Trade, First Profit, 7-Day Streak, Chart Reader, Diversifier, Risk Manager, etc. |
| Leaderboard       | Ranked by weekly XP. Resets every Monday.                  |
| Daily Challenge    | 1 bonus challenge per day. +30 XP if completed.           |
| Difficulty Scaling | Beginner: guided hints, simpler charts. Intermediate: fewer hints. Advanced: real-time simulation, complex charts. |

---

## 4. Sample Fake Stock Generator Logic

```
function generateStockPrice(basePrice, volatility, trend, days):
    prices = [basePrice]
    for i in 1..days:
        change = randomNormal(0, volatility)    // gaussian noise
        trendBias = trend * 0.01                // slight upward/downward bias
        eventChance = random(0, 1)
        eventMultiplier = 1.0
        if eventChance > 0.95:                  // 5% chance of market event
            eventMultiplier = random(0.9, 1.1)  // Â±10% spike
        newPrice = prices[i-1] * (1 + change + trendBias) * eventMultiplier
        newPrice = max(newPrice, 0.01)          // can't go below $0.01
        prices.append(round(newPrice, 2))
    return prices

// Example stocks
FUNCO  = generateStockPrice(25.00, 0.03, +0.5,  365)  // steady grower
WIPEY  = generateStockPrice(10.00, 0.08, -0.2,  365)  // volatile decliner
SAFEX  = generateStockPrice(50.00, 0.01, +0.1,  365)  // stable blue chip
ROCKYT = generateStockPrice(5.00,  0.12, +1.0,  365)  // high-risk high-reward
```

---

## 5. Database Schema

See `/server/schema.sql` for full SQL schema.

### Core Tables
- **users** - id, email, password_hash, display_name, avatar, role, difficulty, parent_id, hearts, xp, streak_count, streak_last_date, created_at
- **lessons** - id, module_id, title, description, order_index, content_json, type
- **modules** - id, title, description, order_index, required_score
- **user_progress** - user_id, lesson_id, completed, score, completed_at
- **badges** - id, name, description, icon, criteria_type, criteria_value
- **user_badges** - user_id, badge_id, earned_at
- **stocks** - id, symbol, name, sector, base_price, volatility, trend
- **stock_prices** - stock_id, date, open, close, high, low, volume
- **portfolios** - user_id, stock_id, shares, avg_buy_price
- **transactions** - id, user_id, stock_id, type (buy/sell), shares, price, timestamp
- **leaderboard** - user_id, weekly_xp, week_start
- **parental_controls** - parent_id, child_id, trading_enabled, max_daily_minutes, restricted_modules

---

## 6. Roadmap for Real Data Integration

| Phase | Description |
|-------|-------------|
| Phase 1 (Current) | Fully simulated stocks with generated patterns |
| Phase 2 | Delayed real market data (15-min delay) via free APIs (Alpha Vantage, Yahoo Finance) |
| Phase 3 | Paper trading with real-time data via sandbox APIs (Alpaca Paper Trading) |
| Phase 4 | Custodial brokerage integration (with full parental controls) |

### Recommended APIs
- **Alpha Vantage** - Free tier, 5 calls/min, good for delayed data
- **Alpaca Markets** - Paper trading API, free, REST + WebSocket
- **Polygon.io** - Real-time data, education tier available
- **IEX Cloud** - Sandbox mode for testing

---

## 7. Deployment Recommendations

| Component   | Recommendation                          |
|-------------|-----------------------------------------|
| Frontend    | Vercel or Netlify (React SPA)           |
| Backend     | Railway, Render, or AWS ECS             |
| Database    | Supabase (PostgreSQL) or PlanetScale    |
| Auth        | Built-in JWT + bcrypt                   |
| CI/CD       | GitHub Actions â†’ auto-deploy on push    |
| CDN         | Cloudflare (free tier)                  |
| Monitoring  | Sentry (errors), Plausible (analytics)  |
| Storage     | S3 or Supabase Storage (avatars)        |

---

## 8. Lesson Content Examples

### Lesson 1.1: What is a Stock?

**Content:**
> Imagine you love a pizza shop. What if you could OWN a tiny piece of it? That's what a stock is! When you buy a stock, you own a small piece of a company.

**Quiz Questions:**
1. A stock represents... â†’ âœ… A small piece of a company
2. If a company does well, what usually happens to its stock price? â†’ âœ… It goes up
3. True or False: You need millions of dollars to buy stocks. â†’ âœ… False

**Badge Earned:** ðŸŽ“ "First Steps" - Complete your first lesson.

### Trading Exercise: Module 2

**Scenario:**
> FUNCO stock is at $25. You have $100 to invest. The company just released good news!

**Challenge:** Buy stocks, watch the price over 5 simulated days, decide when to sell.

**Success Criteria:** Make any profit â†’ +25 XP, "First Trade" badge.

---

*This blueprint serves as the complete specification. All code is in the project directories.*
