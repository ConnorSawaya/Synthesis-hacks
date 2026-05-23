import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { CHART_PRIMARY_COMPARE, StockLineChart, getComparisonColor } from '../components/Charts';
import { ALL_BADGES } from '../data/lessons';
import { BadgeUnlockModal } from '../components/Feedback';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, Briefcase, GitCompareArrows, Landmark, Plus, RefreshCw, Search, TrendingDown, TrendingUp, Wallet, X } from 'lucide-react';
import { buildStockInfo, fetchStockInfo } from '../services/financeDataService';
import { useMarketSimulation } from '../hooks/useMarketSimulation';
import { getTotalPortfolioValue } from '../lib/portfolio';

const MAX_COMPARISONS = 6;

function formatMoney(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function formatVolume(value) {
  const numericValue = Number(value || 0);
  if (numericValue >= 1000000) return `${(numericValue / 1000000).toFixed(1)}M`;
  if (numericValue >= 1000) return `${Math.round(numericValue / 1000)}K`;
  return `${numericValue}`;
}

function getVolatilityLabel(volatility) {
  if (volatility >= 0.04) return 'High';
  if (volatility >= 0.025) return 'Medium';
  return 'Low';
}

function getTrendLabel(trend) {
  if (trend > 0.2) return 'Rising';
  if (trend < -0.2) return 'Cooling';
  return 'Steady';
}

function getTooltipPosition(clientX, clientY) {
  if (typeof window === 'undefined') {
    return { x: clientX + 18, y: clientY + 18 };
  }

  const tooltipWidth = 320;
  const tooltipHeight = 260;
  const padding = 18;

  return {
    x: Math.min(clientX + padding, window.innerWidth - tooltipWidth - 12),
    y: Math.min(clientY + padding, window.innerHeight - tooltipHeight - 12),
  };
}

export default function TradingSimulator() {
  const location = useLocation();
  const {
    cash,
    holdings,
    buyStock,
    sellStock,
    transactions,
    addXP,
    earnBadge,
    earnedBadges,
    difficulty,
  } = useStore();

  const { market, updateMarketSimulation } = useMarketSimulation();
  const [selectedStock, setSelectedStock] = useState(null);
  const [companyInfo, setCompanyInfo] = useState(null);
  const [shares, setShares] = useState(1);
  const [tradeResult, setTradeResult] = useState(null);
  const [showBadge, setShowBadge] = useState(null);
  const [tickerQuery, setTickerQuery] = useState('');
  const [searchError, setSearchError] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [comparisonSymbols, setComparisonSymbols] = useState([]);
  const [comparisonQuery, setComparisonQuery] = useState('');
  const [comparisonError, setComparisonError] = useState('');
  const [comparisonLoading, setComparisonLoading] = useState(false);
  const [hoveredSymbol, setHoveredSymbol] = useState('');
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (market.length > 0 && !selectedStock) setSelectedStock(market[0]);
  }, [market, selectedStock]);

  useEffect(() => {
    if (!selectedStock) return;
    const updated = market.find((stock) => stock.id === selectedStock.id);
    if (updated && updated.price !== selectedStock.price) {
      setSelectedStock(updated);
    }
  }, [market, selectedStock]);

  useEffect(() => {
    if (!selectedStock) return;
    setCompanyInfo(buildStockInfo(selectedStock));
  }, [selectedStock]);

  useEffect(() => {
    const requestedSymbol = location.state?.stockSymbol;
    if (!requestedSymbol || market.length === 0) return;

    const requestedStock = market.find((stock) => stock.symbol === requestedSymbol);
    if (!requestedStock) return;

    setSelectedStock(requestedStock);
    setTickerQuery(requestedStock.symbol);
    setShares(1);
  }, [location.state, market]);

  useEffect(() => {
    if (!selectedStock) return;
    if (comparisonSymbols.includes(selectedStock.symbol)) {
      setComparisonSymbols((prev) => prev.filter((symbol) => symbol !== selectedStock.symbol));
      setComparisonQuery('');
    }
  }, [comparisonSymbols, selectedStock]);

  const currentHolding = selectedStock
    ? holdings.find((holding) => holding.stockId === selectedStock.id)
    : null;

  const totalPortfolioValue = useMemo(() => getTotalPortfolioValue(cash, holdings, market), [cash, holdings, market]);

  const beginnerMode = difficulty === 'beginner';

  const comparisonOptions = useMemo(() => {
    if (!selectedStock) return [];
    return market.filter(
      (stock) => stock.symbol !== selectedStock.symbol && !comparisonSymbols.includes(stock.symbol)
    );
  }, [comparisonSymbols, market, selectedStock]);

  const comparisonStocks = useMemo(() => {
    return comparisonSymbols
      .map((symbol) => market.find((stock) => stock.symbol === symbol) || null)
      .filter(Boolean);
  }, [comparisonSymbols, market]);

  const comparisonSuggestions = useMemo(() => {
    return comparisonOptions.slice(0, beginnerMode ? 8 : 14);
  }, [beginnerMode, comparisonOptions]);

  const primarySuggestions = useMemo(() => {
    return market.slice(0, beginnerMode ? 8 : 14);
  }, [beginnerMode, market]);

  const chartSeries = useMemo(() => {
    if (!selectedStock) return [];

    return [
      {
        symbol: selectedStock.symbol,
        name: selectedStock.name,
        price: selectedStock.price,
        dayChangePercent: selectedStock.changePercent || 0,
        color: CHART_PRIMARY_COMPARE,
        primary: true,
      },
      ...comparisonStocks.map((stock, index) => ({
        symbol: stock.symbol,
        name: stock.name,
        price: stock.price,
        dayChangePercent: stock.changePercent || 0,
        color: getComparisonColor(index),
        primary: false,
      })),
    ];
  }, [comparisonStocks, selectedStock]);

  const companyStatsBySymbol = useMemo(() => {
    const stocks = [selectedStock, ...comparisonStocks].filter(Boolean);

    return Object.fromEntries(
      stocks.map((stock) => {
        const history = stock.priceHistory || [];
        const ohlc = stock.ohlc || [];
        const minPrice = history.length > 0 ? Math.min(...history) : stock.price;
        const maxPrice = history.length > 0 ? Math.max(...history) : stock.price;
        const averageVolume = ohlc.length > 0
          ? Math.round(ohlc.reduce((sum, day) => sum + (day.volume || 0), 0) / ohlc.length)
          : 0;

        return [
          stock.symbol,
          {
            symbol: stock.symbol,
            name: stock.name,
            sector: stock.sector || 'General',
            exchange: stock.exchange || 'SQX',
            market: stock.market || 'Market',
            currentPrice: stock.price,
            dayChange: stock.change || 0,
            dayChangePercent: stock.changePercent || 0,
            lowPrice: minPrice,
            highPrice: maxPrice,
            averageVolume,
            volatilityLabel: getVolatilityLabel(stock.volatility || 0),
            trendLabel: getTrendLabel(stock.trend || 0),
          },
        ];
      })
    );
  }, [comparisonStocks, selectedStock]);

  const hoveredCompanyStats = hoveredSymbol ? companyStatsBySymbol[hoveredSymbol] || null : null;

  const showCompanyTooltip = (symbol, event) => {
    setHoveredSymbol(symbol);
    setTooltipPosition(getTooltipPosition(event.clientX, event.clientY));
  };

  const moveCompanyTooltip = (event) => {
    if (!hoveredSymbol) return;
    setTooltipPosition(getTooltipPosition(event.clientX, event.clientY));
  };

  const hideCompanyTooltip = () => {
    setHoveredSymbol('');
  };

  const searchForTicker = async (ticker) => {
    const symbol = ticker.trim().toUpperCase();
    setTickerQuery(symbol);
    setSearchError('');

    if (!symbol) {
      setSearchError('Type a ticker symbol like AAPL or MSFT to search.');
      return;
    }

    setSearchLoading(true);
    try {
      const result = await fetchStockInfo(symbol, market);
      updateMarketSimulation((prev) => {
        const exists = prev.some((stock) => stock.symbol === result.stock.symbol);
        return exists
          ? prev.map((stock) => (stock.symbol === result.stock.symbol ? result.stock : stock))
          : [result.stock, ...prev];
      });
      setSelectedStock(result.stock);
      setCompanyInfo(result.info);
      if (comparisonSymbols.includes(result.stock.symbol)) {
        setComparisonSymbols((prev) => prev.filter((symbol) => symbol !== result.stock.symbol));
      }
      setShares(1);
    } catch (error) {
      setSearchError("Hmm, we couldn't find that ticker. Try a symbol like AAPL or MSFT.");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleTickerSearch = (event) => {
    event.preventDefault();
    searchForTicker(tickerQuery);
  };

  const handleComparisonSearch = async (event) => {
    event.preventDefault();
    const symbol = comparisonQuery.trim().toUpperCase();
    setComparisonError('');

    if (!symbol) {
      setComparisonError('Search for a ticker to compare.');
      return;
    }

    if (symbol === selectedStock?.symbol) {
      setComparisonError('Pick a different stock to compare.');
      return;
    }

    if (comparisonSymbols.includes(symbol)) {
      setComparisonError('That stock is already in the comparison list.');
      return;
    }

    if (comparisonSymbols.length >= MAX_COMPARISONS) {
      setComparisonError(`Remove one stock before adding another. The chart stays clearest with ${MAX_COMPARISONS + 1} lines.`);
      return;
    }

    setComparisonLoading(true);
    try {
      const result = await fetchStockInfo(symbol, market);
      updateMarketSimulation((prev) => {
        const exists = prev.some((stock) => stock.symbol === result.stock.symbol);
        return exists
          ? prev.map((stock) => (stock.symbol === result.stock.symbol ? result.stock : stock))
          : [result.stock, ...prev];
      });
      setComparisonSymbols((prev) => [...prev, result.stock.symbol]);
      setComparisonQuery('');
    } catch (error) {
      setComparisonError("We couldn't find that ticker to compare. Try AAPL or MSFT.");
    } finally {
      setComparisonLoading(false);
    }
  };

  const handleBuy = () => {
    if (!selectedStock || shares < 1) return;
    const success = buyStock(selectedStock, shares);
    if (!success) return;

    setTradeResult({
      type: 'buy',
      symbol: selectedStock.symbol,
      shares,
      price: selectedStock.price,
    });
    addXP(5);

    if (transactions.length === 0) {
      const badge = ALL_BADGES.find((entry) => entry.id === 'first-trade');
      if (badge && !earnedBadges.find((entry) => entry.id === badge.id)) {
        earnBadge(badge);
        setShowBadge(badge);
      }
    }

    setTimeout(() => setTradeResult(null), 4500);
  };

  const handleSell = () => {
    if (!selectedStock || shares < 1 || !currentHolding) return;
    const success = sellStock(selectedStock, shares);
    if (!success) return;

    const profit = (selectedStock.price - currentHolding.avgPrice) * shares;
    setTradeResult({
      type: 'sell',
      symbol: selectedStock.symbol,
      shares,
      price: selectedStock.price,
      profit,
    });

    if (profit > 0) {
      addXP(5);
      const badge = ALL_BADGES.find((entry) => entry.id === 'first-profit');
      if (badge && !earnedBadges.find((entry) => entry.id === badge.id)) {
        earnBadge(badge);
        setShowBadge(badge);
      }
    }

    setTimeout(() => setTradeResult(null), 4500);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-700">
                <Activity className="h-4 w-4" />
              </div>
              <div>
                <h1 className="text-xl font-black leading-none text-gray-900">Market</h1>
                <div className="mt-1 text-xs font-semibold text-gray-500">Learning market with simulated cash</div>
              </div>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-3 xl:min-w-[34rem]">
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">
                <Briefcase className="h-3.5 w-3.5" />
                Portfolio
              </div>
              <div className="mt-1 text-base font-bold text-gray-900">{formatMoney(totalPortfolioValue)}</div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">
                <Wallet className="h-3.5 w-3.5" />
                Cash
              </div>
              <div className="mt-1 text-base font-bold text-gray-900">{formatMoney(cash)}</div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">
                <Activity className="h-3.5 w-3.5" />
                Holdings
              </div>
              <div className="mt-1 text-base font-bold text-gray-900">{holdings.length}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-6">
          {selectedStock ? (
            <>
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <div className="min-w-0">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="text-sm font-semibold uppercase tracking-[0.16em] text-orange-700">Price chart</div>
                        <div className="rounded-full border border-gray-200 px-2.5 py-1 text-xs font-semibold text-gray-500">
                          Price per share
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap items-end gap-x-3 gap-y-1">
                        <h2 className="text-3xl font-black leading-none text-gray-900">{selectedStock.symbol}</h2>
                        <div className="text-sm text-gray-500">{selectedStock.name}</div>
                        <div className="text-2xl font-black leading-none text-gray-900">{formatMoney(selectedStock.price)}</div>
                        <div className={`inline-flex items-center gap-1 text-sm font-semibold ${companyInfo?.priceChange >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                          {companyInfo?.priceChange >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                          {companyInfo?.priceChange >= 0 ? '+' : ''}
                          {companyInfo?.percentChange.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-semibold text-gray-500">
                    <div className="inline-flex items-center gap-2">
                      <Landmark className="h-4 w-4 text-gray-400" />
                      <span>{companyInfo?.exchange}</span>
                    </div>
                    <div className={`inline-flex items-center gap-2 font-semibold ${companyInfo?.priceChange >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      <RefreshCw className="h-4 w-4" />
                      <span>{companyInfo?.priceChange >= 0 ? '+' : ''}${companyInfo?.priceChange.toFixed(2)} today</span>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-3">
                    <div className="grid gap-3 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
                      <form
                        id="primary-stock-form"
                        onSubmit={handleTickerSearch}
                        className="rounded-xl border border-gray-200 bg-white p-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">Main stock</div>
                            <div className="mt-1 text-sm font-bold text-gray-900">{selectedStock.symbol}</div>
                          </div>
                          <div className="min-w-0 flex-1 truncate text-right text-xs font-semibold text-gray-500">
                            {selectedStock.name}
                          </div>
                        </div>
                        <div className="mt-2 flex gap-2">
                          <div className="relative min-w-0 flex-1">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                              list="primary-ticker-options"
                              type="text"
                              value={tickerQuery}
                              onChange={(event) => {
                                setTickerQuery(event.target.value.toUpperCase());
                                if (searchError) setSearchError('');
                              }}
                              placeholder={`Change from ${selectedStock.symbol}`}
                              className="h-10 w-full rounded-xl border border-gray-200 bg-white py-2 pl-10 pr-3 text-sm font-semibold uppercase text-gray-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                              disabled={searchLoading}
                            />
                            <datalist id="primary-ticker-options">
                              {primarySuggestions.map((stock) => (
                                <option key={stock.symbol} value={stock.symbol}>
                                  {stock.name}
                                </option>
                              ))}
                            </datalist>
                          </div>
                          <button
                            type="submit"
                            disabled={searchLoading}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60"
                          >
                            {searchLoading ? 'Loading' : 'Set'}
                          </button>
                        </div>
                        {searchError ? (
                          <div className="mt-2 rounded-xl bg-orange-50 px-3 py-2 text-sm font-medium text-orange-700">
                            {searchError}
                          </div>
                        ) : null}
                      </form>

                      <form
                        id="comparison-form"
                        onSubmit={handleComparisonSearch}
                        className="rounded-xl border border-gray-200 bg-white p-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">
                            <GitCompareArrows className="h-3.5 w-3.5 text-orange-600" />
                            Compare
                          </div>
                          <div className="text-xs font-semibold text-gray-500">
                            {comparisonStocks.length}/{MAX_COMPARISONS} added
                          </div>
                        </div>
                        <div className="mt-2 flex gap-2">
                          <div className="relative min-w-0 flex-1">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                              list="comparison-ticker-options"
                              type="text"
                              value={comparisonQuery}
                              onChange={(event) => {
                                setComparisonQuery(event.target.value.toUpperCase());
                                if (comparisonError) setComparisonError('');
                              }}
                              placeholder="Search ticker"
                              className="h-10 w-full rounded-xl border border-gray-200 bg-white py-2 pl-10 pr-3 text-sm font-semibold uppercase text-gray-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                              disabled={comparisonLoading}
                            />
                            <datalist id="comparison-ticker-options">
                              {comparisonSuggestions.map((stock) => (
                                <option key={stock.symbol} value={stock.symbol}>
                                  {stock.name}
                                </option>
                              ))}
                            </datalist>
                          </div>
                          <button
                            type="submit"
                            disabled={comparisonLoading}
                            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-60"
                          >
                            <Plus className="h-4 w-4" />
                            {comparisonLoading ? 'Adding' : 'Add'}
                          </button>
                        </div>
                        {comparisonError ? (
                          <div className="mt-2 rounded-xl bg-orange-50 px-3 py-2 text-sm font-medium text-orange-700">
                            {comparisonError}
                          </div>
                        ) : null}
                      </form>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {chartSeries.map((series) => {
                        const positive = series.dayChangePercent >= 0;
                        return (
                          <div
                            key={series.symbol}
                            className="inline-flex min-h-9 items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-gray-800"
                          >
                            <span
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ backgroundColor: series.color }}
                              aria-hidden="true"
                              onMouseEnter={(event) => showCompanyTooltip(series.symbol, event)}
                              onMouseMove={moveCompanyTooltip}
                              onMouseLeave={hideCompanyTooltip}
                            />
                            <span>{series.symbol}</span>
                            <span className="font-semibold text-gray-500">{formatMoney(series.price)}</span>
                            <span className={`font-semibold ${positive ? 'text-green-600' : 'text-red-500'}`}>
                              {positive ? '+' : ''}{series.dayChangePercent.toFixed(1)}% today
                            </span>
                            {!series.primary ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setComparisonSymbols((prev) => prev.filter((symbol) => symbol !== series.symbol));
                                  setComparisonError('');
                                }}
                                className="inline-flex h-5 w-5 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-900"
                                aria-label={`Remove ${series.symbol} comparison`}
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-gray-600">{companyInfo?.description}</p>

                  <div className="mt-4 rounded-2xl border border-gray-200 bg-gray-50 p-2">
                    <StockLineChart
                      primaryLabel={selectedStock.symbol}
                      data={selectedStock.priceHistory}
                      comparisons={comparisonStocks.map((stock) => ({
                        label: stock.symbol,
                        data: stock.priceHistory,
                      }))}
                      height={430}
                    />
                  </div>
                </div>
              </div>

            </>
          ) : (
            <div className="rounded-[1.75rem] border border-gray-200 bg-white p-10 text-center text-gray-500 xl:col-span-2">
              Search for a stock above to begin your guided trade.
            </div>
          )}

        </div>

        {selectedStock ? (
          <div className="self-start space-y-4 xl:sticky xl:top-8">
            <div className="rounded-[1.5rem] border border-gray-200 bg-gray-50 p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-700">Trade ticket</div>
                  <h3 className="mt-1 text-xl font-bold text-gray-900">Buy or sell</h3>
                </div>
                <div className="text-sm text-gray-600">
                  Cash: <span className="font-bold text-gray-900">${cash.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-5 flex items-center gap-2">
                <button
                  onClick={() => setShares(Math.max(1, shares - 1))}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg font-bold text-gray-700 hover:bg-gray-100"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={shares}
                  onChange={(event) => {
                    const value = parseInt(event.target.value, 10);
                    if (!Number.isNaN(value) && value >= 1) setShares(value);
                  }}
                  className="h-10 w-24 rounded-xl border border-gray-200 bg-white text-center font-semibold text-gray-900"
                />
                <button
                  onClick={() => setShares(shares + 1)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-lg font-bold text-gray-700 hover:bg-gray-100"
                >
                  +
                </button>
              </div>

              <div className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm text-gray-600">
                Total: <span className="font-bold text-gray-900">${(selectedStock.price * shares).toFixed(2)}</span>
              </div>

              <div className="mt-3 text-sm text-gray-500">
                {currentHolding
                  ? `You own ${currentHolding.shares} share${currentHolding.shares === 1 ? '' : 's'} of ${selectedStock.symbol}.`
                  : 'No shares owned yet.'}
              </div>

              <div className="mt-5 grid gap-3">
                <button
                  onClick={handleBuy}
                  disabled={shares < 1 || selectedStock.price * shares > cash}
                  className="btn-primary w-full"
                >
                  Buy {shares} share{shares === 1 ? '' : 's'}
                </button>
                <button
                  onClick={handleSell}
                  disabled={!currentHolding || shares < 1 || shares > currentHolding.shares}
                  className="btn-secondary w-full"
                >
                  Sell {shares} share{shares === 1 ? '' : 's'}
                </button>
              </div>

              <Link
                to="/portfolio"
                className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
              >
                Open portfolio
              </Link>
            </div>
          </div>
        ) : null}
      </div>

      <AnimatePresence>
        {hoveredCompanyStats && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.12 }}
            className="pointer-events-none fixed z-50 w-[320px] rounded-2xl border border-gray-200 bg-white p-4 shadow-xl"
            style={{ left: tooltipPosition.x, top: tooltipPosition.y }}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400">
                  About this company
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <div className="text-base font-bold text-gray-900">{hoveredCompanyStats.symbol}</div>
                  <div className="text-sm text-gray-500">{hoveredCompanyStats.name}</div>
                </div>
              </div>
              <div className={`text-sm font-semibold ${hoveredCompanyStats.dayChange >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {hoveredCompanyStats.dayChange >= 0 ? '+' : ''}
                {hoveredCompanyStats.dayChangePercent.toFixed(2)}% today
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-gray-50 px-3 py-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">Price</div>
                <div className="mt-1 text-sm font-bold text-gray-900">{formatMoney(hoveredCompanyStats.currentPrice)}</div>
              </div>
              <div className="rounded-xl bg-gray-50 px-3 py-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">Day change</div>
                <div className={`mt-1 text-sm font-bold ${hoveredCompanyStats.dayChange >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {hoveredCompanyStats.dayChange >= 0 ? '+' : ''}{formatMoney(hoveredCompanyStats.dayChange)}
                </div>
              </div>
              <div className="rounded-xl bg-gray-50 px-3 py-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">Exchange</div>
                <div className="mt-1 text-sm font-bold text-gray-900">{hoveredCompanyStats.exchange}</div>
              </div>
              <div className="rounded-xl bg-gray-50 px-3 py-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">Sector</div>
                <div className="mt-1 text-sm font-bold text-gray-900">{hoveredCompanyStats.sector}</div>
              </div>
              <div className="rounded-xl bg-gray-50 px-3 py-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">90-day low</div>
                <div className="mt-1 text-sm font-bold text-gray-900">{formatMoney(hoveredCompanyStats.lowPrice)}</div>
              </div>
              <div className="rounded-xl bg-gray-50 px-3 py-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">90-day high</div>
                <div className="mt-1 text-sm font-bold text-gray-900">{formatMoney(hoveredCompanyStats.highPrice)}</div>
              </div>
              <div className="rounded-xl bg-gray-50 px-3 py-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">Avg volume</div>
                <div className="mt-1 text-sm font-bold text-gray-900">{formatVolume(hoveredCompanyStats.averageVolume)}</div>
              </div>
              <div className="rounded-xl bg-gray-50 px-3 py-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">Volatility</div>
                <div className="mt-1 text-sm font-bold text-gray-900">{hoveredCompanyStats.volatilityLabel}</div>
              </div>
              <div className="rounded-xl bg-gray-50 px-3 py-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">Trend</div>
                <div className="mt-1 text-sm font-bold text-gray-900">{hoveredCompanyStats.trendLabel}</div>
              </div>
              <div className="rounded-xl bg-gray-50 px-3 py-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">Market</div>
                <div className="mt-1 text-sm font-bold text-gray-900">{hoveredCompanyStats.market}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {tradeResult && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm text-orange-800"
          >
            <div className="font-semibold">
              {tradeResult.type === 'buy' ? 'You bought' : 'You sold'} {tradeResult.shares} share{tradeResult.shares === 1 ? '' : 's'} of {tradeResult.symbol} at ${tradeResult.price.toFixed(2)}
            </div>
            {tradeResult.profit !== undefined && (
              <div className={`mt-1 font-medium ${tradeResult.profit >= 0 ? 'text-green-700' : 'text-red-500'}`}>
                Profit/Loss: {tradeResult.profit >= 0 ? '+' : ''}${tradeResult.profit.toFixed(2)}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBadge && <BadgeUnlockModal badge={showBadge} onClose={() => setShowBadge(null)} />}
      </AnimatePresence>
    </div>
  );
}
