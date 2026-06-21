// =============================================================================
// §6-4 説明生成 — ここが価値の本体
//   スコアの内訳から機械的に・しかし自然な日本語で生成する。
//   テンプレート辞書を持ち差し替え可能にする。
//
//   ★ 将来の LLM 差し替え点 ★
//   このシグネチャ explainMatch(persona, candidate, breakdown) を固定する。
//   内部のテンプレート生成を、後で以下のような LLM 呼び出しへ置換できる:
//     const prompt = buildExplainPrompt(persona, candidate, breakdown)
//     return await llm.generateExplanation(prompt)  // 戻り値の型は不変
//   入出力契約（4 配列）を変えなければ UI 側は無改修で差し替え可能。
// =============================================================================
import { JLPT_LABELS, EN_LABELS, VISA_LABELS } from "../constants";
import type { Candidate, Persona, PersonaWeights } from "../types";
import { SCORING_REFERENCE_DATE } from "./scoreCandidate";
import { intersectKeep } from "./util";

export type MatchExplanation = {
  reasons: string[];
  concerns: string[];
  scoutAngles: string[];
  interviewQuestions: string[];
};

export function explainMatch(
  persona: Persona,
  c: Candidate,
  breakdown: Record<keyof PersonaWeights, number>,
): MatchExplanation {
  const reasons = buildReasons(persona, c, breakdown);
  const concerns = buildConcerns(persona, c, breakdown);
  const scoutAngles = buildScoutAngles(persona, c);
  const interviewQuestions = buildInterviewQuestions(persona, c, breakdown);
  return { reasons, concerns, scoutAngles, interviewQuestions };
}

// 重み×素点が大きい次元 → 強み
function buildReasons(
  persona: Persona,
  c: Candidate,
  bd: Record<keyof PersonaWeights, number>,
): string[] {
  const w = persona.weights;
  const dims = (Object.keys(bd) as (keyof PersonaWeights)[])
    .map((k) => ({ k, weighted: bd[k] * w[k], sub: bd[k] }))
    .filter((d) => d.sub >= 0.6 && d.weighted > 0)
    .sort((a, b) => b.weighted - a.weighted);

  const out: string[] = [];
  for (const d of dims) {
    const line = reasonLine(d.k, persona, c);
    if (line) out.push(line);
    if (out.length >= 4) break;
  }
  if (out.length === 0) out.push("総合的に大きな不足はなく、バランス型の候補");
  return out;
}

function reasonLine(
  k: keyof PersonaWeights,
  persona: Persona,
  c: Candidate,
): string | null {
  switch (k) {
    case "skill": {
      const reqSkills = persona.required.skills ?? [];
      const m = intersectKeep(c.skills, reqSkills);
      if (reqSkills.length && m.length)
        return `必須スキル ${m.length}/${reqSkills.length} を保有（${m.join("・")}）`;
      const welM = intersectKeep(c.skills, persona.welcome.skills ?? []);
      if (welM.length) return `歓迎スキルを複数保有（${welM.join("・")}）`;
      return null;
    }
    case "roleExp": {
      const roles = [
        ...(persona.required.jobCategories ?? []),
        ...(persona.welcome.jobCategories ?? []),
      ];
      const m = intersectKeep(c.jobCategories, roles);
      if (m.length)
        return `募集職種に直結する実務経験（${m.join("・")}）が ${c.yearsOfExperience}年`;
      return null;
    }
    case "industryExp": {
      const m = intersectKeep(c.industries, persona.welcome.industries ?? []);
      if (m.length) return `${m.join("・")} 業界での経験があり立ち上がりが早い`;
      return null;
    }
    case "japanese":
      return `${JLPT_LABELS[c.languages.japanese]}${
        persona.required.japanese
          ? `（要件 ${JLPT_LABELS[persona.required.japanese].replace("日本語 ", "")} を上回る）`
          : ""
      }`;
    case "english":
      return `${EN_LABELS[c.languages.english]} で社内外コミュニケーションに対応可能`;
    case "workAuth":
      return c.workAuthorization.needsSponsorship
        ? "就労資格はスポンサー対応で就業可能、着任の見通しも明確"
        : `就労資格は${VISA_LABELS[c.workAuthorization.status]}で追加手続き不要`;
    case "salaryFit":
      return "希望年収が想定オファーレンジ内に収まる";
    case "locationFit":
      return c.desiredConditions.remotePreference === "remote"
        ? "リモート希望と募集条件が一致"
        : "希望勤務地が募集拠点と合致";
    case "culture": {
      const m = intersectKeep(c.cultureTraits, persona.cultureWanted);
      if (m.length) return `求める行動特性（${m.join("・")}）に合致`;
      return null;
    }
    default:
      return null;
  }
}

// 素点が低い次元 + 境界ハード項目 → 懸念
function buildConcerns(
  persona: Persona,
  c: Candidate,
  bd: Record<keyof PersonaWeights, number>,
): string[] {
  const w = persona.weights;
  const out: string[] = [];

  const weak = (Object.keys(bd) as (keyof PersonaWeights)[])
    .filter((k) => bd[k] < 0.5)
    .sort((a, b) => w[b] - w[a]);

  for (const k of weak) {
    const line = concernLine(k, persona, c);
    if (line) out.push(line);
    if (out.length >= 3) break;
  }

  // 境界ハード項目（不合格でなくても注意喚起）
  if (out.length < 3 && c.workAuthorization.needsSponsorship) {
    out.push("就労ビザのスポンサー手続きが必要（リードタイムに留意）");
  }
  if (out.length < 3 && isVisaExpiringSoon(c.workAuthorization.validUntil)) {
    out.push(`在留期限が${c.workAuthorization.validUntil}と近く、更新状況の確認が必要`);
  }
  if (out.length < 3 && c.jobChangeMotivation === "low") {
    out.push("転職意欲は低め。返信率を上げる初回接触の設計が必要");
  }

  if (out.length === 0) out.push("目立った懸念は検出されていない");
  return out;
}

function concernLine(
  k: keyof PersonaWeights,
  persona: Persona,
  c: Candidate,
): string | null {
  switch (k) {
    case "salaryFit":
      return c.desiredConditions.salaryMin > persona.offer.salaryMax
        ? `希望年収が想定レンジ上限を ${c.desiredConditions.salaryMin - persona.offer.salaryMax}万円 超過`
        : "希望年収と募集レンジに開きがある";
    case "japanese":
      return `${JLPT_LABELS[c.languages.japanese]}で、書面・商談レベルの日本語使用に確認が必要`;
    case "english":
      return "英語要件に対し実務運用レベルの確認が必要";
    case "skill":
      return "必須スキルの一部が経歴上で未確認";
    case "roleExp":
      return "募集職種ど真ん中の経験が薄く、立ち上がり期間を要する可能性";
    case "industryExp":
      return "対象業界の実務経験が未確認";
    case "locationFit":
      return "希望勤務地・就業形態が募集条件とずれている";
    case "culture":
      return "求める行動特性との重なりが小さく、面談での見極めが必要";
    case "workAuth":
      return "就労資格・着任時期の確認が必要";
    default:
      return null;
  }
}

// 候補者.desiredConditions × persona.offer の合致点 → 訴求軸
function buildScoutAngles(persona: Persona, c: Candidate): string[] {
  const out: string[] = [];
  const o = persona.offer;
  const d = c.desiredConditions;

  if (d.remotePreference !== "office" && o.remoteAvailable) {
    out.push("リモート可を前面に（候補者はリモート/ハイブリッド希望）");
  }
  if (o.salaryMax >= d.salaryMin) {
    out.push(`希望年収（${d.salaryMin}万円〜）に対応可能なオファーレンジを提示`);
  }
  const locM = intersectKeep(d.locations, o.locations);
  if (locM.length) out.push(`希望勤務地（${locM.join("・")}）での就業機会を訴求`);

  if ((persona.welcome.marketExperience?.length ?? 0) > 0) {
    const mkt = intersectKeep(c.skills.concat(c.tags), persona.welcome.marketExperience ?? []);
    if (mkt.length)
      out.push(`${mkt.join("・")} の実務知見を活かせる裁量ポジションを訴求`);
  }
  if (!c.residence.inJapan) {
    out.push("来日・オンボーディング支援（住居/手続き）の手厚さを訴求");
  }
  if (c.jobChangeMotivation !== "high") {
    out.push("まずは情報交換のカジュアル面談として打診");
  }

  if (out.length === 0)
    out.push("事業の裁量範囲とキャリアパスを具体的に提示");
  return out.slice(0, 3);
}

// concerns + 未確認項目 → 面談確認質問
function buildInterviewQuestions(
  persona: Persona,
  c: Candidate,
  bd: Record<keyof PersonaWeights, number>,
): string[] {
  const out: string[] = [];

  if (bd.japanese < 0.75)
    out.push("実務での日本語使用頻度と、書面・商談レベルの対応可否を確認");
  if (bd.salaryFit < 0.7)
    out.push("希望年収の根拠と交渉余地、賞与・インセンティブの受け止めを確認");
  if (c.workAuthorization.needsSponsorship || isVisaExpiringSoon(c.workAuthorization.validUntil))
    out.push("在留資格の現状と、就労開始までに必要な手続き・期間を確認");
  if (bd.roleExp < 0.6)
    out.push(`${(persona.required.jobCategories ?? ["対象職種"])[0]} における具体的な担当範囲と成果を確認`);
  if (!c.residence.inJapan)
    out.push("来日・着任の希望時期と、引っ越し/家族帯同の状況を確認");
  if (bd.culture < 0.6)
    out.push("チームでの協働スタイルと意思決定の進め方を確認");

  if (out.length === 0)
    out.push("入社可能時期と現職の引き継ぎ状況を確認");
  return out.slice(0, 3);
}

function isVisaExpiringSoon(validUntil?: string): boolean {
  if (!validUntil) return false;
  const exp = Date.parse(validUntil);
  const ref = Date.parse(SCORING_REFERENCE_DATE);
  if (Number.isNaN(exp) || Number.isNaN(ref)) return false;
  const days = (exp - ref) / (1000 * 60 * 60 * 24);
  return days <= 180; // 半年以内
}
