# Synthesis-hacks

Experiment shelf. Current contents: **StockPilot** (nested at `StockPilot/StockPilot/`) — a Duolingo-style gamified stock-trading tutor for kids (React + Vite + Tailwind frontend, Express + SQLite backend). Same curriculum-app lineage as StockQuest.

## StockPilot browser demo

Expected URL after Pages is enabled and the workflow completes: <https://connorsawaya.github.io/Synthesis-hacks/>. The GitHub Actions workflow builds only `StockPilot/StockPilot/client` on pushes to `main`; direct route refreshes use the generated Pages fallback. The first deployment requires GitHub Pages to be enabled with **Build and deployment → Source → GitHub Actions** in this repository's settings.

Choose **Start the demo** to try it. There is no account, password check, backend, or cross-device sync. Sample progress is saved in the current browser when storage is available; if browser storage is blocked, it lasts only until the tab closes. Market news uses sample data when its optional API is unavailable.

Run the client checks locally:
```bash
cd StockPilot/StockPilot/client
npm ci
npm test
npm run build
```

The Express/SQLite server below remains a separate local development setup and is not part of the hosted demo.

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
