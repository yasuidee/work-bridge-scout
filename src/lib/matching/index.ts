// =============================================================================
// マッチングエンジン公開 API（UI はここだけを参照する）
// =============================================================================
import type { Candidate, MatchResult, Persona } from "../types";
import { explainMatch } from "./explainMatch";
import { rankFromScore } from "./rank";
import {
  aggregateBase,
  computeAdjust,
  hardFilter,
  subScores,
} from "./scoreCandidate";

export { SCORING_REFERENCE_DATE } from "./scoreCandidate";
export { rankFromScore } from "./rank";
export type { MatchExplanation } from "./explainMatch";

/** 1 候補者 × 1 ペルソナ → MatchResult（決定論的） */
export function matchCandidate(persona: Persona, c: Candidate): MatchResult {
  const hard = hardFilter(persona, c);
  const breakdown = subScores(persona, c);
  const adjust = computeAdjust(c);
  const base = aggregateBase(breakdown, persona.weights);
  const score = Math.min(100, Math.round(base * adjust * 100)); // 0-100 にクランプ
  const rank = rankFromScore(score);
  const { reasons, concerns, scoutAngles, interviewQuestions } = explainMatch(
    persona,
    c,
    breakdown,
  );

  return {
    candidateId: c.id,
    personaId: persona.id,
    score,
    rank,
    breakdown,
    adjust,
    reasons,
    concerns,
    scoutAngles,
    interviewQuestions,
    hardRequirementPassed: hard.passed,
    failedRequirements: hard.failedRequirements,
  };
}

export type MatchOptions = {
  /** ハード不合格者を含めるか（false=「条件外」を除外） */
  includeFailed?: boolean;
};

/** ペルソナに対し候補者群をスコアリングし、スコア降順で返す */
export function matchAll(
  persona: Persona,
  candidates: Candidate[],
  opts: MatchOptions = {},
): MatchResult[] {
  const results = candidates.map((c) => matchCandidate(persona, c));
  const filtered = opts.includeFailed
    ? results
    : results.filter((r) => r.hardRequirementPassed);
  return filtered.sort((a, b) => b.score - a.score);
}
