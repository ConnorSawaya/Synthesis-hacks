import { MessageCircle } from 'lucide-react';

export default function NewsExplanation({ messages }) {
  return (
    <section className="rounded-[1.75rem] border border-gray-200 bg-white p-6">
      <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-orange-700">
        <MessageCircle className="h-4 w-4" />
        StockPilot Coach
      </div>
      <h3 className="mt-1 text-xl font-bold text-gray-900">News and price clues</h3>

      <div className="mt-5 space-y-3">
        {messages.map((message) => (
          <div key={message} className="rounded-2xl bg-gray-50 px-4 py-3 text-sm leading-6 text-gray-600">
            {message}
          </div>
        ))}
      </div>
    </section>
  );
}
