import type { MatchRank } from "../types";

// §6-3 ランク閾値（1 箇所に集約）
export function rankFromScore(score: number): MatchRank {
  if (score >= 85) return "S";
  if (score >= 70) return "A";
  if (score >= 55) return "B";
  return "C";
}
