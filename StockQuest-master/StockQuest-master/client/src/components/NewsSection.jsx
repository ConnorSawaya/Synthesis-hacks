import { ArrowRight } from 'lucide-react';

export default function NewsSection({ title, description, items }) {
  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <div className="mb-10 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-orange-500">
          News & reading
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          {title}
        </h2>
        <p className="mt-4 text-base leading-7 text-slate-600">
          {description}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <article
            key={item.title}
            className="group rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-700">
                  {item.tag}
                </span>
              </div>
              {item.category && (
                <span className="rounded-full bg-orange-50 px-3 py-1 text-[11px] font-semibold text-orange-700">
                  {item.category}
                </span>
              )}
            </div>
            <h3 className="mt-6 text-xl font-semibold text-slate-900">
              {item.title}
            </h3>
            <p className="mt-4 text-sm leading-6 text-slate-600">
              {item.description}
            </p>
            {item.link ? (
              <a
                href={item.link}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-orange-600 transition hover:text-orange-700"
              >
                Read more
                <ArrowRight className="w-4 h-4" />
              </a>
            ) : (
              <div className="mt-6 text-sm font-semibold text-orange-600">
                Learn more →
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
