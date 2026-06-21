// =============================================================================
// §6 マッチングエンジン本体 — 決定論的で検査可能なルールベース
//   ・属性（国籍/人種/性別/年齢/宗教/婚姻/政治信条）は一切使用しない (§3)
//   ・外部 API を使わず純粋関数として実装（UI から切り離し、差し替え可能）
// =============================================================================
import {
  EN_ORDER,
  JLPT_ORDER,
  type Candidate,
  type Persona,
  type PersonaWeights,
} from "../types";
import { JLPT_LABELS, EN_LABELS } from "../constants";
import {
  clamp,
  countMatched,
  jaccard,
  salaryOverlap,
  timingFactor,
} from "./util";

// 決定論を保つため「現在日時」は固定参照日を使う（Date.now() は使わない）
export const SCORING_REFERENCE_DATE = "2026-06-21";

export type HardFilterResult = {
  passed: boolean;
  failedRequirements: string[];
};

// ---- §6-1 ハードフィルター --------------------------------------------------
export function hardFilter(persona: Persona, c: Candidate): HardFilterResult {
  const failed: string[] = [];
  const req = persona.required;

  // 在留資格 / スポンサーシップ
  if (req.visaStatuses && req.visaStatuses.length > 0) {
    if (!req.visaStatuses.includes(c.workAuthorization.status)) {
      failed.push("在留資格が要件の対象外");
    }
  }
  if (c.workAuthorization.needsSponsorship && !req.allowSponsorship) {
    failed.push("就労ビザのスポンサーが必要だが本求人は不可");
  }

  // 日本語
  if (req.japanese) {
    if (
      JLPT_ORDER.indexOf(c.languages.japanese) < JLPT_ORDER.indexOf(req.japanese)
    ) {
      failed.push(`日本語が要件（${JLPT_LABELS[req.japanese]}）に未達`);
    }
  }

  // 英語
  if (req.english) {
    if (EN_ORDER.indexOf(c.languages.english) < EN_ORDER.indexOf(req.english)) {
      failed.push(`英語が要件（${EN_LABELS[req.english]}）に未達`);
    }
  }

  // 在住
  if (req.mustBeInJapan && !c.residence.inJapan) {
    failed.push("国内在住が必須だが海外在住");
  }

  // 経験年数
  if (typeof req.minYears === "number" && c.yearsOfExperience < req.minYears) {
    failed.push(`経験年数が要件（${req.minYears}年）に未達`);
  }

  // 必須スキル 80% 以上
  if (req.skills && req.skills.length > 0) {
    const matched = countMatched(c.skills, req.skills);
    if (matched / req.skills.length < 0.8) {
      failed.push(
        `必須スキル充足率が不足（${matched}/${req.skills.length}）`,
      );
    }
  }

  return { passed: failed.length === 0, failedRequirements: failed };
}

// ---- §6-2 サブスコア（各 0..1。属性は一切使わない）------------------------
export function subScores(
  persona: Persona,
  c: Candidate,
): Record<keyof PersonaWeights, number> {
  const req = persona.required;
  const wel = persona.welcome;

  // skill: (必須一致×2 + 歓迎一致) / (必須数×2 + 歓迎数)
  const reqSkills = req.skills ?? [];
  const welSkills = wel.skills ?? [];
  const reqMatched = countMatched(c.skills, reqSkills);
  const welMatched = countMatched(c.skills, welSkills);
  const skillDenom = reqSkills.length * 2 + welSkills.length;
  const skill =
    skillDenom === 0 ? 0.6 : (reqMatched * 2 + welMatched) / skillDenom;

  // roleExp: Jaccard(候補者.jobCategories, 必須+歓迎職種)
  const personaRoles = [
    ...(req.jobCategories ?? []),
    ...(wel.jobCategories ?? []),
  ];
  const roleExp =
    personaRoles.length === 0 ? 0.6 : jaccard(c.jobCategories, personaRoles);

  // industryExp: Jaccard(候補者.industries, welcome.industries)
  const industryExp =
    (wel.industries?.length ?? 0) === 0
      ? 0.6
      : jaccard(c.industries, wel.industries ?? []);

  // japanese: clamp((ord(cand)-ord(req)+2)/4, 0,1)（要件未設定なら N5 基準で加点）
  const reqJpIdx = req.japanese ? JLPT_ORDER.indexOf(req.japanese) : 0;
  const japanese = clamp(
    (JLPT_ORDER.indexOf(c.languages.japanese) - reqJpIdx + 2) / 4,
  );

  // english: 同様
  const reqEnIdx = req.english ? EN_ORDER.indexOf(req.english) : 0;
  const english = clamp(
    (EN_ORDER.indexOf(c.languages.english) - reqEnIdx + 2) / 4,
  );

  // workAuth: スポンサー不要=1.0 / 要だが許容=0.6、着任の早さで加点
  let workAuthBase: number;
  if (!c.workAuthorization.needsSponsorship) workAuthBase = 1.0;
  else if (req.allowSponsorship) workAuthBase = 0.6;
  else workAuthBase = 0.3;
  const workAuth = clamp(
    workAuthBase * 0.85 + timingFactor(c.desiredConditions.startTiming) * 0.15,
  );

  // salaryFit: レンジ重なり=1.0、乖離幅に応じて線形減衰
  const salaryFit = salaryOverlap(
    c.desiredConditions.salaryMin,
    c.desiredConditions.salaryMax,
    persona.offer.salaryMin,
    persona.offer.salaryMax,
  );

  // locationFit: 希望勤務地 ∩ offer.locations / remote 希望×remoteAvailable
  const locInter = c.desiredConditions.locations.some((l) =>
    persona.offer.locations.includes(l),
  );
  const pref = c.desiredConditions.remotePreference;
  let locationFit: number;
  if (pref === "remote" && persona.offer.remoteAvailable) locationFit = 1;
  else if (locInter) locationFit = 1;
  else if (pref === "hybrid" && (persona.offer.remoteAvailable || locInter))
    locationFit = 0.8;
  else locationFit = 0.3;

  // culture: Jaccard(候補者.cultureTraits, persona.cultureWanted)
  const culture =
    persona.cultureWanted.length === 0
      ? 0.6
      : jaccard(c.cultureTraits, persona.cultureWanted);

  return {
    skill: clamp(skill),
    roleExp: clamp(roleExp),
    industryExp: clamp(industryExp),
    japanese,
    english,
    workAuth,
    salaryFit: clamp(salaryFit),
    locationFit: clamp(locationFit),
    culture: clamp(culture),
  };
}

// ---- 補正係数 adjust（重み付け対象外。今動かしやすさ 0.9..1.1）-------------
export function computeAdjust(c: Candidate): number {
  const motivation =
    c.jobChangeMotivation === "high"
      ? 1
      : c.jobChangeMotivation === "medium"
        ? 0.6
        : 0.3;

  const days = daysBetween(c.lastLoginAt, SCORING_REFERENCE_DATE);
  const recency =
    days <= 7 ? 1 : days <= 30 ? 0.8 : days <= 90 ? 0.5 : 0.3;

  const reply = clamp(c.replyLikelihood / 100);

  const aux = motivation * 0.4 + recency * 0.3 + reply * 0.3; // 0..1
  return 0.9 + aux * 0.2; // 0.9..1.1
}

function daysBetween(isoA: string, isoB: string): number {
  const a = Date.parse(isoA);
  const b = Date.parse(isoB);
  if (Number.isNaN(a) || Number.isNaN(b)) return 999;
  return Math.abs(b - a) / (1000 * 60 * 60 * 24);
}

// ---- §6-3 集計 -------------------------------------------------------------
export function aggregateBase(
  breakdown: Record<keyof PersonaWeights, number>,
  weights: PersonaWeights,
): number {
  let num = 0;
  let den = 0;
  (Object.keys(weights) as (keyof PersonaWeights)[]).forEach((k) => {
    num += breakdown[k] * weights[k];
    den += weights[k];
  });
  return den === 0 ? 0 : num / den;
}
