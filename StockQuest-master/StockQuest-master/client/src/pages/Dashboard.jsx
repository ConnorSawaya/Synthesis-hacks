import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { MODULES, getModuleProgress } from '../data/lessons';
import { BookOpen, ChevronRight, Flame, Target, TrendingUp, Zap } from 'lucide-react';
import { MARKET_CHALLENGES } from '../data/challenges';

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
  const { xp, streakCount, completedLessons, holdings, completedChallenges } = useStore();
  const level = Math.floor(xp / 100) + 1;
  const totalLessons = MODULES.reduce((sum, mod) => sum + mod.lessons.length, 0);
  const passedLessons = completedLessons.filter((lesson) => lesson.score >= 80).length;
  const isNewUser = passedLessons === 0 && completedChallenges.length === 0;
  const challengeProgress = Math.round((completedChallenges.length / MARKET_CHALLENGES.length) * 100);
  const nextLesson = getNextLesson(completedLessons);
  const progressPercent = Math.round((passedLessons / totalLessons) * 100);
  const activeModule = nextLesson
    ? MODULES.find((mod) => mod.id === nextLesson.moduleId)
    : MODULES[MODULES.length - 1];
  const activeModuleProgress = activeModule
    ? getModuleProgress(activeModule.id, completedLessons)
    : 100;
  const tradeUnlocked = level >= 2;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="rounded-[2rem] border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-white p-8 shadow-sm">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            {isNewUser ? (
              <>
                <h1 className="text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">
                  Start here
                </h1>
                <p className="mt-3 max-w-2xl text-base leading-7 text-gray-600">
                  Learn the basics first.
                </p>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">
                  Can you survive today&apos;s fake market?
                </h1>
                <p className="mt-3 max-w-2xl text-base leading-7 text-gray-600">
                  Spot hype, manage risk, and practice safely.
                </p>
              </>
            )}
            <div className="mt-6 flex flex-wrap gap-4">
              {isNewUser ? (
                <Link to="/lessons" className="rounded-2xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600">
                  Learn now
                </Link>
              ) : (
                <>
                  <Link to="/challenge" className="rounded-2xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600">
                    Start Market Challenge
                  </Link>
                  <Link to="/lessons" className="rounded-2xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-900 transition hover:bg-gray-50">
                    Lessons
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-gray-200 bg-white p-6">
            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">Progress</div>
            <div className="mt-5 space-y-4">
              {!isNewUser && (
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
                  <Flame className="h-4 w-4 text-orange-500" />
                  Streak
                </div>
                <div className="font-bold text-gray-900">{streakCount} days</div>
              </div>
            </div>
          </div>
        </div>
      </div>

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
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-orange-700">
            <TrendingUp className="h-4 w-4" />
            Practice
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900">
            {tradeUnlocked ? 'Practice is open' : 'Practice unlocks next'}
          </h2>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            {tradeUnlocked
              ? 'Use this after lessons when you want extra practice.'
              : 'Reach Level 2 to unlock it.'}
          </p>
          <div className="mt-5 flex items-center justify-between rounded-2xl bg-gray-50 px-4 py-4">
            <div>
              <div className="text-sm font-semibold text-gray-900">
                {tradeUnlocked ? 'Practice Your First Trade' : 'Trading unlock rule'}
              </div>
              <div className="text-xs text-gray-500">
                {tradeUnlocked
                  ? `${holdings.length > 0 ? `${holdings.length} holdings in your practice portfolio` : 'No holdings yet - perfect time to start carefully'}`
                  : 'Reach Level 2 by completing lessons and checkpoints'}
              </div>
            </div>
            <Link
              to={tradeUnlocked ? '/trade' : '/lessons'}
              className="inline-flex items-center gap-1 text-sm font-semibold text-orange-600 hover:text-orange-700"
            >
              {tradeUnlocked ? 'Open trade practice' : 'Keep learning'}
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
