import { resolveFinanceNews, getFinanceNewsForTicker } from '../data/financeNews';
import { getStockProfile, normalizeTicker } from '../data/stockProfiles';
import { createMarketStock } from '../lib/stockEngine';

const SEARCH_DELAY_MS = 180;

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getEnv() {
  return typeof import.meta !== 'undefined' ? import.meta.env || {} : {};
}

function getApiBaseUrl() {
  const env = getEnv();
  return env.VITE_API_BASE_URL || '/api';
}

function sortNewsArticles(left, right) {
  return new Date(right.publishedAt) - new Date(left.publishedAt);
}

export function buildStockInfo(stock) {
  if (!stock) return null;

  return {
    ticker: stock.symbol,
    companyName: stock.name,
    currentPrice: stock.price,
    market: stock.market || 'Market',
    exchange: stock.exchange || 'SQX',
    priceChange: stock.change || 0,
    percentChange: stock.changePercent || 0,
    description: stock.description || `${stock.name} is part of the StockPilot market simulation.`,
    lastUpdated: new Date().toISOString(),
  };
}

export function getFinanceNews(options = {}) {
  const { ticker, now = Date.now(), limit } = options;
  const articles = ticker ? getFinanceNewsForTicker(ticker, now) : resolveFinanceNews(now);
  return typeof limit === 'number' ? articles.slice(0, limit) : articles;
}

export async function fetchFinanceNewsFeed(options = {}) {
  const { search = '', symbols = '', now = Date.now() } = options;
  const params = new URLSearchParams();

  if (search) params.set('search', search);
  if (symbols) params.set('symbols', symbols);

  try {
    const response = await fetch(`${getApiBaseUrl()}/news?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`News request failed with status ${response.status}`);
    }

    const payload = await response.json();
    const simulatedArticles = resolveFinanceNews(now);
    const liveArticles = Array.isArray(payload.articles) ? payload.articles : [];
    const mergedArticles = [...liveArticles, ...simulatedArticles];
    const uniqueArticles = mergedArticles.filter(
      (article, index, list) => list.findIndex((entry) => entry.id === article.id) === index
    ).sort(sortNewsArticles);

    return {
      mode: payload.mode || 'simulation_fallback',
      provider: payload.provider || null,
      articles: uniqueArticles,
      message: payload.message || '',
    };
  } catch (error) {
    return {
      mode: 'simulation_fallback',
      provider: null,
      articles: resolveFinanceNews(now),
      message: error.message,
    };
  }
}

export async function fetchStockInfo(ticker, currentMarket = []) {
  const env = getEnv();
  const symbol = normalizeTicker(ticker);

  await wait(SEARCH_DELAY_MS);

  if (!symbol) {
    const error = new Error('Ticker is required.');
    error.code = 'EMPTY_TICKER';
    throw error;
  }

  const existingStock = currentMarket.find((stock) => stock.symbol === symbol);
  if (existingStock) {
    return {
      stock: existingStock,
      info: buildStockInfo(existingStock),
      articles: getFinanceNews({ ticker: symbol }),
      source: 'simulation',
    };
  }

  const profile = getStockProfile(symbol);
  if (!profile) {
    const error = new Error(`Ticker ${symbol} was not found.`);
    error.code = 'NOT_FOUND';
    throw error;
  }

  // This is where a live provider can be added later using VITE_STOCK_DATA_API_KEY.
  // The current app uses simulated prices, so the local data path stays active.
  const usingExternalProvider = Boolean(env.VITE_STOCK_DATA_API_KEY && env.VITE_STOCK_DATA_PROVIDER);
  const stock = createMarketStock(profile, 90);

  return {
    stock,
    info: buildStockInfo(stock),
    articles: getFinanceNews({ ticker: symbol }),
    source: usingExternalProvider ? 'configured-provider-placeholder' : 'simulation',
  };
}
