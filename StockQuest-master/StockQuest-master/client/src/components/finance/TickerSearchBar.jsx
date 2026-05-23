import { Search } from 'lucide-react';

const QUICK_TICKERS = ['AAPL', 'TSLA', 'MSFT', 'NVDA', 'AMZN'];

export default function TickerSearchBar({
  query,
  onQueryChange,
  onSubmit,
  onQuickSearch,
  isLoading,
  error,
}) {
  return (
    <div className="rounded-[1.5rem] border border-gray-200 bg-white p-4">
      <form onSubmit={onSubmit} className="flex flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor="ticker-search">
          Search ticker
        </label>
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            id="ticker-search"
            type="text"
            value={query}
            onChange={(event) => onQueryChange(event.target.value.toUpperCase())}
            placeholder="Search ticker, like AAPL or MSFT"
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm font-semibold uppercase text-gray-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Search className="h-4 w-4" />
          {isLoading ? 'Searching' : 'Search'}
        </button>
      </form>

      <div className="mt-3 flex flex-wrap gap-2">
        {QUICK_TICKERS.map((ticker) => (
          <button
            key={ticker}
            type="button"
            onClick={() => onQuickSearch(ticker)}
            disabled={isLoading}
            className="rounded-full border border-gray-200 px-3 py-1.5 text-xs font-bold text-gray-600 transition hover:border-orange-300 hover:text-orange-700 disabled:opacity-60"
          >
            {ticker}
          </button>
        ))}
      </div>

      {error ? (
        <div className="mt-3 rounded-2xl bg-orange-50 px-4 py-3 text-sm font-medium text-orange-700">
          {error}
        </div>
      ) : null}
    </div>
  );
}
