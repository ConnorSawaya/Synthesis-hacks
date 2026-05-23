import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildPortfolioValueSeries,
  buildPortfolioHoldings,
  getCurrentHoldingsValue,
  getPortfolioCostBasis,
  getTotalPortfolioValue,
  getTotalSpent,
  getUnrealizedGain,
} from './portfolio.js';

test('portfolio helpers compute spent, value, and gains from holdings and market prices', () => {
  const holdings = [
    { stockId: 1, symbol: 'FUNCO', shares: 4, avgPrice: 20 },
    { stockId: 2, symbol: 'TECHX', shares: 2, avgPrice: 50 },
  ];
  const market = [
    { id: 1, symbol: 'FUNCO', price: 24, name: 'FunCo' },
    { id: 2, symbol: 'TECHX', price: 45, name: 'TechX' },
  ];
  const transactions = [
    { type: 'buy', shares: 4, price: 20 },
    { type: 'buy', shares: 2, price: 50 },
    { type: 'sell', shares: 1, price: 30 },
  ];

  const portfolioHoldings = buildPortfolioHoldings(holdings, market);

  assert.equal(getTotalSpent(transactions), 180);
  assert.equal(getPortfolioCostBasis(portfolioHoldings), 180);
  assert.equal(getCurrentHoldingsValue(portfolioHoldings), 186);
  assert.equal(getUnrealizedGain(portfolioHoldings), 6);
  assert.equal(getTotalPortfolioValue(9820, holdings, market), 10006);
});

test('portfolio value series follows market history and ends at current portfolio value', () => {
  const now = 30_000;
  const pointIntervalMs = 5_000;
  const transactions = [
    { type: 'buy', symbol: 'FUNCO', shares: 2, price: 20, timestamp: 12_000 },
    { type: 'buy', symbol: 'TECHX', shares: 1, price: 50, timestamp: 22_000 },
    { type: 'sell', symbol: 'FUNCO', shares: 1, price: 24, timestamp: 27_000 },
  ];
  const market = [
    { symbol: 'FUNCO', price: 25, priceHistory: [18, 19, 20, 22, 24, 25] },
    { symbol: 'TECHX', price: 55, priceHistory: [45, 46, 47, 50, 53, 55] },
  ];

  const series = buildPortfolioValueSeries({
    startingCash: 200,
    transactions,
    market,
    now,
    pointIntervalMs,
  });

  assert.equal(series.length, 6);
  assert.deepEqual(series.map((point) => point.timestamp), [5_000, 10_000, 15_000, 20_000, 25_000, 30_000]);
  assert.deepEqual(series.map((point) => point.value), [200, 200, 200, 204, 211, 214]);
  assert.equal(
    series.at(-1).value,
    getTotalPortfolioValue(
      134,
      [
        { stockId: 1, symbol: 'FUNCO', shares: 1 },
        { stockId: 2, symbol: 'TECHX', shares: 1 },
      ],
      [
        { id: 1, symbol: 'FUNCO', price: 25 },
        { id: 2, symbol: 'TECHX', price: 55 },
      ]
    )
  );
});
