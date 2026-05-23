import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { getLessonById, ALL_BADGES, isLessonAccessible, MODULES, getLessonCashReward } from '../data/lessons';
import { HeartsDisplay } from '../components/Gamification';
import {
  CorrectAnswerFeedback,
  WrongAnswerFeedback,
  LessonCompleteModal,
  LessonFailedModal,
  BadgeUnlockModal,
  HeartLostAnimation,
  OutOfHeartsModal,
} from '../components/Feedback';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronRight, Lock } from 'lucide-react';
import { isMarketUnlocked } from '../lib/progression';

function stripEmoji(value = '') {
  return value
    .replace(/\p{Extended_Pictographic}/gu, '')
    .replace(/[\uFE0F\u200D]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export default function LessonScreen() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const {
    hearts, loseHeart, addXP, addCash, completeLesson, completedLessons,
    earnBadge, earnedBadges, recordStreak, hasHearts, reviewHeartRewardsClaimed, claimReviewHeartReward,
  } = useStore();

  const lesson = getLessonById(lessonId);
  const completedEntry = completedLessons.find((entry) => entry.lessonId === lessonId && entry.score >= 80);
  const reviewMode = Boolean(completedEntry);
  const marketUnlocked = isMarketUnlocked(completedLessons);
  const visibleLessonCashReward = getLessonCashReward(lesson, marketUnlocked);
  const passedLessonIds = new Set(
    completedLessons.filter((entry) => entry.score >= 80).map((entry) => entry.lessonId)
  );
  const currentModule = MODULES.find((module) =>
    module.lessons.some((moduleLesson) => !passedLessonIds.has(moduleLesson.id))
  ) || MODULES[MODULES.length - 1];
  const eligibleForReviewHeart =
    reviewMode &&
    lesson?.moduleId < currentModule.id &&
    !reviewHeartRewardsClaimed.includes(lesson.id) &&
    hearts < 5;
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showCorrect, setShowCorrect] = useState(false);
  const [showWrong, setShowWrong] = useState(false);
  const [wrongExplanation, setWrongExplanation] = useState('');
  const [showComplete, setShowComplete] = useState(false);
  const [showBadge, setShowBadge] = useState(null);
  const [showHeartLoss, setShowHeartLoss] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [answered, setAnswered] = useState(false);

  if (!lesson) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Lesson not found</h2>
        <button onClick={() => navigate('/lessons')} className="btn-primary mt-4">
          Back to Lessons
        </button>
      </div>
    );
  }

  // Block access to lessons that haven't been unlocked yet
  if (!isLessonAccessible(lessonId, completedLessons)) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
          <Lock className="h-8 w-8 text-gray-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Lesson Locked</h2>
        <p className="text-gray-500 text-sm mb-6">Complete the previous lessons first to unlock this one.</p>
        <button onClick={() => navigate('/lessons')} className="btn-primary mt-4">
          Back to Lessons
        </button>
      </div>
    );
  }

  const step = lesson.content[stepIndex];
  const progress = ((stepIndex + 1) / lesson.content.length) * 100;

  const handleAnswer = useCallback(
    (optionIndex) => {
      if (answered) return;
      setSelectedAnswer(optionIndex);
      setAnswered(true);

      if (step.type === 'quiz') {
        setTotalQuestions((p) => p + 1);
        if (optionIndex === step.correctIndex) {
          setCorrectCount((p) => p + 1);
          setShowCorrect(true);
          if (!reviewMode) addXP(10);
          setTimeout(() => setShowCorrect(false), 1500);
        } else {
          setShowWrong(true);
          setWrongExplanation(stripEmoji(step.explanation || ''));
          const wasLastHeart = hearts === 1 && !reviewMode;
          if (!reviewMode) {
            loseHeart();
            setShowHeartLoss(true);
          }
          setTimeout(() => {
            setShowWrong(false);
            if (!reviewMode) setShowHeartLoss(false);
            if (wasLastHeart) {
              setShowOutOfHearts(true);
            }
          }, 2000);
        }
      }
    },
    [answered, step, addXP, loseHeart, hearts, reviewMode]
  );

  const handleNext = useCallback(() => {
    // Block finishing when out of hearts
    if (!hasHearts() && !reviewMode) return;
    if (stepIndex < lesson.content.length - 1) {
      setStepIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setAnswered(false);
      setShowCorrect(false);
      setShowWrong(false);
    } else {
      if (reviewMode) {
        if (eligibleForReviewHeart) {
          claimReviewHeartReward(lesson.id);
        }
        navigate('/lessons');
        return;
      }

      // Lesson complete
      const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 100;
      const passed = score >= 80;
      const quizXP = correctCount * 10;
      const completionXP = passed ? lesson.xpReward : 0;
      const lessonCashReward = passed ? getLessonCashReward(lesson, marketUnlocked) : 0;
      completeLesson(lesson.id, score, {
        correctAnswers: correctCount,
        totalQuestions,
        xpEarned: quizXP + completionXP,
        cashEarned: lessonCashReward,
      });

      if (passed) {
        addXP(lesson.xpReward);
        addCash(lessonCashReward);
        recordStreak();

        // Check for badge awards
        const lessonsNow = [...completedLessons, { lessonId: lesson.id }];
        if (lessonsNow.length === 1) {
          const badge = ALL_BADGES.find((b) => b.id === 'first-steps');
          if (badge && !earnedBadges.find((b) => b.id === badge.id)) {
            earnBadge(badge);
            setShowBadge(badge);
          }
        }

        // Check module completion badges
        const moduleMatch = lesson.id.match(/^module-(\d+)-quiz$/);
        if (moduleMatch) {
          const modNum = parseInt(moduleMatch[1], 10);
          const badge = ALL_BADGES.find((b) => b.id === `module-${modNum}`);
          if (badge && !earnedBadges.find((b) => b.id === badge.id)) {
            earnBadge(badge);
            setShowBadge(badge);
          }
        }
      }

      if (!showBadge) setShowComplete(true);
    }
  }, [
    stepIndex, lesson, totalQuestions, correctCount, completeLesson,
    addXP, addCash, recordStreak, completedLessons, earnBadge, earnedBadges, showBadge, hasHearts,
    reviewMode, navigate, eligibleForReviewHeart, claimReviewHeartReward,
    marketUnlocked,
  ]);

  const noHearts = !hasHearts();
  const [showOutOfHearts, setShowOutOfHearts] = useState(false);

  // Show blocking modal when hearts hit 0 during a lesson
  useEffect(() => {
    if (!reviewMode && noHearts && step?.type === 'quiz' && !answered) {
      setShowOutOfHearts(true);
    }
  }, [noHearts, step?.type, answered, reviewMode]);

  const handleRetryLesson = useCallback(() => {
    setShowComplete(false);
    setStepIndex(0);
    setSelectedAnswer(null);
    setShowCorrect(false);
    setShowWrong(false);
    setWrongExplanation('');
    setShowHeartLoss(false);
    setCorrectCount(0);
    setTotalQuestions(0);
    setAnswered(false);
  }, []);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Out of hearts â€” blocks lesson */}
      <AnimatePresence>
        {showOutOfHearts && noHearts && !reviewMode && (
          <OutOfHeartsModal
            onGoBack={() => navigate('/lessons')}
            onGoHome={() => navigate('/')}
          />
        )}
      </AnimatePresence>

      {/* Top bar */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/lessons')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>

        {/* Progress bar */}
        <div
          className="flex-1 h-3 overflow-hidden rounded-full border"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.16)', borderColor: 'var(--sq-border)' }}
          aria-label={`Lesson progress ${Math.round(progress)}%`}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: 'var(--sq-accent)' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <HeartsDisplay hearts={hearts} />
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={stepIndex}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25 }}
          className="card mb-6"
        >
          {step.type === 'info' ? (
            <div>
              <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed text-base">
                {stripEmoji(step.text).split('**').map((part, i) =>
                  i % 2 === 1 ? (
                    <strong key={i} className="text-gray-900 font-semibold">
                      {part}
                    </strong>
                  ) : (
                    <span key={i}>{part}</span>
                  )
                )}
              </div>
              <button
                onClick={handleNext}
                className="btn-primary mt-6 w-full flex items-center justify-center gap-2"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          ) : step.type === 'quiz' ? (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-6">{stripEmoji(step.question)}</h3>
              <div className="space-y-3">
                {step.options.map((option, i) => {
                  let optionStyle = 'border-gray-200 hover:border-green-300 hover:bg-green-50';
                  if (answered) {
                    if (i === step.correctIndex) {
                      optionStyle = 'border-green-500 bg-green-50 text-green-700';
                    } else if (i === selectedAnswer && i !== step.correctIndex) {
                      optionStyle = 'border-red-500 bg-red-50 text-red-700';
                    } else {
                      optionStyle = 'border-gray-200 opacity-50';
                    }
                  } else if (i === selectedAnswer) {
                    optionStyle = 'border-green-500 bg-green-50';
                  }

                  return (
                    <motion.button
                      key={i}
                      whileHover={!answered ? { scale: 1.01 } : {}}
                      whileTap={!answered ? { scale: 0.99 } : {}}
                      onClick={() => (noHearts && !reviewMode ? null : handleAnswer(i))}
                      disabled={answered || (noHearts && !reviewMode)}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-colors font-medium ${noHearts && !answered && !reviewMode ? 'opacity-50 cursor-not-allowed' : ''} ${optionStyle}`}
                    >
                      <span className="text-sm">{stripEmoji(option)}</span>
                    </motion.button>
                  );
                })}
              </div>

              {answered && (!noHearts || reviewMode) && (
                <button
                  onClick={handleNext}
                  className="btn-primary mt-6 w-full flex items-center justify-center gap-2"
                >
                  {stepIndex < lesson.content.length - 1
                    ? 'Continue'
                    : reviewMode
                    ? eligibleForReviewHeart
                      ? 'Finish Review +1 Heart'
                      : 'Finish Review'
                    : 'Finish Lesson'}{' '}
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : null}
        </motion.div>
      </AnimatePresence>

      {/* Feedback overlays */}
      <CorrectAnswerFeedback visible={showCorrect} />
      <WrongAnswerFeedback visible={showWrong} explanation={wrongExplanation} />
      {showHeartLoss && <HeartLostAnimation />}

      {/* Completion modals */}
      {showComplete && (() => {
        const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 100;
        const passed = score >= 80;
        if (!passed) {
          return (
            <LessonFailedModal
              score={score}
              onRetry={handleRetryLesson}
              onBack={() => navigate('/lessons')}
            />
          );
        }
        return (
          <LessonCompleteModal
            xpEarned={completedEntry?.xpEarned || lesson.xpReward}
            cashEarned={completedEntry?.cashEarned || visibleLessonCashReward}
            onContinue={() => navigate('/lessons')}
          />
        );
      })()}

      <AnimatePresence>
        {showBadge && (
          <BadgeUnlockModal
            badge={showBadge}
            onClose={() => {
              setShowBadge(null);
              setShowComplete(true);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}


