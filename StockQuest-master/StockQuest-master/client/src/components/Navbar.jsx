import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { BookOpen, BarChart3, User, Home, TrendingUp, Lock, Flame, Zap } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/', label: 'Home', icon: Home, minLevel: 1, hint: 'Continue your journey' },
  { path: '/lessons', label: 'Learn', icon: BookOpen, minLevel: 1, hint: 'Start the next lesson' },
  { path: '/trade', label: 'Practice', icon: TrendingUp, minLevel: 2, hint: 'Practice what you learned' },
  { path: '/profile', label: 'Profile', icon: User, minLevel: 1, hint: 'Progress and settings' },
];

function DesktopItem({ item, active, locked }) {
  const Icon = item.icon;

  if (locked) {
    return (
      <div
        className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-gray-400"
        title={`Reach Level ${item.minLevel} to unlock`}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
          <Lock className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-gray-500">{item.label}</div>
          <div className="text-xs text-gray-400">Unlocks at Level {item.minLevel}</div>
        </div>
      </div>
    );
  }

  return (
    <Link
      to={item.path}
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-colors ${
        active
          ? 'bg-orange-50 text-orange-700'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${active ? 'bg-orange-100' : 'bg-gray-100'}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-semibold">{item.label}</div>
        <div className="text-xs text-gray-400">{item.hint}</div>
      </div>
    </Link>
  );
}

export default function Navbar() {
  const { xp, streakCount } = useStore();
  const location = useLocation();
  const level = Math.floor(xp / 100) + 1;

  return (
    <>
      <nav className="fixed left-0 top-0 bottom-0 z-40 hidden w-72 flex-col border-r border-gray-200 bg-white md:flex">
        <div className="border-b border-gray-200 p-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500 text-white">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">StockQuest</div>
              <div className="text-sm text-gray-500">Learn investing one step at a time</div>
            </div>
          </Link>
        </div>

        <div className="border-b border-gray-200 bg-orange-50/60 px-6 py-4">
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">Your momentum</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Zap className="h-4 w-4 text-orange-500" />
                Level
              </div>
              <div className="mt-1 text-2xl font-bold text-gray-900">{level}</div>
            </div>
            <div className="rounded-2xl bg-white px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Flame className="h-4 w-4 text-orange-500" />
                Streak
              </div>
              <div className="mt-1 text-2xl font-bold text-gray-900">{streakCount}d</div>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto p-4">
          {NAV_ITEMS.map((item) => (
            <DesktopItem
              key={item.path}
              item={item}
              active={location.pathname === item.path}
              locked={level < item.minLevel}
            />
          ))}
        </div>

        <div className="border-t border-gray-200 p-4">
          <div className="rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
            <div className="font-semibold text-gray-900">Next step</div>
            <div className="mt-1">Finish lessons to unlock guided trading practice.</div>
          </div>
        </div>
      </nav>

      <div className="fixed inset-x-0 top-0 z-40 border-b border-gray-200 bg-white md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500 text-white">
              <BarChart3 className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900">StockQuest</div>
              <div className="text-[11px] text-gray-500">Learn. Practice. Repeat.</div>
            </div>
          </Link>
          <div className="text-right">
            <div className="text-xs text-gray-400">Level {level}</div>
            <div className="text-xs font-semibold text-orange-600">{streakCount} day streak</div>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white md:hidden">
        <div className="grid grid-cols-4 px-2 py-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            const locked = level < item.minLevel;

            return locked ? (
              <div key={item.path} className="flex flex-col items-center gap-1 py-2 text-[10px] text-gray-400">
                <Lock className="h-4 w-4" />
                <span>Lv {item.minLevel}</span>
              </div>
            ) : (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 py-2 text-[10px] ${
                  active ? 'text-orange-600' : 'text-gray-500'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
