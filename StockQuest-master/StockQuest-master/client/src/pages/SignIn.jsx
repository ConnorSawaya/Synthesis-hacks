import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { BarChart3 } from 'lucide-react';

function AuthForm({ mode, onSubmit, onToggleMode }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({ name, email });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {mode === 'signup' && (
        <label className="block">
          <span className="text-sm font-semibold text-slate-700">Full name</span>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
            placeholder="Your name"
            required
          />
        </label>
      )}
      <label className="block">
        <span className="text-sm font-semibold text-slate-700">Email address</span>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
          placeholder="you@example.com"
          required
        />
      </label>
      <label className="block">
        <span className="text-sm font-semibold text-slate-700">Password</span>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="mt-2 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
          placeholder="6+ characters"
          required
          minLength={6}
        />
      </label>
      <button
        type="submit"
        className="w-full rounded-3xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
      >
        {mode === 'signup' ? 'Create account' : 'Sign in'}
      </button>
      <div className="text-center text-sm text-slate-500">
        {mode === 'signup' ? (
          <>
            Already have an account?{' '}
            <button type="button" onClick={() => onToggleMode('login')} className="font-semibold text-orange-600 hover:text-orange-700">
              Sign in
            </button>
          </>
        ) : (
          <>
            New here?{' '}
            <button type="button" onClick={() => onToggleMode('signup')} className="font-semibold text-orange-600 hover:text-orange-700">
              Create one
            </button>
          </>
        )}
      </div>
    </form>
  );
}

export default function SignIn() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useStore();
  const mode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';

  const handleAuth = ({ name, email }) => {
    setUser({ id: 1, name: name || email.split('@')[0], email, demoMode: false });
    navigate('/');
  };

  const handleQuickStart = () => {
    setUser({ id: 1, name: 'Demo Student', email: 'demo@stockpilot.app', demoMode: true });
    navigate('/');
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
              <div className="text-xs text-slate-500">Learn with market-simulation challenges</div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-xl">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl">
            <p className="text-sm uppercase tracking-[0.24em] text-orange-600">{mode === 'signup' ? 'Create account' : 'Sign in'}</p>
            <h1 className="mt-3 text-3xl font-bold text-slate-900">
              {mode === 'signup' ? 'Start here' : 'Welcome back'}
            </h1>

            <div className="mt-8">
              <AuthForm mode={mode} onSubmit={handleAuth} onToggleMode={(next) => setSearchParams({ mode: next })} />
            </div>

            <div className="mt-6 border-t border-slate-200 pt-6">
              <button
                onClick={handleQuickStart}
                className="w-full rounded-3xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-700 transition hover:bg-orange-100"
              >
                Continue in demo mode
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
