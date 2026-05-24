import { MARKET_WATCHLIST_SYMBOLS, getStockProfile } from '../data/stockProfiles';

// Generates realistic-looking stock price history using random walk with
// drift, occasional market events, and sector-based correlation.
function gaussianRandom(mean = 0, stdev = 1) {
  const u = 1 - Math.random();
  const v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return z * stdev + mean;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function generatePriceHistory(basePrice, volatility, trend, days = 90) {
  const prices = [basePrice];
  for (let i = 1; i <= days; i++) {
    const noise = gaussianRandom(0, volatility);
    const trendBias = trend * 0.001;
    let eventMultiplier = 1.0;
    if (Math.random() > 0.95) {
      eventMultiplier = 1 + gaussianRandom(0, 0.035);
    }
    const prev = prices[i - 1];
    let next = prev * (1 + noise + trendBias) * eventMultiplier;
    next = Math.max(next, 0.01);
    prices.push(Math.round(next * 100) / 100);
  }
  return prices;
}

export function generateOHLC(prices) {
  return prices.map((close, i) => {
    const open = i > 0 ? prices[i - 1] : close;
    const high = Math.max(open, close) * (1 + Math.random() * 0.02);
    const low = Math.min(open, close) * (1 - Math.random() * 0.02);
    const volume = Math.floor(100000 + Math.random() * 900000);
    return {
      day: i,
      open: Math.round(open * 100) / 100,
      close: Math.round(close * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      volume,
    };
  });
}

export function createMarketStock(profile, days = 90) {
  const priceHistory = generatePriceHistory(profile.basePrice, profile.volatility, profile.trend, days);
  const price = priceHistory[priceHistory.length - 1];
  const prevPrice = priceHistory[priceHistory.length - 2];
  const change = price - prevPrice;
  const changePercent = (change / prevPrice) * 100;

  return {
    id: profile.id,
    symbol: profile.ticker,
    name: profile.companyName,
    sector: profile.sector,
    market: profile.market,
    exchange: profile.exchange,
    description: profile.description,
    volatility: profile.volatility,
    trend: profile.trend,
    price,
    change: Math.round(change * 100) / 100,
    changePercent: Math.round(changePercent * 100) / 100,
    priceHistory,
    ohlc: generateOHLC(priceHistory),
  };
}

export function generateMarket(days = 90) {
  return MARKET_WATCHLIST_SYMBOLS.map((symbol) => getStockProfile(symbol))
    .filter(Boolean)
    .map((profile) => createMarketStock(profile, days));
}

export function simulateNextPrice(stock, { newsPressure = 0, marketPressure = 0 } = {}) {
  const volatility = stock.volatility || 0.025;
  const randomNoise = gaussianRandom(0, Math.min(volatility * 0.22, 0.008));
  const trendBias = (stock.trend || 0) * 0.00025;
  const combinedPressure = clamp(newsPressure + marketPressure, -0.009, 0.009);
  const movePercent = clamp(randomNoise + trendBias + combinedPressure, -0.025, 0.025);
  const newPrice = Math.max(0.01, stock.price * (1 + movePercent));
  const roundedPrice = Math.round(newPrice * 100) / 100;
  const change = roundedPrice - stock.price;

  return {
    ...stock,
    price: roundedPrice,
    change: Math.round(change * 100) / 100,
    changePercent: Math.round((change / stock.price) * 10000) / 100,
    priceHistory: [...stock.priceHistory.slice(-89), roundedPrice],
  };
}

export const MARKET_EVENTS = [
  {
    id: 1,
    title: 'Earnings Beat!',
    description: 'A company reported better-than-expected earnings. Price interest rises a little.',
    effect: 'up',
    magnitude: 0.018,
  },
  {
    id: 2,
    title: 'Product Recall',
    description: 'A product was recalled. Some investors become more cautious.',
    effect: 'down',
    magnitude: 0.016,
  },
  {
    id: 3,
    title: 'New Partnership',
    description: 'Two companies announced a partnership.',
    effect: 'up',
    magnitude: 0.014,
  },
  {
    id: 4,
    title: 'Market Pullback',
    description: 'The whole market is a little lower today.',
    effect: 'down',
    magnitude: 0.012,
  },
  {
    id: 5,
    title: 'Viral Product',
    description: 'A product got extra attention on social media.',
    effect: 'up',
    magnitude: 0.02,
  },
  {
    id: 6,
    title: 'Leadership Change',
    description: 'A leader is leaving the company, so investors watch for what comes next.',
    effect: 'down',
    magnitude: 0.017,
  },
  {
    id: 7,
    title: 'Government Grant',
    description: 'The company received a grant that may help future projects.',
    effect: 'up',
    magnitude: 0.015,
  },
  {
    id: 8,
    title: 'Supply Shortage',
    description: 'Supply chain issues may slow production for a short time.',
    effect: 'down',
    magnitude: 0.014,
  },
];

export function getRandomEvent() {
  return MARKET_EVENTS[Math.floor(Math.random() * MARKET_EVENTS.length)];
}

export function applyEvent(stock, event) {
  const cappedMagnitude = clamp(event.magnitude, 0, 0.025);
  const multiplier = event.effect === 'up' ? 1 + cappedMagnitude : 1 - cappedMagnitude;
  const price = Math.round(stock.price * multiplier * 100) / 100;
  const change = price - stock.price;

  return {
    ...stock,
    price,
    change: Math.round(change * 100) / 100,
    changePercent: Math.round((change / stock.price) * 10000) / 100,
    priceHistory: [...stock.priceHistory.slice(-89), price],
  };
}
