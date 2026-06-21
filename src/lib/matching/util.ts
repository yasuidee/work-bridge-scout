// =============================================================================
// マッチングエンジン共通ユーティリティ（純粋関数のみ）
// =============================================================================

export const clamp = (v: number, min = 0, max = 1): number =>
  Math.min(max, Math.max(min, v));

/** 大文字小文字・前後空白を無視した集合化 */
export const norm = (s: string): string => s.trim().toLowerCase();

export function jaccard(a: string[], b: string[]): number {
  const setA = new Set(a.map(norm));
  const setB = new Set(b.map(norm));
  if (setA.size === 0 && setB.size === 0) return 0;
  let inter = 0;
  for (const x of setA) if (setB.has(x)) inter += 1;
  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : inter / union;
}

/** a のうち b に含まれる要素（元の表記で返す） */
export function intersectKeep(a: string[], b: string[]): string[] {
  const setB = new Set(b.map(norm));
  return a.filter((x) => setB.has(norm(x)));
}

export function countMatched(have: string[], want: string[]): number {
  const setHave = new Set(have.map(norm));
  return want.reduce((n, w) => (setHave.has(norm(w)) ? n + 1 : n), 0);
}

/** 着任時期の文字列を「今動きやすさ」係数 0..1 にマップ（決定論） */
export function timingFactor(startTiming: string): number {
  const t = startTiming;
  if (/即|すぐ|今すぐ/.test(t)) return 1;
  if (/1ヶ?月|1か月|一ヶ月/.test(t)) return 0.85;
  if (/2ヶ?月|2か月/.test(t)) return 0.7;
  if (/3ヶ?月|四半期/.test(t)) return 0.55;
  if (/半年|6ヶ?月/.test(t)) return 0.35;
  return 0.5;
}

/** 希望年収レンジ(候補) と オファーレンジ の重なりを 0..1 に */
export function salaryOverlap(
  candMin: number,
  candMax: number | undefined,
  offerMin: number,
  offerMax: number,
): number {
  const cMax = candMax ?? candMin;
  const lo = Math.max(candMin, offerMin);
  const hi = Math.min(cMax, offerMax);
  if (hi >= lo) return 1; // レンジが重なる
  // 乖離幅に応じて線形減衰（オファー上限を基準スケールに）
  const gap = candMin > offerMax ? candMin - offerMax : offerMin - cMax;
  const scale = Math.max(offerMax, 1);
  return clamp(1 - gap / scale, 0, 1);
}
