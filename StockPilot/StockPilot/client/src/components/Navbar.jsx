import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { BookOpen, BarChart3, User, Home, TrendingUp, Lock, Briefcase } from 'lucide-react';
import { isMarketUnlocked } from '../lib/progression';

const NAV_ITEMS = [
  { path: '/', label: 'Home', icon: Home, minLevel: 1, hint: 'Pick your next move' },
  { path: '/lessons', label: 'Learn', icon: BookOpen, minLevel: 1, hint: 'Do the next lesson' },
  { path: '/trade', label: 'Market', icon: TrendingUp, minLevel: 1, hint: 'Try a practice trade' },
  { path: '/portfolio', label: 'Portfolio', icon: Briefcase, minLevel: 1, hint: 'Check what you own' },
];

function DesktopItem({ item, active, locked }) {
  const Icon = item.icon;

  if (locked) {
    const lockedCopy = item.path === '/trade' || item.path === '/portfolio'
      ? 'Pass Module 1 quiz to unlock'
      : `Unlocks at Level ${item.minLevel}`;

    return (
      <div
        className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-gray-400"
        title={lockedCopy}
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100">
          <Lock className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-gray-500">{item.label}</div>
          <div className="text-xs text-gray-400">{lockedCopy}</div>
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
  const { xp, streakCount, completedLessons } = useStore();
  const location = useLocation();
  const level = Math.floor(xp / 100) + 1;
  const marketUnlocked = isMarketUnlocked(completedLessons);
  const desktopNavItems = NAV_ITEMS.map((item) => ({
    ...item,
    gated: item.path === '/trade' || item.path === '/portfolio' ? !marketUnlocked : false,
  }));
  const mobileNavItems = [...desktopNavItems, { path: '/profile', label: 'Profile', icon: User, minLevel: 1, hint: 'Badges and progress', gated: false }];

  return (
    <>
      <nav className="fixed left-0 top-0 bottom-0 z-40 hidden w-72 flex-col border-r border-gray-200 bg-white md:flex">
        <div className="flex-1 space-y-2 overflow-y-auto p-4">
          {desktopNavItems.map((item) => (
            <DesktopItem
              key={item.path}
              item={item}
              active={location.pathname === item.path}
              locked={level < item.minLevel || item.gated}
            />
          ))}
        </div>
        <div className="border-t border-gray-200 p-4">
          <DesktopItem
            item={{ path: '/profile', label: 'Profile', icon: User, minLevel: 1, hint: 'Progress and settings' }}
            active={location.pathname === '/profile'}
            locked={false}
          />
        </div>
      </nav>

      <div className="fixed inset-x-0 top-0 z-40 border-b border-gray-200 bg-white md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500 text-white">
              <BarChart3 className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900">StockPilot</div>
              <div className="text-[11px] text-gray-500">Learn. Track. Grow.</div>
            </div>
          </Link>
          <div className="text-right">
            <div className="text-xs text-gray-400">Level {level}</div>
            <div className="text-xs font-semibold text-orange-600">{streakCount} day streak</div>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white md:hidden">
        <div className="grid px-2 py-2" style={{ gridTemplateColumns: `repeat(${mobileNavItems.length}, minmax(0, 1fr))` }}>
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            const locked = level < item.minLevel || item.gated;

            return locked ? (
              <div key={item.path} className="flex flex-col items-center gap-1 py-2 text-[10px] text-gray-400">
                <Lock className="h-4 w-4" />
                <span>{item.path === '/trade' || item.path === '/portfolio' ? 'Quiz' : `Lv ${item.minLevel}`}</span>
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
