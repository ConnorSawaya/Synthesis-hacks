import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { BarChart3, BookOpen, ShieldAlert, Sparkles } from 'lucide-react';

const BENEFITS = [
  {
    title: 'Spot hype',
    description: 'Read simulated market stories and figure out whether the buzz is signal, noise, or a trap.',
    icon: BookOpen,
  },
  {
    title: 'Manage risk',
    description: 'Make safer money decisions and see consequences without using any real money.',
    icon: ShieldAlert,
  },
  {
    title: 'Learn from consequences',
    description: 'Short coaching feedback and support lessons help you understand why a decision was strong or risky.',
    icon: Sparkles,
  },
];

export default function Landing() {
  const navigate = useNavigate();
  const { setUser } = useStore();

  const handleQuickStart = () => {
    setUser({ id: 1, name: 'Stock Trader', email: 'demo@stockpilot.app' });
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-white text-slate-900">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-sm">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <div className="text-lg font-bold">StockPilot</div>
            <div className="text-sm text-slate-500">A market-simulation game for safer money thinking</div>
          </div>
        </div>
        <button
          onClick={() => navigate('/signin?mode=login')}
          className="text-sm font-semibold text-slate-600 hover:text-slate-900"
        >
          Sign in
        </button>
      </nav>

      <main className="mx-auto max-w-6xl px-6 pb-20 pt-10">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-orange-700 shadow-sm ring-1 ring-orange-100">
              <Sparkles className="h-4 w-4" />
              Learn market decisions safely
            </div>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-5xl font-black tracking-tight sm:text-6xl">
                Spot hype, manage risk, and learn from fake-market consequences.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                StockPilot gives students fast money-decision challenges first, then uses short lessons to explain what happened. No real money. No pressure to chase profits.
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <button onClick={handleQuickStart} className="rounded-2xl bg-orange-500 px-7 py-4 text-sm font-semibold text-white transition hover:bg-orange-600">
                Try the demo
              </button>
              <button
                onClick={() => navigate('/signin?mode=signup')}
                className="rounded-2xl border border-slate-300 bg-white px-7 py-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
              >
                Create account
              </button>
            </div>
          </div>

          <div className="rounded-[2rem] border border-orange-100 bg-white p-8 shadow-xl shadow-orange-100/40">
            <div className="mb-6 text-sm font-semibold uppercase tracking-[0.24em] text-orange-600">
              How it works
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl bg-orange-50 px-5 py-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">Step 1</div>
                <div className="mt-1 text-lg font-bold text-slate-900">Start a market challenge</div>
                <div className="mt-1 text-sm text-slate-600">A fake company, fake news event, and one tense decision show up immediately.</div>
              </div>
              <div className="rounded-2xl bg-slate-50 px-5 py-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">Step 2</div>
                <div className="mt-1 text-lg font-bold text-slate-900">Choose and explain why</div>
                <div className="mt-1 text-sm text-slate-600">Pick an action, then pick the reason behind it so the app can coach your thinking.</div>
              </div>
              <div className="rounded-2xl bg-slate-50 px-5 py-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">Step 3</div>
                <div className="mt-1 text-lg font-bold text-slate-900">See the consequence</div>
                <div className="mt-1 text-sm text-slate-600">Get a risk score, decision score, and a related lesson if you want to go deeper.</div>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-16 grid gap-5 md:grid-cols-3">
          {BENEFITS.map(({ title, description, icon: Icon }) => (
            <div key={title} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-xl font-bold text-slate-900">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
