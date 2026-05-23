import { Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { MODULES, isLessonAccessible } from '../data/lessons';
import { OutOfHeartsModal } from '../components/Feedback';
import { CheckCircle2, ChevronRight, Lock, PlayCircle } from 'lucide-react';
import { useMemo, useState } from 'react';

const MODULE_EXPLAINERS = {
  1: 'You are building the language of investing so later choices make sense.',
  2: 'This module turns vocabulary into action with your first trade decisions.',
  3: 'You start learning how to think before you click buy or sell.',
  4: 'Charts help you notice trends instead of guessing.',
  5: 'Advanced ideas are optional once your foundation is solid.',
};

export default function LessonsPage() {
  const { completedLessons, hearts } = useStore();
  const navigate = useNavigate();
  const [showOutOfHearts, setShowOutOfHearts] = useState(false);

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

      return { ...mod, unlocked, lessons, completedCount, progress };
    });
  }, [completedLessons]);

  const firstAvailable = moduleRows
    .flatMap((mod) => mod.lessons)
    .find((lesson) => lesson.accessible && !lesson.done);

  const handleLessonClick = (event) => {
    if (hearts === 0) {
      event.preventDefault();
      setShowOutOfHearts(true);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {showOutOfHearts && (
        <OutOfHeartsModal onGoBack={() => setShowOutOfHearts(false)} onGoHome={() => navigate('/')} />
      )}

      <div className="rounded-[2rem] border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-white p-8">
        <div className="inline-flex rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-orange-700 ring-1 ring-orange-100">
          Next step
        </div>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">
          Follow one clear learning path
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-gray-600">
          Start with the next available lesson, pass the checkpoint, and unlock the lesson after that.
        </p>
        {firstAvailable && (
          <Link
            to={`/lessons/${firstAvailable.id}`}
            onClick={handleLessonClick}
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
          >
            Start {firstAvailable.title}
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      <div className="space-y-5">
        {moduleRows.map((mod) => (
          <section key={mod.id} className="rounded-[1.75rem] border border-gray-200 bg-white p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="max-w-2xl">
                <div className="flex items-center gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl ${mod.unlocked ? 'bg-orange-50' : 'bg-gray-100'}`}>
                    <span>{mod.icon}</span>
                  </div>
                  <div>
                    <div className="text-sm font-semibold uppercase tracking-[0.18em] text-gray-500">
                      Module {mod.id}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">{mod.title}</h2>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-gray-600">{mod.description}</p>
                <p className="mt-2 text-sm leading-6 text-orange-700">{MODULE_EXPLAINERS[mod.id]}</p>
              </div>

              <div className="min-w-[220px] rounded-2xl bg-gray-50 px-4 py-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-gray-900">Progress</span>
                  <span className="text-gray-500">{mod.progress}%</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200">
                  <div className="h-full rounded-full bg-orange-500" style={{ width: `${mod.progress}%` }} />
                </div>
                <div className="mt-3 text-xs text-gray-500">
                  {mod.unlocked
                    ? `${mod.completedCount} of ${mod.lessons.length} lessons passed`
                    : `Pass Module ${mod.id - 1} quiz with 80% to unlock`}
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {mod.lessons.map((lesson, index) => (
                <div
                  key={lesson.id}
                  className={`rounded-2xl border px-4 py-4 ${
                    lesson.done
                      ? 'border-green-200 bg-green-50/60'
                      : lesson.accessible
                      ? 'border-orange-200 bg-white'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div className="min-w-0">
                      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                        {lesson.type === 'quiz' ? 'Checkpoint' : `Lesson ${index + 1}`}
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        {lesson.done ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : lesson.accessible ? (
                          <PlayCircle className="h-5 w-5 text-orange-500" />
                        ) : (
                          <Lock className="h-5 w-5 text-gray-400" />
                        )}
                        <h3 className="text-lg font-semibold text-gray-900">{lesson.title}</h3>
                      </div>
                      <div className="mt-2 text-sm text-gray-500">
                        {lesson.done && lesson.result ? `Passed with ${lesson.result.score}%` : null}
                        {!lesson.done && lesson.accessible ? 'This is available now and is the right next step in your path.' : null}
                        {!lesson.accessible && mod.unlocked ? 'Complete the earlier lessons in order to open this one.' : null}
                        {!mod.unlocked ? `Locked until Module ${mod.id - 1} is passed.` : null}
                      </div>
                    </div>

                    {lesson.accessible ? (
                      <Link
                        to={`/lessons/${lesson.id}`}
                        onClick={handleLessonClick}
                        className={`inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold ${
                          lesson.done
                            ? 'border border-gray-300 bg-white text-gray-800 hover:bg-gray-50'
                            : 'bg-orange-500 text-white hover:bg-orange-600'
                        }`}
                      >
                        {lesson.done ? 'Review lesson' : 'Start now'}
                      </Link>
                    ) : (
                      <div className="text-xs font-medium text-gray-400">Not ready yet</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
