import { useEffect, useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import { generateMarket, getRandomEvent, applyEvent } from '../lib/stockEngine';
import { StockLineChart } from '../components/Charts';
import { ALL_BADGES } from '../data/lessons';
import { BadgeUnlockModal } from '../components/Feedback';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, DollarSign, Sparkles, Zap } from 'lucide-react';

export default function TradingSimulator() {
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

  const [market, setMarket] = useState(() => generateMarket(90));
  const [selectedStock, setSelectedStock] = useState(null);
  const [shares, setShares] = useState(1);
  const [activeEvent, setActiveEvent] = useState(null);
  const [tradeResult, setTradeResult] = useState(null);
  const [showBadge, setShowBadge] = useState(null);

  useEffect(() => {
    if (market.length > 0 && !selectedStock) setSelectedStock(market[0]);
  }, [market, selectedStock]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMarket((prev) =>
        prev.map((stock) => {
          const noise = (Math.random() - 0.5) * stock.price * 0.02;
          const newPrice = Math.max(0.01, stock.price + noise);
          const change = newPrice - stock.price;
          return {
            ...stock,
            price: Math.round(newPrice * 100) / 100,
            change: Math.round(change * 100) / 100,
            changePercent: Math.round((change / stock.price) * 10000) / 100,
            priceHistory: [...stock.priceHistory.slice(-89), Math.round(newPrice * 100) / 100],
          };
        })
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!selectedStock) return;
    const updated = market.find((stock) => stock.id === selectedStock.id);
    if (updated && updated.price !== selectedStock.price) {
      setSelectedStock(updated);
    }
  }, [market, selectedStock]);

  const currentHolding = selectedStock
    ? holdings.find((holding) => holding.stockId === selectedStock.id)
    : null;

  const totalPortfolioValue = useMemo(() => {
    return cash + holdings.reduce((sum, holding) => {
      const current = market.find((stock) => stock.id === holding.stockId);
      return sum + (current ? current.price : holding.avgPrice) * holding.shares;
    }, 0);
  }, [cash, holdings, market]);

  const beginnerMode = difficulty === 'beginner';

  const triggerEvent = () => {
    if (!selectedStock) return;
    const event = getRandomEvent();
    const updated = applyEvent(selectedStock, event);
    setMarket((prev) => prev.map((stock) => (stock.id === updated.id ? updated : stock)));
    setSelectedStock(updated);
    setActiveEvent(event);
    setTimeout(() => setActiveEvent(null), 5000);
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
      reflection: 'You opened a position. Watch the price before making your next decision.',
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
      reflection:
        profit >= 0
          ? 'You sold for a gain. Ask what signal made this a good exit.'
          : 'You sold at a loss. Ask what you learned about timing and risk.',
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
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="rounded-[2rem] border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-white p-8">
        <div className="inline-flex rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-orange-700 ring-1 ring-orange-100">
          Guided practice
        </div>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">
          Practice one trade at a time
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-gray-600">
          The goal here is not to trade everything. It is to connect what you learned in lessons to one calm decision at a time.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white px-4 py-4 ring-1 ring-gray-200">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Step 1</div>
            <div className="mt-1 font-semibold text-gray-900">Pick a stock</div>
            <div className="mt-1 text-sm text-gray-500">Start with one company and watch how it moves.</div>
          </div>
          <div className="rounded-2xl bg-white px-4 py-4 ring-1 ring-gray-200">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Step 2</div>
            <div className="mt-1 font-semibold text-gray-900">Choose an amount</div>
            <div className="mt-1 text-sm text-gray-500">Keep it small so you can focus on the lesson behind the choice.</div>
          </div>
          <div className="rounded-2xl bg-white px-4 py-4 ring-1 ring-gray-200">
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Step 3</div>
            <div className="mt-1 font-semibold text-gray-900">Reflect on what happened</div>
            <div className="mt-1 text-sm text-gray-500">Notice price movement, profit, loss, and the story behind it.</div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[1.75rem] border border-gray-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-700">Step 1</div>
              <h2 className="text-xl font-bold text-gray-900">Pick a stock</h2>
            </div>
            <button
              onClick={triggerEvent}
              className="inline-flex items-center gap-2 rounded-2xl bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700 hover:bg-orange-100"
            >
              <Zap className="h-4 w-4" />
              News event
            </button>
          </div>

          <div className="space-y-3">
            {market.slice(0, beginnerMode ? 5 : market.length).map((stock) => (
              <button
                key={stock.id}
                onClick={() => {
                  setSelectedStock(stock);
                  setShares(1);
                }}
                className={`w-full rounded-2xl border p-4 text-left transition ${
                  selectedStock?.id === stock.id
                    ? 'border-orange-300 bg-orange-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-bold text-gray-900">{stock.symbol}</div>
                    <div className="text-sm text-gray-500">{stock.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">${stock.price.toFixed(2)}</div>
                    <div className={`text-sm ${stock.change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {stock.change >= 0 ? '+' : ''}
                      {stock.changePercent.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {beginnerMode && (
            <div className="mt-4 rounded-2xl bg-gray-50 px-4 py-4 text-sm text-gray-600">
              Beginner mode is on, so advanced choices stay hidden until you feel ready.
            </div>
          )}
        </div>

        <div className="space-y-6">
          {selectedStock ? (
            <>
              <div className="rounded-[1.75rem] border border-gray-200 bg-white p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-700">Step 2</div>
                    <h2 className="mt-1 text-2xl font-bold text-gray-900">{selectedStock.symbol}</h2>
                    <p className="text-sm text-gray-500">{selectedStock.name}</p>
                  </div>
                  <div className="rounded-2xl bg-gray-50 px-4 py-3 text-right">
                    <div className="text-sm text-gray-500">Current price</div>
                    <div className="text-2xl font-bold text-gray-900">${selectedStock.price.toFixed(2)}</div>
                  </div>
                </div>

                <div className="mt-5">
                  <StockLineChart data={selectedStock.priceHistory} height={240} />
                </div>
              </div>

              <div className="rounded-[1.75rem] border border-gray-200 bg-white p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-700">Step 3</div>
                    <h3 className="mt-1 text-xl font-bold text-gray-900">Choose your amount</h3>
                  </div>
                  <div className="rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
                    Practice cash: <span className="font-bold text-gray-900">${cash.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-[auto_auto_1fr] md:items-center">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShares(Math.max(1, shares - 1))}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-lg font-bold text-gray-700 hover:bg-gray-200"
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
                      className="w-20 rounded-xl border border-gray-200 py-2 text-center font-semibold text-gray-900"
                    />
                    <button
                      onClick={() => setShares(shares + 1)}
                      className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-lg font-bold text-gray-700 hover:bg-gray-200"
                    >
                      +
                    </button>
                  </div>

                  <div className="rounded-2xl bg-orange-50 px-4 py-3 text-sm text-orange-700">
                    Total: <span className="font-bold">${(selectedStock.price * shares).toFixed(2)}</span>
                  </div>

                  <div className="text-sm text-gray-500">
                    {currentHolding
                      ? `You already own ${currentHolding.shares} share${currentHolding.shares === 1 ? '' : 's'} of ${selectedStock.symbol}.`
                      : 'You do not own this stock yet, which makes this a clean first practice trade.'}
                  </div>
                </div>

                <div className="mt-5 flex gap-3">
                  <button
                    onClick={handleBuy}
                    disabled={shares < 1 || selectedStock.price * shares > cash}
                    className="btn-primary flex-1"
                  >
                    Buy {shares} share{shares === 1 ? '' : 's'}
                  </button>
                  <button
                    onClick={handleSell}
                    disabled={!currentHolding || shares < 1 || shares > currentHolding.shares}
                    className="btn-secondary flex-1"
                  >
                    Sell {shares} share{shares === 1 ? '' : 's'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-[1.75rem] border border-gray-200 bg-white p-10 text-center text-gray-500">
              Pick a stock on the left to begin your guided practice trade.
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.75rem] border border-gray-200 bg-white p-5">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-orange-700">
                <DollarSign className="h-4 w-4" />
                Portfolio snapshot
              </div>
              <div className="mt-4 text-2xl font-bold text-gray-900">${totalPortfolioValue.toFixed(2)}</div>
              <div className="mt-1 text-sm text-gray-500">
                {holdings.length > 0
                  ? `${holdings.length} holding${holdings.length === 1 ? '' : 's'} in your practice portfolio`
                  : 'No positions yet'}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-gray-200 bg-white p-5">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-orange-700">
                <BookOpen className="h-4 w-4" />
                Reflection prompt
              </div>
              <div className="mt-4 text-sm leading-6 text-gray-600">
                Ask yourself: What changed in this stock, and what lesson concept helps explain it?
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {activeEvent && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`rounded-2xl px-5 py-4 text-sm ${
              activeEvent.effect === 'up' ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'
            }`}
          >
            <div className="font-semibold">{activeEvent.title}</div>
            <div className="mt-1">{activeEvent.description}</div>
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
            <div className="mt-2 flex items-start gap-2 text-orange-900">
              <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{tradeResult.reflection}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showBadge && <BadgeUnlockModal badge={showBadge} onClose={() => setShowBadge(null)} />}
      </AnimatePresence>
    </div>
  );
}
