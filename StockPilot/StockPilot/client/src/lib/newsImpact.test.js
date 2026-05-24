import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildNewsExplanation,
  getTickerNewsPressure,
} from './newsImpact.js';

const now = new Date('2026-05-23T12:00:00Z').getTime();

function article(overrides = {}) {
  return {
    id: overrides.id || 'test-article',
    title: 'Test article',
    summary: 'A simple test article.',
    source: 'Test',
    publishedAt: new Date(now - 10 * 60 * 1000).toISOString(),
    relatedTickers: ['AAPL'],
    sentiment: 'positive',
    importance: 'high',
    ...overrides,
  };
}

test('news pressure is capped so one cluster cannot create an instant extreme move', () => {
  const articles = Array.from({ length: 5 }, (_, index) =>
    article({ id: `positive-${index}`, sentiment: 'positive', importance: 'high' })
  );

  const pressure = getTickerNewsPressure('AAPL', articles, now);

  assert.ok(pressure <= 0.006);
  assert.ok(pressure > 0);
});

test('no-news explanation uses normal market activity language', () => {
  const messages = buildNewsExplanation({
    stock: { symbol: 'SAFEX', changePercent: 0.2 },
    articles: [],
    marketPressure: 0.0004,
    now,
  });

  assert.match(messages.join(' '), /no major recent news/i);
  assert.match(messages.join(' '), /normal market activity/i);
});

test('news explanation stays careful and avoids single-cause certainty', () => {
  const messages = buildNewsExplanation({
    stock: { symbol: 'AAPL', changePercent: 0.8 },
    articles: [article()],
    marketPressure: -0.001,
    now,
  });
  const text = messages.join(' ');

  assert.match(text, /may|could|possible/i);
  assert.doesNotMatch(text, /definitely|guaranteed|only reason/i);
});
