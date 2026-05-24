import NewsCard from './NewsCard';

export default function RelatedNewsList({ articles, ticker }) {
  return (
    <section className="rounded-[1.75rem] border border-gray-200 bg-white p-6">
      <div className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-700">
        Related news
      </div>
      <h3 className="mt-1 text-xl font-bold text-gray-900">
        {ticker ? `${ticker} headlines` : 'Recent headlines'}
      </h3>

      {articles.length > 0 ? (
        <div className="mt-5 space-y-4">
          {articles.map((article) => (
            <NewsCard key={article.id} article={article} compact />
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-2xl bg-gray-50 px-4 py-5 text-sm leading-6 text-gray-600">
          No major recent news is available for this company right now. The market price may still move because of normal market activity.
        </div>
      )}
    </section>
  );
}
