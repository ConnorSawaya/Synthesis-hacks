import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import lessonRoutes from './routes/lessons.js';
import tradingRoutes from './routes/trading.js';
import gamificationRoutes from './routes/gamification.js';

const app = express();
const PORT = process.env.PORT || 4000;
const HOST = process.env.HOST || '127.0.0.1';

// Middleware
app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:5173'] }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', lessonRoutes);
app.use('/api', tradingRoutes);
app.use('/api', gamificationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, HOST, () => {
  console.log(`StockQuest API running on http://${HOST}:${PORT}`);
});
