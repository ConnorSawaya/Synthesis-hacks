import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { ALL_BADGES, MODULES } from '../data/lessons';
import { BadgeCard } from '../components/Gamification';
import { Award, ChevronRight, Flame, Settings, Shield, Target, TrendingUp, Zap } from 'lucide-react';

function getInitials(name) {
  if (!name) return 'ST';

  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');
}

export default function Profile() {
  const { user, xp, streakCount, earnedBadges, completedLessons, transactions, holdings } = useStore();
  const displayName = user?.name || 'Stock Trader';
  const displayEmail = user?.email || 'student@example.com';
  const level = Math.floor(xp / 100) + 1;
  const totalLessons = MODULES.reduce((sum, mod) => sum + mod.lessons.length, 0);
  const passedLessons = completedLessons.filter((item) => item.score >= 80).length;
  const progressPercent = Math.round((passedLessons / totalLessons) * 100);
  const badgePercent = Math.round((earnedBadges.length / ALL_BADGES.length) * 100);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="space-y-6 xl:sticky xl:top-8 xl:self-start">
          <section className="rounded-[2rem] border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-white p-8">
            <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] bg-white text-3xl font-black text-orange-700 ring-1 ring-orange-100">
              {getInitials(displayName)}
            </div>
            <h1 className="mt-6 text-3xl font-black tracking-tight text-gray-900">{displayName}</h1>
            <p className="mt-2 text-sm text-gray-500">{displayEmail}</p>
            <p className="mt-4 text-sm leading-6 text-orange-700">
              Your desktop home for progress, milestones, and the account tools you use most often.
            </p>

            <div className="mt-6 rounded-[1.5rem] bg-white p-5 ring-1 ring-orange-100">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">Current level</div>
              <div className="mt-2 text-4xl font-black text-gray-900">{level}</div>
              <div className="mt-1 text-sm text-gray-500">{xp} total XP earned</div>
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-orange-700">
              <Zap className="h-4 w-4" />
              Keep going
            </div>
            <h2 className="mt-3 text-2xl font-bold text-gray-900">What your progress means</h2>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              Your level shows consistency. Your badges show milestones. Your streak shows momentum. The goal is steady confidence, not rushing.
            </p>
          </section>

          <section className="rounded-[1.75rem] border border-gray-200 bg-white p-6">
            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-700">Account tools</div>
            <div className="mt-4 space-y-3">
              <Link
                to="/settings"
                className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-4 text-sm text-gray-700 hover:bg-gray-100"
              >
                <div className="flex items-center gap-3">
                  <Settings className="h-4 w-4 text-orange-500" />
                  <div>
                    <div className="font-semibold text-gray-900">Settings</div>
                    <div className="text-xs text-gray-500">Difficulty, reminders, and preferences</div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </Link>

              <Link
                to="/parental"
                className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-4 text-sm text-gray-700 hover:bg-gray-100"
              >
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-orange-500" />
                  <div>
                    <div className="font-semibold text-gray-900">Parental dashboard</div>
                    <div className="text-xs text-gray-500">Progress and support controls for adults</div>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </Link>
            </div>
          </section>
        </aside>

        <div className="space-y-6">
          <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
            <div className="rounded-[1.5rem] border border-gray-200 bg-white p-5">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Target className="h-4 w-4 text-orange-500" />
                Progress
              </div>
              <div className="mt-3 text-3xl font-black text-gray-900">{progressPercent}%</div>
              <div className="text-sm text-gray-500">Learning path complete</div>
            </div>
            <div className="rounded-[1.5rem] border border-gray-200 bg-white p-5">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Flame className="h-4 w-4 text-orange-500" />
                Streak
              </div>
              <div className="mt-3 text-3xl font-black text-gray-900">{streakCount}d</div>
              <div className="text-sm text-gray-500">Days in a row</div>
            </div>
            <div className="rounded-[1.5rem] border border-gray-200 bg-white p-5">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Award className="h-4 w-4 text-orange-500" />
                Badges
              </div>
              <div className="mt-3 text-3xl font-black text-gray-900">{earnedBadges.length}</div>
              <div className="text-sm text-gray-500">{badgePercent}% of the collection unlocked</div>
            </div>
            <div className="rounded-[1.5rem] border border-gray-200 bg-white p-5">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <TrendingUp className="h-4 w-4 text-orange-500" />
                Market trades
              </div>
              <div className="mt-3 text-3xl font-black text-gray-900">{transactions.length}</div>
              <div className="text-sm text-gray-500">{holdings.length} active holdings</div>
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-gray-200 bg-white p-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-orange-700">
                  <Award className="h-4 w-4" />
                  Badge collection
                </div>
                <h2 className="mt-3 text-2xl font-bold text-gray-900">Celebrate your milestones</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                  This section is spaced for desktop so you can scan your full collection without feeling boxed into a narrow card stack.
                </p>
              </div>
              <div className="rounded-2xl bg-gray-50 px-4 py-3">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">Unlocked so far</div>
                <div className="mt-1 text-2xl font-black text-gray-900">
                  {earnedBadges.length}/{ALL_BADGES.length}
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
              {ALL_BADGES.map((badge) => {
                const earned = earnedBadges.find((entry) => entry.id === badge.id);
                return <BadgeCard key={badge.id} badge={badge} earned={!!earned} />;
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
