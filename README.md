# Synthesis-hacks

Experiment shelf. Current contents: **StockPilot** (nested at `StockPilot/StockPilot/`) — a Duolingo-style gamified stock-trading tutor for kids (React + Vite + Tailwind frontend, Express + SQLite backend). Same curriculum-app lineage as StockQuest.

## Run StockPilot (one command per side)
```bash
cd StockPilot/StockPilot/client
npm install
npm run dev        # http://localhost:3000
```
```bash
cd StockPilot/StockPilot/server
cp .env.example .env
npm install
npm run seed       # 5 modules, 17 lessons, 15 badges, 10 stocks
npm run dev        # http://localhost:4000
```

## Test
```bash
cd StockPilot/StockPilot/client && npm run build
cd ../server && npm run seed
```

## Notes
- Double-nested folder (`StockPilot/StockPilot`) is upstream layout; kept as-is (minimal diffs).
- Local only: no cloud DB, no auth secrets (see `server/.env.example`). Never commit `.env`.
