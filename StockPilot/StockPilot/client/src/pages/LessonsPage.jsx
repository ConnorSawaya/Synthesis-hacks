import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { ALL_BADGES, MODULES, getLessonCashReward, isLessonAccessible } from '../data/lessons';
import { OutOfHeartsModal } from '../components/Feedback';
import { BarChart3, CheckCircle2, ChevronRight, Lock, PlayCircle, SkipForward, Sparkles } from 'lucide-react';
import { useMemo, useState } from 'react';
import { isMarketUnlocked } from '../lib/progression';

const MODULE_EXPLAINERS = {
  1: 'You are building the language of investing so later choices make sense.',
  2: 'This module turns vocabulary into action with your first trade decisions.',
  3: 'You start learning how to think before you click buy or sell.',
  4: 'Charts help you notice trends instead of guessing.',
  5: 'Advanced ideas are optional once your foundation is solid.',
};

const PATH_LANES = [
  'sm:col-start-1',
  'sm:col-start-2',
  'sm:col-start-3',
  'sm:col-start-2',
];
const PATH_X_POSITIONS = [16.667, 50, 83.333, 50];
const PATH_STEP_HEIGHT = 250;
const PATH_NODE_OFFSET = 32;

function buildSmoothPath(points) {
  if (!points.length) return '';

  return points.reduce((path, point, index) => {
    if (index === 0) {
      return `M ${point.x} ${point.y}`;
    }

    const previous = points[index - 1];
    const controlY = (previous.y + point.y) / 2;
    return `${path} C ${previous.x} ${controlY}, ${point.x} ${controlY}, ${point.x} ${point.y}`;
  }, '');
}

function getLessonQuestionCount(lesson) {
  return lesson.content.filter((step) => step.type === 'quiz').length;
}

function getLessonMaxXP(lesson) {
  return (lesson.xpReward || 0) + getLessonQuestionCount(lesson) * 10;
}

function getLessonEarnedXP(lesson) {
  if (!lesson.result) return 0;
  if (typeof lesson.result.xpEarned === 'number') return lesson.result.xpEarned;

  const questionCount = getLessonQuestionCount(lesson);
  const estimatedCorrect = lesson.result.totalQuestions
    ? lesson.result.correctAnswers ?? Math.round((lesson.result.score / 100) * lesson.result.totalQuestions)
    : Math.round((lesson.result.score / 100) * questionCount);

  const quizXP = Math.max(0, Math.min(questionCount, estimatedCorrect)) * 10;
  const completionXP = lesson.result.score >= 80 ? lesson.xpReward || 0 : 0;
  return quizXP + completionXP;
}

function getDemoCompletionMetadata(lesson) {
  const totalQuestions = getLessonQuestionCount(lesson);
  return {
    correctAnswers: totalQuestions,
    totalQuestions,
    xpEarned: getLessonMaxXP(lesson),
    demoSkipped: true,
  };
}

export default function LessonsPage() {
  const {
    completedLessons,
    hearts,
    user,
    completeLesson,
    addXP,
    addCash,
    earnBadge,
    earnedBadges,
    recordStreak,
    setCurrentModule,
    cash,
  } = useStore();
  const navigate = useNavigate();
  const [showOutOfHearts, setShowOutOfHearts] = useState(false);
  const demoMode = Boolean(user?.demoMode || user?.email === 'demo@stockpilot.app');

  const moduleRows = useMemo(() => {
    return MODULES.map((mod) => {
      const unlocked =
        mod.id === 1 ||
        completedLessons.some(
          (entry) => entry.lessonId === `module-${mod.id - 1}-quiz` && entry.score >= 80
        );

      const lessons = mod.lessons.map((lesson) => {
        const result = completedLessons.find((entry) => entry.lessonId === lesson.id);
        const done = !!result && result.score >= 80;
        const accessible = unlocked && isLessonAccessible(lesson.id, completedLessons);
        return { ...lesson, result, done, accessible };
      });

      const completedCount = lessons.filter((lesson) => lesson.done).length;
      const progress = Math.round((completedCount / lessons.length) * 100);
      const totalXP = lessons.reduce((sum, lesson) => sum + getLessonMaxXP(lesson), 0);
      const earnedXP = lessons.reduce((sum, lesson) => sum + getLessonEarnedXP(lesson), 0);
      const xpProgress = totalXP ? Math.round((earnedXP / totalXP) * 100) : 0;

      return { ...mod, unlocked, lessons, completedCount, progress, totalXP, earnedXP, xpProgress };
    });
  }, [completedLessons]);

  const firstAvailable = moduleRows
    .flatMap((mod) => mod.lessons)
    .find((lesson) => lesson.accessible && !lesson.done);

  const handleLessonClick = (event, lesson = null) => {
    if (hearts === 0 && !lesson?.done) {
      event.preventDefault();
      setShowOutOfHearts(true);
    }
  };

  const handleDemoJumpToModule = (moduleId) => {
    const targetModule = MODULES.find((mod) => mod.id === moduleId);
    if (!targetModule?.lessons?.length) return;

    const lessonsToComplete = MODULES
      .filter((mod) => mod.id < moduleId)
      .flatMap((mod) => mod.lessons);
    const passedBefore = new Set(
      completedLessons.filter((entry) => entry.score >= 80).map((entry) => entry.lessonId)
    );
    const newlyCompletedLessons = lessonsToComplete.filter((lesson) => !passedBefore.has(lesson.id));
    const earnedBadgeIds = new Set(earnedBadges.map((badge) => badge.id));
    let demoUnlockedSoFar = isMarketUnlocked(completedLessons);

    const xpToAdd = newlyCompletedLessons.reduce((sum, lesson) => {
      const existing = completedLessons.find((entry) => entry.lessonId === lesson.id);
      const alreadyEarned = getLessonEarnedXP({ ...lesson, result: existing });
      return sum + Math.max(0, getLessonMaxXP(lesson) - alreadyEarned);
    }, 0);
    let unlockedSoFar = isMarketUnlocked(completedLessons);
    const cashToAdd = newlyCompletedLessons.reduce((sum, lesson) => {
      const reward = getLessonCashReward(lesson, unlockedSoFar);
      if (lesson.id === 'module-1-quiz') {
        unlockedSoFar = true;
      }
      return sum + reward;
    }, 0);

    newlyCompletedLessons.forEach((lesson, index) => {
      const cashEarned = getLessonCashReward(lesson, demoUnlockedSoFar);
      completeLesson(lesson.id, 100, { ...getDemoCompletionMetadata(lesson), cashEarned });
      if (lesson.id === 'module-1-quiz') {
        demoUnlockedSoFar = true;
      }

      if (passedBefore.size === 0 && index === 0 && !earnedBadgeIds.has('first-steps')) {
        const badge = ALL_BADGES.find((entry) => entry.id === 'first-steps');
        if (badge) {
          earnBadge(badge);
          earnedBadgeIds.add(badge.id);
        }
      }

      const moduleMatch = lesson.id.match(/^module-(\d+)-quiz$/);
      if (moduleMatch) {
        const badge = ALL_BADGES.find((entry) => entry.id === `module-${moduleMatch[1]}`);
        if (badge && !earnedBadgeIds.has(badge.id)) {
          earnBadge(badge);
          earnedBadgeIds.add(badge.id);
        }
      }
    });

    if (xpToAdd > 0) addXP(xpToAdd);
    if (cashToAdd > 0) addCash(cashToAdd);
    if (newlyCompletedLessons.length > 0) recordStreak();
    setCurrentModule(moduleId);
    navigate(`/lessons/${targetModule.lessons[0].id}`);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {showOutOfHearts && (
        <OutOfHeartsModal onGoBack={() => setShowOutOfHearts(false)} onGoHome={() => navigate('/')} />
      )}

      <div className="rounded-[2rem] border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-white p-8">
        <div className="inline-flex rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-orange-700 ring-1 ring-orange-100">
          Your path
        </div>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">
          Follow one clear path
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-gray-600">
          Do the next lesson, pass the checkpoint, and unlock what comes after it.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
          <div className="inline-flex rounded-full border border-green-200 bg-green-50 px-3 py-1 font-semibold text-green-700">
            Passed lessons add market cash
          </div>
          <div className="font-semibold text-gray-600">
            Current cash: <span className="text-gray-900">${cash.toFixed(2)}</span>
          </div>
        </div>
        {firstAvailable && (
          <Link
            to={`/lessons/${firstAvailable.id}`}
            onClick={(event) => handleLessonClick(event, firstAvailable)}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
          >
            Start {firstAvailable.title}
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      {demoMode ? (
        <div className="rounded-[1.75rem] border border-orange-200 bg-white p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-orange-700">
                <Sparkles className="h-3.5 w-3.5" />
                Demo shortcuts
              </div>
              <p className="mt-3 text-sm leading-6 text-gray-600">
                Jump to a later module for the demo without clicking through every lesson.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleDemoJumpToModule(1)}
                className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-900 transition hover:bg-gray-100"
              >
                Start at basics
              </button>
              <button
                type="button"
                onClick={() => handleDemoJumpToModule(2)}
                className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-900 transition hover:bg-gray-100"
              >
                Jump to trading
              </button>
              <button
                type="button"
                onClick={() => handleDemoJumpToModule(4)}
                className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-900 transition hover:bg-gray-100"
              >
                Jump to charts
              </button>
              {isMarketUnlocked(completedLessons) ? (
                <button
                  type="button"
                  onClick={() => navigate('/trade')}
                  className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
                >
                  <BarChart3 className="h-4 w-4" />
                  Open market
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <div className="space-y-5">
        {moduleRows.map((mod) => (
          <section key={mod.id} className="rounded-[1.75rem] border border-gray-200 bg-white p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="max-w-2xl">
                <div className="flex items-center gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-bold ${mod.unlocked ? 'bg-orange-50 text-orange-700' : 'bg-gray-100 text-gray-500'}`}>
                    <span>M{mod.id}</span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">
                      Module {mod.id}
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-2xl font-bold text-gray-900">{mod.title}</h2>
                      {demoMode && (
                        <button
                          type="button"
                          onClick={() => handleDemoJumpToModule(mod.id)}
                          className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700 transition hover:bg-orange-100"
                        >
                          <SkipForward className="h-3.5 w-3.5" />
                          Jump here
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-gray-600">{mod.description}</p>
                <p className="mt-2 text-sm leading-6 text-orange-700">{MODULE_EXPLAINERS[mod.id]}</p>
              </div>

              <div className="min-w-[220px] rounded-2xl bg-gray-50 px-4 py-4">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-gray-900">XP in this module</span>
                  <span className="text-xs text-gray-500">
                    {mod.earnedXP}/{mod.totalXP}
                    <span className="ml-2 text-[11px] font-semibold text-orange-700">{mod.xpProgress}%</span>
                  </span>
                </div>
                <div
                  className="mt-3 h-2.5 overflow-hidden rounded-full"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.16)' }}
                  aria-label={`Module ${mod.id} XP ${mod.xpProgress}%`}
                >
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${mod.xpProgress}%`, backgroundColor: 'var(--sq-accent)' }}
                  />
                </div>
                {!mod.unlocked ? <div className="mt-3 text-[11px] text-gray-500">Pass Module {mod.id - 1} quiz with 80% to unlock</div> : null}
              </div>
            </div>

            <div className="mt-8">
              <div className="relative mx-auto max-w-3xl">
                {mod.lessons.length > 1 && (
                  <svg
                    className="pointer-events-none absolute inset-0 z-0 hidden h-full w-full overflow-visible sm:block"
                    viewBox={`0 0 100 ${mod.lessons.length * PATH_STEP_HEIGHT}`}
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path
                      d={buildSmoothPath(
                        mod.lessons.map((_, index) => ({
                          x: PATH_X_POSITIONS[index % PATH_X_POSITIONS.length],
                          y: index * PATH_STEP_HEIGHT + PATH_NODE_OFFSET,
                        }))
                      )}
                      fill="none"
                      stroke="#d1d5db"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                )}
                {mod.lessons.map((lesson, index) => {
                  const laneClass = PATH_LANES[index % PATH_LANES.length];
                  const isNextStep = lesson.accessible && !lesson.done;
                  const statusTone = lesson.done
                    ? 'border-green-200 bg-green-50/70'
                    : lesson.accessible
                    ? 'border-orange-200 bg-orange-50/60'
                    : 'border-gray-200 bg-gray-50';
                  const buttonTone = lesson.done
                    ? 'border border-gray-300 bg-white text-gray-800 hover:bg-gray-50'
                    : 'bg-orange-500 text-white hover:bg-orange-600';

                  return (
                    <div key={lesson.id} className="relative z-10 grid h-[250px] grid-cols-1 sm:grid-cols-3">
                      <div className={`relative col-start-1 w-full max-w-[16.5rem] justify-self-center ${laneClass}`}>
                        <div className="relative z-10 flex justify-center">
                          {lesson.accessible ? (
                            <Link
                              to={`/lessons/${lesson.id}`}
                              onClick={(event) => handleLessonClick(event, lesson)}
                              className={`flex h-16 w-16 items-center justify-center rounded-full border-4 transition-transform hover:-translate-y-1 ${
                                lesson.done
                                  ? 'border-green-200 bg-green-500 text-white'
                                  : 'border-orange-200 bg-orange-500 text-white'
                              }`}
                              title={lesson.done ? 'Review lesson' : 'Start lesson'}
                            >
                              {lesson.done ? (
                                <CheckCircle2 className="h-7 w-7" />
                              ) : (
                                <PlayCircle className="h-7 w-7" />
                              )}
                            </Link>
                          ) : (
                            <div
                              className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-gray-200 bg-gray-100 text-gray-400"
                              title="Not ready yet"
                            >
                              <Lock className="h-6 w-6" />
                            </div>
                          )}
                        </div>

                        <div className={`mt-3 rounded-2xl border px-4 py-4 text-center ${statusTone}`}>
                          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                            {lesson.type === 'quiz' ? 'Checkpoint' : `Lesson ${index + 1}`}
                          </div>
                          <h3 className="mt-1 text-lg font-semibold text-gray-900">{lesson.title}</h3>
                          <div className="mt-2 text-sm leading-6 text-gray-500">
                            {lesson.done && lesson.result ? `Passed with ${lesson.result.score}%` : null}
                            {!lesson.done && isNextStep ? 'This is your next lesson.' : null}
                            {!lesson.accessible && mod.unlocked ? 'Finish the lessons before this one first.' : null}
                            {!mod.unlocked ? `Locked until Module ${mod.id - 1} is passed.` : null}
                          </div>
                          <div className="mt-2 text-xs font-semibold text-green-700">
                            Pass reward: +${getLessonCashReward(lesson, isMarketUnlocked(completedLessons))} cash
                          </div>

                          <div className="mt-4">
                            {lesson.accessible ? (
                              <Link
                                to={`/lessons/${lesson.id}`}
                                onClick={(event) => handleLessonClick(event, lesson)}
                                className={`inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold ${buttonTone}`}
                              >
                                {lesson.done ? 'Review lesson' : 'Start now'}
                              </Link>
                            ) : (
                              <div className="text-xs font-medium text-gray-400">Not ready yet</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
