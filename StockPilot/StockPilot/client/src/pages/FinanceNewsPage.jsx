import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Newspaper, Search, TrendingUp } from 'lucide-react';
import NewsCard from '../components/finance/NewsCard';
import { fetchFinanceNewsFeed } from '../services/financeDataService';
import { MARKET_TICKER } from '../data/financeNews';

const FILTERS = [
  { label: 'All', value: 'ALL' },
  { label: 'Market', value: MARKET_TICKER },
  { label: 'AAPL', value: 'AAPL' },
  { label: 'MSFT', value: 'MSFT' },
  { label: 'TSLA', value: 'TSLA' },
  { label: 'NVDA', value: 'NVDA' },
  { label: 'Market stocks', value: 'MARKET_STOCKS' },
];

const MARKET_SYMBOLS = ['FUNCO', 'SNKBX', 'TECHX', 'GRENN', 'PETPL', 'GAMEZ', 'EDUFY'];

export default function FinanceNewsPage() {
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [allArticles, setAllArticles] = useState([]);
  const [newsMode, setNewsMode] = useState('loading');
  const [newsMessage, setNewsMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadNews = async () => {
      setIsLoading(true);
      const feed = await fetchFinanceNewsFeed();
      if (cancelled) return;

      setAllArticles(feed.articles);
      setNewsMode(feed.mode);
      setNewsMessage(feed.message || '');
      setIsLoading(false);
    };

    loadNews();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredArticles = useMemo(() => {
    const searchText = search.trim().toUpperCase();
    return allArticles.filter((article) => {
      const matchesFilter =
        activeFilter === 'ALL'
          ? true
          : activeFilter === 'MARKET_STOCKS'
          ? article.relatedTickers.some((ticker) => MARKET_SYMBOLS.includes(ticker))
          : article.relatedTickers.includes(activeFilter);

      const matchesSearch =
        !searchText ||
        article.title.toUpperCase().includes(searchText) ||
        article.summary.toUpperCase().includes(searchText) ||
        article.relatedTickers.some((ticker) => ticker.includes(searchText));

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, allArticles, search]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="rounded-[2rem] border border-gray-200 bg-white p-7">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)] xl:items-end">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">
              <Newspaper className="h-4 w-4" />
              Finance News
            </div>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">
              A clearer look at finance news
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-gray-600">
              Browse recent market stories in a cleaner feed, with simple explanations of what investors are watching.
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-gray-200 bg-gray-50 p-5">
            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-700">News source</div>
            <p className="mt-2 text-sm leading-6 text-gray-600">
              {newsMode === 'live'
                ? 'Live finance headlines are turned on for real-world companies. Simulation stories still appear for StockPilot market companies.'
                : 'Live finance headlines are not configured yet, so the app is showing the StockPilot learning news feed.'}
            </p>
            {newsMessage ? (
              <div className="mt-2 text-xs font-medium text-gray-500">
                News source note: {newsMessage}
              </div>
            ) : null}
            <Link
              to="/trade"
              className="mt-4 inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              <TrendingUp className="h-4 w-4" />
              Open market
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-gray-200 bg-white p-5">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,0.9fr)] xl:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search headlines or ticker symbols"
              className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm font-semibold text-gray-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
          </div>

          <div className="flex flex-wrap gap-2 xl:justify-end">
            {FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setActiveFilter(filter.value)}
                className={`rounded-full px-3 py-2 text-xs font-bold transition ${
                  activeFilter === filter.value
                    ? 'bg-orange-500 text-white'
                    : 'border border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-700'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {isLoading ? (
        <section className="rounded-[1.75rem] border border-gray-200 bg-white p-8 text-center">
          <h2 className="text-xl font-bold text-gray-900">Loading finance news</h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            Pulling together the latest market stories and the StockPilot simulation feed.
          </p>
        </section>
      ) : filteredArticles.length > 0 ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Latest headlines</h2>
              <p className="mt-1 text-sm leading-6 text-gray-600">
                Recent stories across companies, sectors, and the broader market.
              </p>
            </div>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredArticles.map((article, index) => (
              <NewsCard key={article.id} article={article} compact={index > 5} />
            ))}
          </div>
        </section>
      ) : (
        <section className="rounded-[1.75rem] border border-gray-200 bg-white p-8 text-center">
          <h2 className="text-xl font-bold text-gray-900">No matching news right now</h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            Some companies will not always have fresh headlines. That is normal, and prices can still move with the broader market.
          </p>
        </section>
      )}
    </div>
  );
}
