import { Link, useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { ArrowUpRight, Briefcase, DollarSign, LineChart, TrendingDown, TrendingUp, Wallet } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useMarketSimulation } from '../hooks/useMarketSimulation';
import { PortfolioChart } from '../components/Charts';
import {
  buildPortfolioValueSeries,
  buildPortfolioHoldings,
  getCurrentHoldingsValue,
  getPortfolioCostBasis,
  getTotalPortfolioValue,
  getTotalSpent,
  getUnrealizedGain,
} from '../lib/portfolio';

export default function PortfolioPage() {
  const navigate = useNavigate();
  const { cash, holdings, transactions, completedLessons, sellStock } = useStore();
  const { market } = useMarketSimulation();

  const portfolioHoldings = useMemo(() => buildPortfolioHoldings(holdings, market), [holdings, market]);
  const totalSpent = useMemo(() => getTotalSpent(transactions), [transactions]);
  const currentHoldingsValue = useMemo(
    () => getCurrentHoldingsValue(portfolioHoldings),
    [portfolioHoldings]
  );
  const portfolioCostBasis = useMemo(
    () => getPortfolioCostBasis(portfolioHoldings),
    [portfolioHoldings]
  );
  const totalPortfolioValue = useMemo(
    () => getTotalPortfolioValue(cash, holdings, market),
    [cash, holdings, market]
  );
  const unrealizedGain = useMemo(() => getUnrealizedGain(portfolioHoldings), [portfolioHoldings]);
  const learningCashEarned = useMemo(
    () => completedLessons.reduce((sum, lesson) => sum + Number(lesson.cashEarned || 0), 0),
    [completedLessons]
  );
  const lifetimeNet = totalPortfolioValue - learningCashEarned;
  const returnPercent = learningCashEarned > 0 ? (lifetimeNet / learningCashEarned) * 100 : 0;
  const portfolioValueChartData = useMemo(() => {
    return buildPortfolioValueSeries({
      startingCash: learningCashEarned,
      transactions,
      market,
    });
  }, [learningCashEarned, market, transactions]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="rounded-[2rem] border border-gray-200 bg-white p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">
              Portfolio
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">
              Your market holdings
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-gray-600">
              See what you bought, how much you spent, and how your portfolio is doing over time.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/trade"
              className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              Go to market
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link
              to="/news"
              className="inline-flex items-center gap-2 rounded-2xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-50"
            >
              Open news
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[1.5rem] border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
            <Briefcase className="h-4 w-4" />
            Total portfolio
          </div>
          <div className="mt-3 text-3xl font-black text-gray-900">${totalPortfolioValue.toFixed(2)}</div>
          <div className="mt-2 text-sm text-gray-500">Cash plus the latest value of your current holdings.</div>
        </div>

        <div className="rounded-[1.5rem] border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
            <Wallet className="h-4 w-4" />
            Cash left
          </div>
          <div className="mt-3 text-3xl font-black text-gray-900">${cash.toFixed(2)}</div>
          <div className="mt-2 text-sm text-gray-500">Cash you still have ready for another market move.</div>
        </div>

        <div className="rounded-[1.5rem] border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
            <DollarSign className="h-4 w-4" />
            Money spent
          </div>
          <div className="mt-3 text-3xl font-black text-gray-900">${totalSpent.toFixed(2)}</div>
          <div className="mt-2 text-sm text-gray-500">Total dollars you have used on market buy orders.</div>
        </div>

        <div className="rounded-[1.5rem] border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
            <LineChart className="h-4 w-4" />
            Net gain/loss
          </div>
          <div className={`mt-3 text-3xl font-black ${lifetimeNet >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {lifetimeNet >= 0 ? '+' : ''}${lifetimeNet.toFixed(2)}
          </div>
          <div className="mt-2 text-sm text-gray-500">
            {learningCashEarned > 0 ? (
              <>
                {returnPercent >= 0 ? '+' : ''}
                {returnPercent.toFixed(2)}% versus the cash you earned from lessons.
              </>
            ) : (
              'You start at $0 and build this balance from lesson rewards and trading results.'
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-[1.75rem] border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-orange-700">
            <Briefcase className="h-4 w-4" />
            Holdings
          </div>

          {portfolioHoldings.length > 0 ? (
            <div className="mt-5 space-y-4">
              {portfolioHoldings.map((holding) => (
                <div key={holding.stockId} className="rounded-[1.25rem] border border-gray-200 bg-gray-50 p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="text-2xl font-black text-gray-900">{holding.symbol}</div>
                        <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-500">
                          {holding.shares} share{holding.shares === 1 ? '' : 's'}
                        </div>
                      </div>
                      <div className="mt-1 text-sm text-gray-500">{holding.stock.name}</div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl bg-white px-4 py-3">
                        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">Current value</div>
                        <div className="mt-2 text-lg font-bold text-gray-900">${holding.currentValue.toFixed(2)}</div>
                      </div>
                      <div className="rounded-2xl bg-white px-4 py-3">
                        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">Money spent</div>
                        <div className="mt-2 text-lg font-bold text-gray-900">${holding.spent.toFixed(2)}</div>
                      </div>
                      <div className="rounded-2xl bg-white px-4 py-3">
                        <div className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">Avg buy</div>
                        <div className="mt-2 text-lg font-bold text-gray-900">${holding.avgPrice.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className={`inline-flex items-center gap-2 text-sm font-semibold ${holding.gain >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {holding.gain >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      {holding.gain >= 0 ? '+' : ''}${holding.gain.toFixed(2)} on this holding
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => navigate('/trade', { state: { stockSymbol: holding.symbol } })}
                        className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
                      >
                        Buy more
                      </button>
                      <button
                        type="button"
                        onClick={() => sellStock(holding.stock, 1)}
                        className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-100"
                      >
                        Sell 1 share
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-[1.5rem] bg-gray-50 px-5 py-6 text-sm leading-6 text-gray-600">
              You have not bought any stocks yet. Start in Market, make your first trade, and your portfolio will show up here.
            </div>
          )}

          <div className="mt-6 rounded-[1.5rem] border border-gray-200 bg-gray-50 p-5">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-700">Portfolio value graph</div>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                  This graph follows your full portfolio value after each market move, including both cash and active holdings.
                </p>
              </div>
              <div className="text-sm font-semibold text-gray-500">
                Latest value: <span className="text-gray-900">{`$${totalPortfolioValue.toFixed(2)}`}</span>
              </div>
            </div>
            <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-4">
              <PortfolioChart data={portfolioValueChartData} height={340} />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[1.5rem] border border-gray-200 bg-white p-5">
            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-700">Portfolio details</div>
            <div className="mt-4 space-y-3">
              <div className="rounded-2xl bg-gray-50 px-4 py-3">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">Holdings value</div>
                <div className="mt-2 text-lg font-bold text-gray-900">${currentHoldingsValue.toFixed(2)}</div>
              </div>
              <div className="rounded-2xl bg-gray-50 px-4 py-3">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">Current cost basis</div>
                <div className="mt-2 text-lg font-bold text-gray-900">${portfolioCostBasis.toFixed(2)}</div>
              </div>
              <div className="rounded-2xl bg-gray-50 px-4 py-3">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">Unrealized gain/loss</div>
                <div className={`mt-2 text-lg font-bold ${unrealizedGain >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {unrealizedGain >= 0 ? '+' : ''}${unrealizedGain.toFixed(2)}
                </div>
              </div>
              <div className="rounded-2xl bg-gray-50 px-4 py-3">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">Open positions</div>
                <div className="mt-2 text-lg font-bold text-gray-900">{portfolioHoldings.length}</div>
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-gray-200 bg-white p-5">
            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-700">Learning note</div>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              This portfolio is part of a simulation. Prices can go up or down, and the goal is to learn how your choices change the results over time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
