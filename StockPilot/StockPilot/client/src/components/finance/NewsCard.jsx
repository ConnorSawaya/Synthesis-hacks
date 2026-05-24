import { Clock, Newspaper } from 'lucide-react';

const SENTIMENT_STYLES = {
  positive: 'bg-green-50 text-green-700',
  neutral: 'bg-gray-50 text-gray-600',
  negative: 'bg-red-50 text-red-600',
};

const IMPORTANCE_STYLES = {
  high: 'border-orange-200 bg-orange-50 text-orange-700',
  medium: 'border-blue-200 bg-blue-50 text-blue-700',
  low: 'border-gray-200 bg-gray-50 text-gray-500',
};

function formatPublishedAt(publishedAt) {
  return new Date(publishedAt).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function NewsCard({ article, compact = false, featured = false }) {
  const sentimentClass = SENTIMENT_STYLES[article.sentiment] || SENTIMENT_STYLES.neutral;
  const importanceClass = IMPORTANCE_STYLES[article.importance] || IMPORTANCE_STYLES.low;
  const isHighImportance = article.importance === 'high';

  return (
    <article className={`flex h-full flex-col rounded-[1.5rem] border bg-white p-5 ${
      featured
        ? 'min-h-[26rem] border-orange-200 shadow-[0_14px_40px_rgba(249,115,22,0.12)]'
        : compact
        ? 'min-h-[15rem] border-gray-200'
        : isHighImportance
        ? 'min-h-[18rem] border-orange-200 shadow-[0_10px_30px_rgba(249,115,22,0.08)]'
        : 'min-h-[18rem] border-gray-200'
    }`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
          <Newspaper className="h-3.5 w-3.5" />
          {article.category}
        </span>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${sentimentClass}`}>
          {article.sentiment}
        </span>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${importanceClass}`}>
          {isHighImportance ? 'High impact' : `${article.importance} impact`}
        </span>
      </div>

      <h3 className={`${featured ? 'mt-5 text-xl leading-8' : compact ? 'mt-4 text-base leading-6' : 'mt-4 text-lg leading-7'} font-bold text-gray-900`}>
        {article.title}
      </h3>
      <p className={`${compact ? 'mt-2' : 'mt-3'} ${featured ? 'text-sm leading-6' : 'text-sm leading-6'} text-gray-600`}>
        {article.summary}
      </p>

      {!compact && article.watchMetric ? (
        <div className="mt-4 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm leading-6 text-gray-600">
          <span className="font-semibold text-gray-900">What investors watch: </span>
          {article.watchMetric}
        </div>
      ) : null}

      {!compact && article.whyThisMatters ? (
        <div className="mt-4 rounded-2xl bg-gray-50 px-4 py-3 text-sm leading-6 text-gray-600">
          <span className="font-semibold text-gray-900">Why this matters: </span>
          {article.whyThisMatters}
        </div>
      ) : null}

      <div className="mt-auto pt-4">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5" />
          <span>{formatPublishedAt(article.publishedAt)}</span>
        </div>
        <div className="font-semibold">{article.source}</div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {article.relatedTickers.map((ticker) => (
            <span key={ticker} className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600">
              {ticker === 'MARKET' ? 'Market' : ticker}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
