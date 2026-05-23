import { useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { getChallengeById, getNextChallengeId, MARKET_CHALLENGES } from '../data/challenges';
import { ChevronRight, ShieldAlert, Sparkles, Target } from 'lucide-react';

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
  } = useStore();

  const resolvedChallengeId = challengeId || currentChallengeId || MARKET_CHALLENGES[0]?.id;
  const challenge = getChallengeById(resolvedChallengeId);
  const existingResponse = challengeResponses.find((response) => response.challengeId === resolvedChallengeId);

  const [selectedChoiceId, setSelectedChoiceId] = useState(existingResponse?.choiceId || '');
  const [selectedReasonId, setSelectedReasonId] = useState(existingResponse?.reasonId || '');
  const [showResult, setShowResult] = useState(Boolean(existingResponse));

  if (!challenge) return <Navigate to="/" replace />;

  const selectedChoice = challenge.choices.find((choice) => choice.id === selectedChoiceId) || null;
  const selectedReason = challenge.reasonOptions.find((reason) => reason.id === selectedReasonId) || null;

  const result = useMemo(() => {
    if (!selectedChoice || !selectedReason) return null;

    const riskScore = clampScore(selectedChoice.riskScore + (selectedReason.riskDelta || 0));
    const decisionScore = clampScore(selectedChoice.decisionScore + (selectedReason.decisionDelta || 0));
    const xpEarned = Math.round(challenge.xpReward * (0.6 + decisionScore / 250));

    return {
      riskScore,
      decisionScore,
      xpEarned,
      coachFeedback: `${selectedChoice.coachFeedback} ${selectedReason.coachNote}`,
      consequenceSummary: selectedChoice.consequenceSummary,
    };
  }, [challenge.xpReward, selectedChoice, selectedReason]);

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
  };

  const nextChallengeId = getNextChallengeId(resolvedChallengeId);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="rounded-[2rem] border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-white p-8">
        <div className="inline-flex rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-orange-700 ring-1 ring-orange-100">
          Market Challenge
        </div>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">
          Can you stay calm when the fake market gets loud?
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-gray-600">
          Practice money decisions safely. Spot hype, manage risk, and learn from consequences with no real money.
        </p>
      </div>

      <div className="rounded-[1.75rem] border border-gray-200 bg-white p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-700">
              {challenge.company} · {challenge.ticker}
            </div>
            <h2 className="mt-2 text-2xl font-bold text-gray-900">{challenge.title}</h2>
          </div>
          <div className="rounded-2xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
            Related lesson: <span className="font-semibold text-gray-900">{challenge.relatedLessonId}</span>
          </div>
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-orange-200 bg-orange-50 p-5">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-orange-700">
            <ShieldAlert className="h-4 w-4" />
            Step 1: Fake news
          </div>
          <p className="mt-3 text-lg font-semibold text-gray-900">{challenge.fakeNews}</p>
          <p className="mt-3 text-sm leading-6 text-gray-700">{challenge.context}</p>
        </div>
      </div>

      {!showResult && (
        <>
          <div className="rounded-[1.75rem] border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-orange-700">
              <Target className="h-4 w-4" />
              Step 2: Pick your move
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {challenge.choices.map((choice) => (
                <button
                  key={choice.id}
                  onClick={() => setSelectedChoiceId(choice.id)}
                  className={`rounded-2xl border p-4 text-left transition ${
                    selectedChoiceId === choice.id
                      ? 'border-orange-300 bg-orange-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold text-gray-900">{choice.label}</div>
                  <div className="mt-2 text-sm text-gray-500">{choice.coachFeedback}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-orange-700">
              <Sparkles className="h-4 w-4" />
              Step 3: Why did you choose that?
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              {challenge.reasonOptions.map((reason) => (
                <button
                  key={reason.id}
                  onClick={() => setSelectedReasonId(reason.id)}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                    selectedReasonId === reason.id
                      ? 'border-orange-300 bg-orange-50 text-orange-700'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {reason.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleRevealResult}
              disabled={!selectedChoiceId || !selectedReasonId}
              className="btn-primary mt-6 inline-flex items-center gap-2"
            >
              Reveal consequence
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </>
      )}

      {showResult && result && (
        <div className="rounded-[1.75rem] border border-gray-200 bg-white p-6">
          <div className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-700">Step 4: Result</div>
          <h3 className="mt-3 text-2xl font-bold text-gray-900">What happened</h3>
          <p className="mt-3 text-sm leading-6 text-gray-700">{result.consequenceSummary}</p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-orange-50 px-4 py-4">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">Risk score</div>
              <div className="mt-2 text-3xl font-bold text-gray-900">{result.riskScore}</div>
              <div className="mt-1 text-sm text-gray-600">Lower is safer.</div>
            </div>
            <div className="rounded-2xl bg-green-50 px-4 py-4">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-green-700">Decision score</div>
              <div className="mt-2 text-3xl font-bold text-gray-900">{result.decisionScore}</div>
              <div className="mt-1 text-sm text-gray-600">Higher means stronger reasoning.</div>
            </div>
            <div className="rounded-2xl bg-gray-50 px-4 py-4">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">XP earned</div>
              <div className="mt-2 text-3xl font-bold text-gray-900">+{result.xpEarned}</div>
              <div className="mt-1 text-sm text-gray-600">Reasoning matters more than hype.</div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 px-5 py-4">
            <div className="text-sm font-semibold text-gray-900">Coach feedback</div>
            <div className="mt-2 text-sm leading-6 text-gray-700">{result.coachFeedback}</div>
          </div>

          <div className="mt-6 flex flex-wrap gap-4">
            <Link to={`/lessons/${challenge.relatedLessonId}`} className="rounded-2xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50">
              Open related lesson
            </Link>
            <button
              onClick={() => navigate(`/challenge/${nextChallengeId}`)}
              className="rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-600"
            >
              Next challenge
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
