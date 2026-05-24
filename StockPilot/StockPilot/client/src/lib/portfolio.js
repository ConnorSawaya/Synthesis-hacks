export function buildPortfolioHoldings(holdings, market) {
  return holdings
    .map((holding) => {
      const stock = market.find((entry) => entry.id === holding.stockId);
      if (!stock) return null;

      const spent = holding.avgPrice * holding.shares;
      const currentValue = stock.price * holding.shares;
      const gain = currentValue - spent;

      return {
        ...holding,
        stock,
        spent,
        currentValue,
        gain,
      };
    })
    .filter(Boolean);
}

export function getTotalPortfolioValue(cash, holdings, market) {
  return cash + holdings.reduce((sum, holding) => {
    const current = market.find((stock) => stock.id === holding.stockId);
    return sum + (current ? current.price : holding.avgPrice) * holding.shares;
  }, 0);
}

export function getTotalSpent(transactions) {
  return transactions
    .filter((transaction) => transaction.type === 'buy')
    .reduce((sum, transaction) => sum + transaction.price * transaction.shares, 0);
}

export function getPortfolioCostBasis(portfolioHoldings) {
  return portfolioHoldings.reduce((sum, holding) => sum + holding.spent, 0);
}

export function getCurrentHoldingsValue(portfolioHoldings) {
  return portfolioHoldings.reduce((sum, holding) => sum + holding.currentValue, 0);
}

export function getUnrealizedGain(portfolioHoldings) {
  return portfolioHoldings.reduce((sum, holding) => sum + holding.gain, 0);
}

export function buildPortfolioValueSeries({
  startingCash = 0,
  transactions = [],
  market = [],
  now = Date.now(),
  pointIntervalMs = 5000,
}) {
  const historyLengths = market
    .map((stock) => stock.priceHistory?.length || 0)
    .filter((length) => length > 0);

  const pointCount = historyLengths.length > 0 ? Math.min(...historyLengths) : 1;
  const seriesStart = now - (pointCount - 1) * pointIntervalMs;
  const sortedTransactions = [...transactions].sort((left, right) => left.timestamp - right.timestamp);
  const holdingsBySymbol = new Map();
  let runningCash = startingCash;
  let transactionIndex = 0;

  while (
    transactionIndex < sortedTransactions.length &&
    Number(sortedTransactions[transactionIndex]?.timestamp) < seriesStart
  ) {
    const transaction = sortedTransactions[transactionIndex];
    const currentShares = holdingsBySymbol.get(transaction.symbol) || 0;
    const tradeValue = transaction.price * transaction.shares;

    if (transaction.type === 'buy') {
      runningCash -= tradeValue;
      holdingsBySymbol.set(transaction.symbol, currentShares + transaction.shares);
    } else {
      runningCash += tradeValue;
      holdingsBySymbol.set(transaction.symbol, Math.max(0, currentShares - transaction.shares));
    }

    transactionIndex += 1;
  }

  return Array.from({ length: pointCount }, (_, index) => {
    const timestamp = seriesStart + index * pointIntervalMs;

    while (
      transactionIndex < sortedTransactions.length &&
      Number(sortedTransactions[transactionIndex]?.timestamp) <= timestamp
    ) {
      const transaction = sortedTransactions[transactionIndex];
      const currentShares = holdingsBySymbol.get(transaction.symbol) || 0;
      const tradeValue = transaction.price * transaction.shares;

      if (transaction.type === 'buy') {
        runningCash -= tradeValue;
        holdingsBySymbol.set(transaction.symbol, currentShares + transaction.shares);
      } else {
        runningCash += tradeValue;
        holdingsBySymbol.set(transaction.symbol, Math.max(0, currentShares - transaction.shares));
      }

      transactionIndex += 1;
    }

    const holdingsValue = market.reduce((sum, stock) => {
      const shares = holdingsBySymbol.get(stock.symbol) || 0;
      if (shares <= 0) return sum;

      const priceHistory = Array.isArray(stock.priceHistory) ? stock.priceHistory : [];
      const historyOffset = Math.max(0, priceHistory.length - pointCount);
      const priceAtPoint = priceHistory[historyOffset + index] ?? stock.price ?? 0;
      return sum + shares * priceAtPoint;
    }, 0);

    return {
      timestamp,
      value: Math.round((runningCash + holdingsValue) * 100) / 100,
    };
  });
}
