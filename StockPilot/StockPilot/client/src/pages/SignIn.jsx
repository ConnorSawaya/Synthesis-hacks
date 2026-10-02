import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { BarChart3 } from 'lucide-react';

export default function SignIn() {
  const navigate = useNavigate();
  const { setUser } = useStore();

  const handleStartDemo = () => {
    setUser({ id: 'demo', name: 'Demo Student', demoMode: true });
    navigate('/lessons');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <div className="mb-10 flex items-center justify-center">
          <div className="inline-flex items-center gap-3 rounded-full bg-white px-5 py-3 shadow-sm ring-1 ring-slate-200">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-orange-500 text-white">
              <BarChart3 className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">StockPilot</div>
              <div className="text-xs text-slate-500">Learn with lessons, practice trades, and simple market news</div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-xl">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl">
            <h1 className="mt-3 text-3xl font-bold text-slate-900">
              Explore StockPilot
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              This is a browser demo. It does not create an account or verify a password. Your sample progress stays in this browser and does not sync to other devices.
            </p>

            <div className="mt-8">
              <button
                type="button"
                onClick={handleStartDemo}
                className="w-full rounded-3xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2"
              >
                Start the demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
