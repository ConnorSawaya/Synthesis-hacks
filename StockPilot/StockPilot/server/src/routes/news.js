import { Router } from 'express';

const router = Router();
const MARKETAUX_BASE_URL = 'https://api.marketaux.com/v1/news/all';

function average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function classifySentiment(score) {
  if (score >= 0.12) return 'positive';
  if (score <= -0.12) return 'negative';
  return 'neutral';
}

function classifyImportance({ title, description, avgMatchScore, avgSentimentScore }) {
  const text = `${title} ${description}`.toLowerCase();
  const highSignalPattern = /(earnings|guidance|rate cut|interest rate|inflation|fed|tariff|regulation|investigation|acquisition|merger|margin|supply chain|recall|forecast|downgrade|upgrade|layoffs)/;
  const mediumSignalPattern = /(contract|launch|delivery|demand|spending|cost|preorder|renewal|ad growth|cloud|shipment)/;

  if (highSignalPattern.test(text) || avgMatchScore >= 30 || Math.abs(avgSentimentScore) >= 0.35) {
    return 'high';
  }
  if (mediumSignalPattern.test(text) || avgMatchScore >= 16 || Math.abs(avgSentimentScore) >= 0.18) {
    return 'medium';
  }
  return 'low';
}

function classifyCategory(title, description) {
  const text = `${title} ${description}`.toLowerCase();

  if (/(earnings|revenue|profit|guidance|forecast)/.test(text)) return 'Earnings watch';
  if (/(interest rate|inflation|fed|bond|yield|economy)/.test(text)) return 'Economy';
  if (/(supply|shipment|factory|chip|inventory)/.test(text)) return 'Supply chain';
  if (/(regulation|investigation|antitrust|government|policy|grant|tariff)/.test(text)) return 'Policy and regulation';
  if (/(margin|cost|spending|profitability|capital spending)/.test(text)) return 'Margin pressure';
  if (/(launch|product|device|tool|feature|model)/.test(text)) return 'Product news';
  if (/(contract|sales|renewal|demand|orders|preorder)/.test(text)) return 'Business update';
  return 'Market update';
}

function getWatchMetric(category) {
  const metrics = {
    'Earnings watch': 'Revenue, profit, and next-quarter guidance',
    Economy: 'Rates, inflation, and broader market direction',
    'Supply chain': 'Delivery timing, inventory, and shipments',
    'Policy and regulation': 'Rules, investigations, and public funding decisions',
    'Margin pressure': 'Costs, pricing power, and operating margin',
    'Product news': 'Launch timing, demand, and customer adoption',
    'Business update': 'Orders, renewals, and future sales pipeline',
    'Market update': 'The broader market mood and risk appetite',
  };

  return metrics[category] || metrics['Market update'];
}

function getWhyThisMatters(category, sentiment) {
  const positiveText =
    sentiment === 'positive'
      ? 'This may help confidence, but investors still compare it with expectations and the broader market.'
      : sentiment === 'negative'
      ? 'This can add pressure, though stocks rarely move for just one reason.'
      : 'This may matter, but investors still need more context before reacting strongly.';

  const categoryText = {
    'Earnings watch': 'Earnings stories often matter because they can change how investors see the next few quarters.',
    Economy: 'Economy stories can affect many stocks at once, even when a company has no fresh headline.',
    'Supply chain': 'Supply and delivery timing can change when revenue actually shows up.',
    'Policy and regulation': 'Policy changes can quickly shift costs, growth plans, or risk.',
    'Margin pressure': 'Investors often watch profit margins just as closely as total sales.',
    'Product news': 'Product news helps most when it turns into steady customer demand.',
    'Business update': 'Business updates matter more when they point to lasting sales rather than a one-day boost.',
    'Market update': 'Broader market mood can move stocks even without company-specific news.',
  };

  return `${categoryText[category] || categoryText['Market update']} ${positiveText}`;
}

function mapMarketauxArticle(article) {
  const entities = Array.isArray(article.entities) ? article.entities : [];
  const relatedTickers = [...new Set(entities.map((entity) => entity.symbol).filter(Boolean))].slice(0, 6);
  const sentimentValues = entities.map((entity) => Number(entity.sentiment_score || 0));
  const matchValues = entities.map((entity) => Number(entity.match_score || 0));
  const avgSentimentScore = average(sentimentValues);
  const avgMatchScore = average(matchValues);
  const title = article.title || 'Market update';
  const summary = article.description || article.snippet || article.title || 'Latest market coverage.';
  const category = classifyCategory(title, summary);
  const sentiment = classifySentiment(avgSentimentScore);
  const importance = classifyImportance({
    title,
    description: summary,
    avgMatchScore,
    avgSentimentScore,
  });

  return {
    id: article.uuid || article.id || `${article.source}-${article.published_at}-${title}`,
    title,
    summary,
    source: article.source || 'Live finance source',
    url: article.url || null,
    publishedAt: article.published_at || new Date().toISOString(),
    relatedTickers: relatedTickers.length > 0 ? relatedTickers : ['MARKET'],
    sentiment,
    importance,
    category,
    watchMetric: getWatchMetric(category),
    whyThisMatters: getWhyThisMatters(category, sentiment),
    isLive: true,
  };
}

router.get('/news', async (req, res) => {
  const apiToken = process.env.MARKETAUX_API_TOKEN;

  if (!apiToken) {
    return res.json({
      mode: 'simulation_fallback',
      articles: [],
      message: 'MARKETAUX_API_TOKEN is not configured.',
    });
  }

  try {
    const publishedAfter = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    const params = new URLSearchParams({
      api_token: apiToken,
      language: 'en',
      countries: 'us',
      limit: '24',
      group_similar: 'true',
      must_have_entities: 'true',
      published_after: publishedAfter,
    });

    if (req.query.search) {
      params.set('search', String(req.query.search));
    }

    if (req.query.symbols) {
      params.set('symbols', String(req.query.symbols));
      params.set('filter_entities', 'true');
      params.set('sort', 'entity_match_score');
      params.set('sort_order', 'desc');
    }

    const response = await fetch(`${MARKETAUX_BASE_URL}?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`MarketAux request failed with status ${response.status}`);
    }

    const payload = await response.json();
    const liveArticles = Array.isArray(payload.data) ? payload.data.map(mapMarketauxArticle) : [];

    res.json({
      mode: 'live',
      provider: 'marketaux',
      articles: liveArticles,
    });
  } catch (error) {
    res.status(200).json({
      mode: 'simulation_fallback',
      articles: [],
      message: error.message,
    });
  }
});

export default router;
