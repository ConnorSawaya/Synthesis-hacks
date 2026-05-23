import { MARKET_TICKER } from '../data/financeNews.js';

const HOUR = 60 * 60 * 1000;
const IMPORTANCE_PRESSURE = {
  low: 0.0012,
  medium: 0.0025,
  high: 0.004,
};
const IMPACT_DURATION_HOURS = {
  low: 4,
  medium: 7,
  high: 10,
};
const SENTIMENT_DIRECTION = {
  positive: 1,
  neutral: 0,
  negative: -1,
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getArticleAge(article, now) {
  const published = new Date(article.publishedAt).getTime();
  return Math.max(0, now - published);
}

export function getNewsImpacts(ticker, articles, now = Date.now()) {
  const symbol = String(ticker || '').trim().toUpperCase();

  return articles
    .filter((article) => article.relatedTickers.includes(symbol))
    .map((article) => {
      const durationHours = IMPACT_DURATION_HOURS[article.importance] || IMPACT_DURATION_HOURS.low;
      const age = getArticleAge(article, now);
      const freshness = clamp(1 - age / (durationHours * HOUR), 0, 1);
      const direction = SENTIMENT_DIRECTION[article.sentiment] || 0;
      const basePressure = IMPORTANCE_PRESSURE[article.importance] || IMPORTANCE_PRESSURE.low;
      const impactScore = direction * basePressure * freshness;
      const startsAt = new Date(article.publishedAt).toISOString();
      const expiresAt = new Date(new Date(article.publishedAt).getTime() + durationHours * HOUR).toISOString();

      return {
        ticker: symbol,
        articleId: article.id,
        sentiment: article.sentiment,
        importance: article.importance,
        impactScore,
        startsAt,
        expiresAt,
      };
    })
    .filter((impact) => Math.abs(impact.impactScore) > 0);
}

export function getTickerNewsPressure(ticker, articles, now = Date.now()) {
  const impactTotal = getNewsImpacts(ticker, articles, now).reduce(
    (sum, impact) => sum + impact.impactScore,
    0
  );

  return clamp(impactTotal, -0.006, 0.006);
}

export function getMarketPressure(articles, now = Date.now()) {
  const marketImpact = getTickerNewsPressure(MARKET_TICKER, articles, now);
  const gentleMarketCycle = Math.sin(now / (1000 * 60 * 7)) * 0.0012;

  return clamp(marketImpact + gentleMarketCycle, -0.004, 0.004);
}

export function getNewsImpactLabel(pressure) {
  if (pressure > 0.0035) return 'strong positive pressure';
  if (pressure > 0.001) return 'mild positive pressure';
  if (pressure < -0.0035) return 'strong negative pressure';
  if (pressure < -0.001) return 'mild negative pressure';
  return 'no clear news pressure';
}

export function buildNewsExplanation({ stock, articles, marketPressure = 0, now = Date.now() }) {
  if (!stock) return [];

  const symbol = stock.symbol;
  const relatedNews = articles.filter((article) => article.relatedTickers.includes(symbol));
  const newsPressure = getTickerNewsPressure(symbol, articles, now);
  const movement = stock.changePercent || 0;
  const movementText =
    Math.abs(movement) < 0.15
      ? 'barely moved'
      : movement > 0
      ? 'moved up a little'
      : 'moved down a little';
  const marketText =
    Math.abs(marketPressure) < 0.001
      ? 'the overall market is fairly calm'
      : marketPressure > 0
      ? 'the overall market is helping a bit'
      : 'the overall market is leaning lower';

  if (relatedNews.length === 0) {
    return [
      `There is no major recent news for ${symbol}, so the price may be moving because of normal market activity.`,
      `${symbol} ${movementText}, and ${marketText}. One possible reason is regular buying and selling in the market simulation.`,
    ];
  }

  const latest = relatedNews[0];
  const cautiousLead =
    latest.sentiment === 'positive'
      ? 'This company had positive news, which may have made some investors more interested.'
      : latest.sentiment === 'negative'
      ? 'This company had some cautious news, which could make some investors wait before buying.'
      : 'This company had mixed or neutral news, so the price may not have one clear news reason.';

  const pressureText = getNewsImpactLabel(newsPressure);

  return [
    cautiousLead,
    `${symbol} ${movementText}. The recent news shows ${pressureText}, but price movement can also come from market mood, timing, and regular trading activity.`,
    `${marketText}. The news could be related to the move, but it is not the only possible reason.`,
  ];
}
