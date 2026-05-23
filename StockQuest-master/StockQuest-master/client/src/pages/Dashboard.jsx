import { Link } from 'react-router-dom';
import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Flame,
  GraduationCap,
  Lock,
  Newspaper,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { useStore } from '../store/useStore';
import { MODULES, getLessonById, getLessonCashReward, getModuleProgress } from '../data/lessons';
import { getPassedLessonCount, isMarketUnlocked } from '../lib/progression';
import { getTotalPortfolioValue } from '../lib/portfolio';

function formatMoney(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function getNextLesson(completedLessons) {
  for (const mod of MODULES) {
    for (const lesson of mod.lessons) {
      if (!completedLessons.find((entry) => entry.lessonId === lesson.id && entry.score >= 80)) {
        return { ...lesson, moduleName: mod.title, moduleId: mod.id, moduleDescription: mod.description };
      }
    }
  }
  return null;
}

function getLatestCompletedLesson(completedLessons) {
  const latestEntry = completedLessons
    .filter((entry) => entry.score >= 80)
    .sort((left, right) => (right.completedAt || 0) - (left.completedAt || 0))[0];

  if (!latestEntry) return null;

  const lesson = getLessonById(latestEntry.lessonId);
  if (!lesson) return null;

  return { ...lesson, result: latestEntry };
}

function DashboardAction({ to, label, description, icon: Icon, locked = false }) {
  const content = (
    <div className={`h-full rounded-[1.5rem] border p-5 transition ${
      locked
        ? 'border-gray-200 bg-gray-50 text-gray-400'
        : 'border-gray-200 bg-white text-gray-900 hover:border-orange-300 hover:shadow-sm'
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
          <Icon className="h-5 w-5" />
        </div>
        {locked ? <Lock className="h-4 w-4" /> : <ChevronRight className="h-5 w-5 text-orange-500" />}
      </div>
      <div className="mt-5 text-lg font-bold">{label}</div>
      <p className="mt-2 text-sm leading-6 text-gray-500">{description}</p>
    </div>
  );

  return locked ? content : <Link to={to}>{content}</Link>;
}

export default function Dashboard() {
  const {
    xp,
    streakCount,
    completedLessons,
    holdings,
    transactions,
    cash,
    marketSimulation,
  } = useStore();

  const level = Math.floor(xp / 100) + 1;
  const totalLessons = MODULES.reduce((sum, mod) => sum + mod.lessons.length, 0);
  const passedLessons = getPassedLessonCount(completedLessons);
  const progressPercent = Math.round((passedLessons / totalLessons) * 100);
  const nextLesson = getNextLesson(completedLessons);
  const latestCompletedLesson = getLatestCompletedLesson(completedLessons);
  const activeModule = nextLesson
    ? MODULES.find((mod) => mod.id === nextLesson.moduleId)
    : MODULES[MODULES.length - 1];
  const activeModuleProgress = activeModule ? getModuleProgress(activeModule.id, completedLessons) : 100;
  const marketUnlocked = isMarketUnlocked(completedLessons);
  const lessonCashEarned = completedLessons.reduce(
    (sum, lesson) => sum + Number(lesson.cashEarned || 0),
    0
  );
  const nextLessonCashReward = nextLesson
    ? getLessonCashReward(nextLesson, marketUnlocked)
    : 0;
  const portfolioValue = marketUnlocked
    ? getTotalPortfolioValue(cash, holdings, marketSimulation)
    : cash;
  const openPositions = holdings.filter((holding) => holding.shares > 0).length;
  const nextAction = (() => {
    if (!marketUnlocked && nextLesson) {
      return {
        eyebrow: 'Next up',
        title: `Continue: ${nextLesson.title}`,
        body: `Finish this lesson, earn more practice cash, and keep your path moving.`,
        to: `/lessons/${nextLesson.id}`,
        label: 'Start next lesson',
      };
    }

    if (marketUnlocked && openPositions === 0) {
      return {
        eyebrow: 'Next up',
        title: 'Make your first practice trade',
        body: 'Pick a company, check the chart, and use your lesson cash carefully.',
        to: '/trade',
        label: 'Open market',
      };
    }

    if (marketUnlocked) {
      return {
        eyebrow: 'Next up',
        title: 'Check what changed today',
        body: 'See whether your portfolio moved because of prices, buying, or selling.',
        to: '/portfolio',
        label: 'Review portfolio',
      };
    }

    return {
      eyebrow: 'Next up',
      title: 'Keep practicing',
      body: 'You finished the main path. Replay lessons or check the market to stay sharp.',
      to: '/lessons',
      label: 'Review lessons',
    };
  })();

  const pathSteps = [
    {
      label: 'Stock Basics',
      detail: `${Math.min(activeModuleProgress, 100)}% in current module`,
      status: marketUnlocked ? 'Complete' : 'Current',
      tone: marketUnlocked ? 'complete' : 'current',
      icon: BookOpen,
    },
    {
      label: 'Market',
      detail: marketUnlocked ? `${transactions.length} trades made` : 'Pass Module 1 quiz',
      status: !marketUnlocked ? 'Locked' : transactions.length > 0 ? 'In use' : 'Ready',
      tone: !marketUnlocked ? 'locked' : transactions.length > 0 ? 'current' : 'ready',
      icon: TrendingUp,
    },
    {
      label: 'Portfolio',
      detail: marketUnlocked ? `${openPositions} holdings live` : 'Unlocks with market',
      status: !marketUnlocked ? 'Locked' : openPositions > 0 ? 'In use' : 'Ready',
      tone: !marketUnlocked ? 'locked' : openPositions > 0 ? 'current' : 'ready',
      icon: BarChart3,
    },
    {
      label: 'News',
      detail: marketUnlocked ? 'See how news can move prices' : 'Unlocks with market',
      status: marketUnlocked ? 'Ready' : 'Locked',
      tone: marketUnlocked ? 'ready' : 'locked',
      icon: Newspaper,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(22rem,0.55fr)]">
        <div className="rounded-[2rem] border border-gray-200 bg-white p-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">
            <GraduationCap className="h-4 w-4" />
            {nextAction.eyebrow}
          </div>
          <h1 className="mt-5 max-w-3xl text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">
            {nextAction.title}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-gray-600">
            {nextAction.body}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to={nextAction.to}
              className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              {nextAction.label}
              <ChevronRight className="h-4 w-4" />
            </Link>
            {marketUnlocked ? (
              <Link
                to="/news"
                className="inline-flex items-center gap-2 rounded-2xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-50"
              >
                Read market news
              </Link>
            ) : null}
          </div>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.25rem] bg-gray-50 px-4 py-4">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">Lessons passed</div>
              <div className="mt-2 text-2xl font-black text-gray-900">{passedLessons}/{totalLessons}</div>
            </div>
            <div className="rounded-[1.25rem] bg-gray-50 px-4 py-4">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">Cash earned</div>
              <div className="mt-2 text-2xl font-black text-gray-900">{formatMoney(lessonCashEarned)}</div>
            </div>
            <div className="rounded-[1.25rem] bg-gray-50 px-4 py-4">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                {marketUnlocked ? 'Portfolio value' : 'Next lesson reward'}
              </div>
              <div className="mt-2 text-2xl font-black text-gray-900">
                {marketUnlocked ? formatMoney(portfolioValue) : formatMoney(nextLessonCashReward)}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-orange-700">
            <Wallet className="h-4 w-4" />
            Right now
          </div>
          <div className="mt-5 space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm font-semibold text-gray-900">
                <span>Path progress</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-orange-500" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>

            <div className="grid gap-3">
              <div className="flex items-center justify-between rounded-[1.25rem] bg-gray-50 px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Flame className="h-4 w-4 text-orange-500" />
                  Streak
                </div>
                <div className="font-bold text-gray-900">{streakCount} day{streakCount === 1 ? '' : 's'}</div>
              </div>
              <div className="flex items-center justify-between rounded-[1.25rem] bg-gray-50 px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <GraduationCap className="h-4 w-4 text-orange-500" />
                  Level
                </div>
                <div className="font-bold text-gray-900">{level}</div>
              </div>
              <div className="flex items-center justify-between rounded-[1.25rem] bg-gray-50 px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Wallet className="h-4 w-4 text-orange-500" />
                  Cash balance
                </div>
                <div className="font-bold text-gray-900">{formatMoney(cash)}</div>
              </div>
              {marketUnlocked ? (
                <div className="flex items-center justify-between rounded-[1.25rem] bg-gray-50 px-4 py-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <BarChart3 className="h-4 w-4 text-orange-500" />
                    Open positions
                  </div>
                  <div className="font-bold text-gray-900">{openPositions}</div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-gray-200 bg-white p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-orange-700">
              <BookOpen className="h-4 w-4" />
              Learning path
            </div>
            <h2 className="mt-3 text-2xl font-bold text-gray-900">What unlocks next</h2>
          </div>
          <div className="text-sm text-gray-500">Learn first. Practice next. Trade when ready.</div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-4">
          {pathSteps.map((step, index) => {
            const Icon = step.icon;
            const isLocked = step.tone === 'locked';
            const isCurrent = step.tone === 'current';
            const isComplete = step.tone === 'complete';

            return (
              <div
                key={step.label}
                className={`rounded-[1.25rem] border p-4 ${
                  isCurrent
                    ? 'border-orange-300 bg-orange-50'
                    : isLocked
                    ? 'border-gray-200 bg-gray-50'
                    : isComplete
                    ? 'border-green-200 bg-green-50'
                    : 'border-blue-200 bg-blue-50'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                    isCurrent
                      ? 'bg-white text-orange-600'
                      : isLocked
                      ? 'bg-white text-gray-400'
                      : isComplete
                      ? 'bg-white text-green-600'
                      : 'bg-white text-blue-600'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={`text-xs font-bold ${
                    isCurrent
                      ? 'text-orange-700'
                      : isLocked
                      ? 'text-gray-400'
                      : isComplete
                      ? 'text-green-700'
                      : 'text-blue-700'
                  }`}>
                    {step.status}
                  </span>
                </div>
                <div className="mt-4 text-sm font-bold text-gray-900">{step.label}</div>
                <div className="mt-1 text-xs leading-5 text-gray-500">{step.detail}</div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="rounded-[2rem] border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-orange-700">
            <Clock3 className="h-4 w-4" />
            Recent learning
          </div>
          {latestCompletedLesson ? (
            <>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">{latestCompletedLesson.title}</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">
                Last win from {latestCompletedLesson.moduleName}.
            </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.25rem] bg-gray-50 px-4 py-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">Score</div>
                  <div className="mt-2 text-xl font-black text-gray-900">{latestCompletedLesson.result.score}%</div>
                </div>
                <div className="rounded-[1.25rem] bg-gray-50 px-4 py-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">Cash earned</div>
                  <div className="mt-2 text-xl font-black text-gray-900">
                    {formatMoney(latestCompletedLesson.result.cashEarned || 0)}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <h2 className="mt-4 text-2xl font-bold text-gray-900">No lesson win yet</h2>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Pass your first lesson to earn cash and unlock what comes next.
              </p>
            </>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <DashboardAction
            to={nextLesson ? `/lessons/${nextLesson.id}` : '/lessons'}
            label={nextLesson ? 'Continue lesson' : 'Review lessons'}
            description={nextLesson ? `${nextLesson.moduleName}: ${nextLesson.title}` : 'Revisit any completed concept.'}
            icon={BookOpen}
          />
          <DashboardAction
            to="/trade"
            label="Market"
            description={marketUnlocked ? 'Check a stock and try a trade.' : 'Pass Module 1 quiz to unlock.'}
            icon={TrendingUp}
            locked={!marketUnlocked}
          />
          <DashboardAction
            to="/portfolio"
            label="Portfolio"
            description={
              marketUnlocked
                ? openPositions > 0
                  ? 'See what you own and how it changed.'
                  : 'Shows up after your first trade.'
                : 'Unlocks with Market.'
            }
            icon={CheckCircle2}
            locked={!marketUnlocked}
          />
        </div>
      </section>
    </div>
  );
}
