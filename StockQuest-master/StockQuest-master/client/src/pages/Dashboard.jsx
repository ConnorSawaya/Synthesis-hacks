import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { MODULES, getModuleProgress } from '../data/lessons';
import { BookOpen, ChevronRight, Flame, Newspaper, Target, TrendingUp, Zap } from 'lucide-react';
import { MARKET_CHALLENGES } from '../data/challenges';
import { getPassedLessonCount, isChallengeUnlocked, isMarketUnlocked } from '../lib/progression';

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

export default function Dashboard() {
  const { xp, streakCount, completedLessons, holdings, completedChallenges, cash } = useStore();
  const level = Math.floor(xp / 100) + 1;
  const totalLessons = MODULES.reduce((sum, mod) => sum + mod.lessons.length, 0);
  const passedLessons = getPassedLessonCount(completedLessons);
  const challengeProgress = Math.round((completedChallenges.length / MARKET_CHALLENGES.length) * 100);
  const nextLesson = getNextLesson(completedLessons);
  const progressPercent = Math.round((passedLessons / totalLessons) * 100);
  const activeModule = nextLesson
    ? MODULES.find((mod) => mod.id === nextLesson.moduleId)
    : MODULES[MODULES.length - 1];
  const activeModuleProgress = activeModule
    ? getModuleProgress(activeModule.id, completedLessons)
    : 100;
  const challengeUnlocked = isChallengeUnlocked(completedLessons);
  const marketUnlocked = isMarketUnlocked(completedLessons);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="rounded-[2rem] border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-white p-8 shadow-sm">
        <div className="grid gap-8 xl:grid-cols-[1.3fr_0.7fr]">
          <div>
            {marketUnlocked ? (
              <>
                <h1 className="text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">
                  The market is open
                </h1>
                <p className="mt-3 max-w-2xl text-base leading-7 text-gray-600">
                  Use simulated cash, follow prices, and test decisions in a simpler market.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link to="/trade" className="rounded-2xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600">
                    Open Market
                  </Link>
                  <Link to="/news" className="rounded-2xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-50">
                    Read finance news
                  </Link>
                  <Link to="/lessons" className="rounded-2xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-50">
                    Review lessons
                  </Link>
                </div>
              </>
            ) : challengeUnlocked ? (
              <>
                <h1 className="text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">
                  Can you handle today&apos;s market challenge?
                </h1>
                <p className="mt-3 max-w-2xl text-base leading-7 text-gray-600">
                  Spot hype, manage risk, and build steady decision-making.
                </p>
                <div className="mt-6 flex flex-wrap gap-4">
                  <Link to="/challenge" className="rounded-2xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600">
                    Start Market Challenge
                  </Link>
                  <Link to="/lessons" className="rounded-2xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-50">
                    Lessons
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">
                  Start with learning
                </h1>
                <p className="mt-3 max-w-2xl text-base leading-7 text-gray-600">
                  Finish your first lesson and score at least 80% to unlock the next step.
                </p>
                <div className="mt-3 text-sm font-semibold text-green-700">
                  Passed lessons build your market cash before trading opens.
                </div>
                <div className="mt-6">
                  <Link to="/lessons" className="inline-flex rounded-2xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600">
                    Start learning
                  </Link>
                </div>
              </>
            )}
          </div>

          <div className="rounded-[1.75rem] border border-gray-200 bg-white p-6">
            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">
              {marketUnlocked ? 'Account' : 'Progress'}
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              {marketUnlocked && (
                <div className="flex items-center justify-between rounded-2xl bg-orange-50 px-4 py-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <TrendingUp className="h-4 w-4 text-orange-500" />
                    Market access
                  </div>
                  <div className="font-bold text-gray-900">Open</div>
                </div>
              )}
              {marketUnlocked && (
                <>
                  <div className="flex items-center justify-between rounded-2xl bg-orange-50 px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Newspaper className="h-4 w-4 text-orange-500" />
                      Finance news
                    </div>
                    <div className="font-bold text-gray-900">Open</div>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-orange-50 px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <TrendingUp className="h-4 w-4 text-orange-500" />
                      Portfolio
                    </div>
                    <div className="font-bold text-gray-900">Open</div>
                  </div>
                </>
              )}
              {challengeUnlocked && (
                <div className="flex items-center justify-between rounded-2xl bg-orange-50 px-4 py-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Target className="h-4 w-4 text-orange-500" />
                    Challenge progress
                  </div>
                  <div className="font-bold text-gray-900">{challengeProgress}%</div>
                </div>
              )}
              <div className="flex items-center justify-between rounded-2xl bg-orange-50 px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Target className="h-4 w-4 text-orange-500" />
                  Overall progress
                </div>
                <div className="font-bold text-gray-900">{progressPercent}%</div>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Zap className="h-4 w-4 text-orange-500" />
                  Level
                </div>
                <div className="font-bold text-gray-900">{level}</div>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                  Cash balance
                </div>
                <div className="font-bold text-gray-900">${cash.toFixed(2)}</div>
              </div>
              <div className="flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Flame className="h-4 w-4 text-orange-500" />
                  Streak
                </div>
                <div className="font-bold text-gray-900">{streakCount} days</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {marketUnlocked ? (
        <div className="grid gap-4 xl:grid-cols-4">
          <div className="rounded-[1.75rem] border border-gray-200 bg-white p-6 xl:col-span-1">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-orange-700">
              <BookOpen className="h-4 w-4" />
              Lessons
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Review what you learned</h2>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              Lessons stay available as quick references when a market decision feels fuzzy.
            </p>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-gray-100">
              <div className="h-full rounded-full bg-orange-500" style={{ width: `${activeModuleProgress}%` }} />
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Module progress: {activeModule?.title} - {activeModuleProgress}% complete
            </div>
            <Link to="/lessons" className="mt-5 inline-flex rounded-2xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-gray-50">
              Review lessons
            </Link>
          </div>

          <div className="rounded-[1.75rem] border border-gray-200 bg-white p-6 xl:col-span-1">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-orange-700">
              <TrendingUp className="h-4 w-4" />
              Market
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Make your next move</h2>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              {holdings.length > 0 ? `${holdings.length} holdings are active in your portfolio right now.` : 'No holdings yet. Your first careful move starts here.'}
            </p>
            <div className="mt-4 inline-flex rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold text-gray-500">
              Simulation only
            </div>
            <Link to="/trade" className="mt-5 inline-flex rounded-2xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600">
              Open market
            </Link>
          </div>

          <div className="rounded-[1.75rem] border border-gray-200 bg-white p-6 xl:col-span-1">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-orange-700">
              <Newspaper className="h-4 w-4" />
              Finance News
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Read finance news</h2>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              See which headlines look important and how they may connect to stock movement.
            </p>
            <Link to="/news" className="mt-5 inline-flex rounded-2xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-gray-50">
              Read finance news
            </Link>
          </div>

          <div className="rounded-[1.75rem] border border-gray-200 bg-white p-6 xl:col-span-1">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-orange-700">
              <TrendingUp className="h-4 w-4" />
              Portfolio
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">Check your results</h2>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              Track money spent, current value, and how your positions are changing over time.
            </p>
            <Link to="/portfolio" className="mt-5 inline-flex rounded-2xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-gray-50">
              Open portfolio
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-[1.75rem] border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-orange-700">
              <BookOpen className="h-4 w-4" />
              Lessons
            </div>
            <h2 className="mt-4 text-2xl font-bold text-gray-900">
              {nextLesson ? nextLesson.title : 'Review lessons'}
            </h2>
            <p className="mt-3 text-sm leading-6 text-gray-600">
              {nextLesson
                ? `Next lesson in ${activeModule?.title || 'your path'}.`
                : 'Go back through any lesson you want to review.'}
            </p>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-gray-100">
              <div className="h-full rounded-full bg-orange-500" style={{ width: `${activeModuleProgress}%` }} />
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Module progress: {activeModule?.title} - {activeModuleProgress}% complete
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-gray-200 bg-white p-6">
            {challengeUnlocked ? (
              <>
                <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-orange-700">
                  <Target className="h-4 w-4" />
                  Market Challenge
                </div>
                <h2 className="mt-4 text-2xl font-bold text-gray-900">
                  Your next step is open
                </h2>
                <p className="mt-3 text-sm leading-6 text-gray-600">
                  Use challenges to test decisions, then more tools will unlock later.
                </p>
                <div className="mt-5 flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-4">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      Start your first challenge
                    </div>
                    <div className="text-xs text-gray-500">
                      Start spotting hype and managing risk before advanced features open.
                    </div>
                  </div>
                  <Link
                    to="/challenge"
                    className="inline-flex items-center gap-1 text-sm font-semibold text-orange-600 hover:text-orange-700"
                  >
                    Open challenge
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-orange-700">
                  <TrendingUp className="h-4 w-4" />
                  Next unlock
                </div>
                <h2 className="mt-4 text-2xl font-bold text-gray-900">
                  More opens after your first lesson
                </h2>
                <p className="mt-3 text-sm leading-6 text-gray-600">
                  Complete one lesson with a strong score to unlock market challenges.
                </p>
                <div className="mt-5 flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-4">
                  <div>
                    <div className="text-sm font-semibold text-gray-900">
                      Unlock rule
                    </div>
                    <div className="text-xs text-gray-500">
                      Score 80% or higher on your first lesson to open the next part of the app.
                    </div>
                  </div>
                  <Link
                    to="/lessons"
                    className="inline-flex items-center gap-1 text-sm font-semibold text-orange-600 hover:text-orange-700"
                  >
                    Keep learning
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
