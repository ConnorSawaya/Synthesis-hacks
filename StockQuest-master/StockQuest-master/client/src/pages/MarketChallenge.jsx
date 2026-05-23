import { useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { getChallengeById, getNextChallengeId, MARKET_CHALLENGES } from '../data/challenges';
import { getLessonById } from '../data/lessons';
import {
  CheckCircle2,
  ChevronRight,
  Flame,
  Heart,
  Info,
  XCircle,
} from 'lucide-react';

function clampScore(value) {
  return Math.max(0, Math.min(100, value));
}

export default function MarketChallenge() {
  const { challengeId } = useParams();
  const navigate = useNavigate();
  const {
    currentChallengeId,
    setCurrentChallenge,
    completeChallenge,
    challengeResponses,
    hearts,
    streakCount,
  } = useStore();

  const resolvedChallengeId = challengeId || currentChallengeId || MARKET_CHALLENGES[0]?.id;
  const challenge = getChallengeById(resolvedChallengeId);
  const existingResponse = challengeResponses.find((response) => response.challengeId === resolvedChallengeId);

  const [selectedChoiceId, setSelectedChoiceId] = useState(existingResponse?.choiceId || '');
  const [selectedReasonId, setSelectedReasonId] = useState(existingResponse?.reasonId || '');
  const [stage, setStage] = useState(existingResponse ? 2 : 0);
  const [showResult, setShowResult] = useState(Boolean(existingResponse));

  if (!challenge) return <Navigate to="/" replace />;

  const selectedChoice = challenge.choices.find((choice) => choice.id === selectedChoiceId) || null;
  const selectedReason = challenge.reasonOptions.find((reason) => reason.id === selectedReasonId) || null;
  const bestChoice = [...challenge.choices].sort((a, b) => b.decisionScore - a.decisionScore)[0];
  const bestReason = [...challenge.reasonOptions].sort(
    (a, b) => (b.decisionDelta || 0) - (a.decisionDelta || 0)
  )[0];

  const result = useMemo(() => {
    if (!selectedChoice || !selectedReason) return null;

    const riskScore = clampScore(selectedChoice.riskScore + (selectedReason.riskDelta || 0));
    const decisionScore = clampScore(
      selectedChoice.decisionScore + (selectedReason.decisionDelta || 0)
    );
    const xpEarned = Math.round(challenge.xpReward * (0.6 + decisionScore / 250));

    return {
      riskScore,
      decisionScore,
      xpEarned,
      coachFeedback: `${selectedChoice.coachFeedback} ${selectedReason.coachNote}`,
      consequenceSummary: selectedChoice.consequenceSummary,
    };
  }, [challenge.xpReward, selectedChoice, selectedReason]);

  const actionFeedback = selectedChoice
    ? {
        correct: selectedChoice.id === bestChoice.id,
        title: selectedChoice.id === bestChoice.id ? 'Strong' : 'Risky',
        text: selectedChoice.coachFeedback,
      }
    : null;

  const reasonFeedback = selectedReason
    ? {
        correct: selectedReason.id === bestReason.id,
        title: selectedReason.id === bestReason.id ? 'Strong' : 'Weak',
        text: selectedReason.coachNote,
      }
    : null;

  const handleRevealResult = () => {
    if (!result || !selectedChoice || !selectedReason) return;

    setCurrentChallenge(resolvedChallengeId);
    completeChallenge(resolvedChallengeId, {
      choiceId: selectedChoice.id,
      reasonId: selectedReason.id,
      riskScore: result.riskScore,
      decisionScore: result.decisionScore,
      xpEarned: result.xpEarned,
    });
    setShowResult(true);
    setStage(2);
  };

  const handleContinue = () => {
    if (stage === 0 && selectedChoice) {
      setStage(1);
      return;
    }
    if (stage === 1 && selectedReason) {
      handleRevealResult();
    }
  };

  const nextChallengeId = getNextChallengeId(resolvedChallengeId);
  const relatedLesson = getLessonById(challenge.relatedLessonId);
  const progressSegments = [0, 1, 2];
  const mascotLabel = challenge.company
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  const getChoiceClasses = (isCorrect, isSelected, locked) => {
    if (!locked) return 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-slate-300';
    if (isCorrect) return 'border-[#00c896] bg-[#E9FBF5] text-slate-900';
    if (isSelected) return 'border-[#E24B4A] bg-[#FDEEEE] text-slate-900';
    return 'border-slate-200 bg-slate-50 opacity-55';
  };

  const renderActionStage = () => (
    <>
      <h2 className="text-[19px] font-medium leading-7 text-slate-900">
        What is the smartest move when{' '}
        <span className="underline decoration-[#378ADD] decoration-2 underline-offset-4">
          {challenge.term}
        </span>{' '}
        is this loud?
      </h2>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {challenge.choices.map((choice) => {
          const isSelected = selectedChoiceId === choice.id;
          const isCorrect = choice.id === bestChoice.id;
          const locked = Boolean(selectedChoiceId);

          return (
            <button
              key={choice.id}
              onClick={() => !locked && setSelectedChoiceId(choice.id)}
              disabled={locked}
              className={`rounded-xl border px-4 py-4 text-left transition-all duration-150 ${getChoiceClasses(
                isCorrect,
                isSelected,
                locked
              )}`}
              style={{ borderWidth: '0.5px' }}
            >
              <div className="text-[19px] font-semibold text-slate-900">{choice.amount}</div>
              <div className="mt-1 text-[15px] font-medium text-slate-800">{choice.label}</div>
              <div className="mt-1 text-sm text-slate-500">{choice.subLabel}</div>
            </button>
          );
        })}
      </div>

      {actionFeedback && (
        <div
          className={`mt-4 flex items-start gap-3 rounded-xl px-4 py-3 text-sm ${
            actionFeedback.correct ? 'bg-[#E9FBF5] text-[#066B58]' : 'bg-[#FDEEEE] text-[#A73736]'
          }`}
          style={{
            borderWidth: '0.5px',
            borderStyle: 'solid',
            borderColor: actionFeedback.correct ? '#00c896' : '#E24B4A',
          }}
        >
          {actionFeedback.correct ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
          ) : (
            <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          )}
          <div>
            <div className="font-semibold">{actionFeedback.title}</div>
            <div className="mt-0.5 leading-6">{actionFeedback.text}</div>
          </div>
        </div>
      )}
    </>
  );

  const renderReasonStage = () => (
    <>
      <h2 className="text-[19px] font-medium leading-7 text-slate-900">
        Which reason shows the best{' '}
        <span className="underline decoration-[#378ADD] decoration-2 underline-offset-4">
          risk thinking
        </span>
        ?
      </h2>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {challenge.reasonOptions.map((reason, index) => {
          const isSelected = selectedReasonId === reason.id;
          const isCorrect = reason.id === bestReason.id;
          const locked = Boolean(selectedReasonId);
          const cueAmounts = ['+$10', '+$15', '+$0', '+$0'];

          return (
            <button
              key={reason.id}
              onClick={() => !locked && setSelectedReasonId(reason.id)}
              disabled={locked}
              className={`rounded-xl border px-4 py-4 text-left transition-all duration-150 ${getChoiceClasses(
                isCorrect,
                isSelected,
                locked
              )}`}
              style={{ borderWidth: '0.5px' }}
            >
              <div className="text-[19px] font-semibold text-slate-900">
                {cueAmounts[index] || '+$0'}
              </div>
              <div className="mt-1 text-[15px] font-medium text-slate-800">{reason.label}</div>
              <div className="mt-1 text-sm text-slate-500">Why this feels right</div>
            </button>
          );
        })}
      </div>

      {reasonFeedback && (
        <div
          className={`mt-4 flex items-start gap-3 rounded-xl px-4 py-3 text-sm ${
            reasonFeedback.correct ? 'bg-[#E9FBF5] text-[#066B58]' : 'bg-[#FDEEEE] text-[#A73736]'
          }`}
          style={{
            borderWidth: '0.5px',
            borderStyle: 'solid',
            borderColor: reasonFeedback.correct ? '#00c896' : '#E24B4A',
          }}
        >
          {reasonFeedback.correct ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
          ) : (
            <XCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          )}
          <div>
            <div className="font-semibold">{reasonFeedback.title}</div>
            <div className="mt-0.5 leading-6">{reasonFeedback.text}</div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="mx-auto max-w-4xl rounded-xl bg-[#F8FBFC] p-4 text-slate-900 md:p-6">
      <div
        className="mb-4 flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"
        style={{ borderWidth: '0.5px' }}
      >
        <div className="flex-1">
          <div className="mb-2 flex gap-1">
            {progressSegments.map((segment) => (
              <div key={segment} className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full transition-all duration-200"
                  style={{
                    width: stage >= segment ? '100%' : '0%',
                    backgroundColor: '#00c896',
                  }}
                />
              </div>
            ))}
          </div>
          <div className="flex gap-1.5">
            {progressSegments.map((segment) => (
              <span
                key={segment}
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: stage >= segment ? '#378ADD' : '#D7DEE7' }}
              />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1 text-slate-600">
            <Flame className="h-4 w-4 text-[#378ADD]" />
            <span className="font-medium">{streakCount}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-600">
            <Heart className="h-4 w-4 text-[#E24B4A]" fill="currentColor" />
            <span className="font-medium">{hearts}</span>
          </div>
        </div>
      </div>

      <div
        className="rounded-xl border border-slate-200 bg-white px-4 py-4"
        style={{ borderWidth: '0.5px' }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#ECF5FF] text-sm font-bold text-[#378ADD]">
            {mascotLabel}
          </div>
          <div className="min-w-0 flex-1 text-[15px] leading-6 text-slate-700">
            <span className="font-medium">{challenge.fakeNews}</span> {challenge.context}
          </div>
          <div
            className="flex-shrink-0 rounded-full border border-slate-200 px-3 py-1.5 text-right text-sm"
            style={{ borderWidth: '0.5px' }}
          >
            <div className="font-medium text-slate-900">{challenge.ticker}</div>
            <div
              className={String(challenge.tickerChange).startsWith('-') ? 'text-[#E24B4A]' : 'text-[#00c896]'}
            >
              {challenge.tickerChange}
            </div>
          </div>
        </div>
      </div>

      {!showResult ? (
        <div
          className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-5"
          style={{ borderWidth: '0.5px' }}
        >
          {stage === 0 ? renderActionStage() : renderReasonStage()}
        </div>
      ) : (
        <div
          className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-5"
          style={{ borderWidth: '0.5px' }}
        >
          <h2 className="text-[19px] font-medium text-slate-900">Result</h2>
          <p className="mt-3 text-[15px] leading-6 text-slate-700">{result?.consequenceSummary}</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <div
              className="rounded-xl border border-slate-200 bg-[#F8FBFC] px-4 py-3"
              style={{ borderWidth: '0.5px' }}
            >
              <div className="text-sm font-medium text-slate-500">Risk</div>
              <div className="mt-1 text-[19px] font-semibold text-slate-900">{result?.riskScore}</div>
            </div>
            <div
              className="rounded-xl border border-slate-200 bg-[#F8FBFC] px-4 py-3"
              style={{ borderWidth: '0.5px' }}
            >
              <div className="text-sm font-medium text-slate-500">Decision</div>
              <div className="mt-1 text-[19px] font-semibold text-slate-900">{result?.decisionScore}</div>
            </div>
            <div
              className="rounded-xl border border-slate-200 bg-[#F8FBFC] px-4 py-3"
              style={{ borderWidth: '0.5px' }}
            >
              <div className="text-sm font-medium text-slate-500">XP</div>
              <div className="mt-1 text-[19px] font-semibold text-slate-900">+{result?.xpEarned}</div>
            </div>
          </div>
          <div
            className="mt-4 rounded-xl border border-[#00c896] bg-[#E9FBF5] px-4 py-3 text-sm text-[#066B58]"
            style={{ borderWidth: '0.5px' }}
          >
            <div className="flex items-start gap-3">
              <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <div>
                <div className="font-semibold">Coach</div>
                <div className="mt-0.5 leading-6">{result?.coachFeedback}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3"
        style={{ borderWidth: '0.5px' }}
      >
        <div className="text-sm text-slate-500">
          {showResult ? (
            <Link
              to={`/lessons/${challenge.relatedLessonId}`}
              className="font-medium text-[#378ADD] hover:underline"
            >
              Related lesson: {relatedLesson?.title || challenge.relatedLessonId}
            </Link>
          ) : (
            <span>
              {challenge.title} - Step {stage + 1} of 3
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => (showResult ? navigate(`/challenge/${nextChallengeId}`) : navigate('/lessons'))}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
            style={{ borderWidth: '0.5px' }}
          >
            {showResult ? 'Next challenge' : 'Back to lessons'}
          </button>
          {!showResult ? (
            <button
              onClick={handleContinue}
              disabled={(stage === 0 && !selectedChoiceId) || (stage === 1 && !selectedReasonId)}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundColor: '#00c896' }}
            >
              Continue
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={() => navigate(`/challenge/${nextChallengeId}`)}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white"
              style={{ backgroundColor: '#00c896' }}
            >
              Continue
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}



