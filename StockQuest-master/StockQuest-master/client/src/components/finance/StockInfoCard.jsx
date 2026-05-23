import { Building2, Landmark, RefreshCw, TrendingDown, TrendingUp } from 'lucide-react';

export default function StockInfoCard({ info }) {
  if (!info) return null;

  const isUp = info.priceChange >= 0;
  const TrendIcon = isUp ? TrendingUp : TrendingDown;

  return (
    <section className="rounded-[1.75rem] border border-gray-200 bg-white p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-700">
            Company
          </div>
          <h2 className="mt-1 text-2xl font-bold text-gray-900">{info.ticker}</h2>
          <p className="text-sm text-gray-500">{info.companyName}</p>
        </div>
        <div className="rounded-2xl bg-gray-50 px-4 py-3 text-right">
          <div className="text-sm text-gray-500">Current price</div>
          <div className="text-2xl font-bold text-gray-900">${info.currentPrice.toFixed(2)}</div>
          <div className={`mt-1 flex items-center justify-end gap-1 text-sm font-semibold ${isUp ? 'text-green-600' : 'text-red-500'}`}>
            <TrendIcon className="h-4 w-4" />
            {isUp ? '+' : ''}
            {info.percentChange.toFixed(2)}%
          </div>
        </div>
      </div>

      <p className="mt-5 text-sm leading-6 text-gray-600">{info.description}</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-gray-50 px-4 py-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
            <Landmark className="h-4 w-4" />
            Exchange
          </div>
          <div className="mt-2 font-bold text-gray-900">{info.exchange}</div>
        </div>
        <div className="rounded-2xl bg-gray-50 px-4 py-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
            <Building2 className="h-4 w-4" />
            Market
          </div>
          <div className="mt-2 font-bold text-gray-900">{info.market}</div>
        </div>
        <div className="rounded-2xl bg-gray-50 px-4 py-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
            <RefreshCw className="h-4 w-4" />
            Change
          </div>
          <div className={`mt-2 font-bold ${isUp ? 'text-green-600' : 'text-red-500'}`}>
            {isUp ? '+' : ''}${info.priceChange.toFixed(2)}
          </div>
        </div>
      </div>

    </section>
  );
}
