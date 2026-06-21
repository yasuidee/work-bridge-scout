// =============================================================================
// §6-5 マッチングエンジンの最低限テスト（tsx で実行: npm test）
//   - 必須未達候補が hardRequirementPassed=false
//   - 完全適合候補が S ランク
//   - 重み変更でランク順位が変わる
//   - 同一入力で常に同じ結果（決定論性）
// =============================================================================
import { DEFAULT_WEIGHTS } from "../../constants";
import type { Candidate, Persona, PersonaWeights } from "../../types";
import { matchCandidate } from "../index";

let passed = 0;
let failed = 0;
function assert(cond: boolean, msg: string) {
  if (cond) {
    passed += 1;
    console.log(`  ✓ ${msg}`);
  } else {
    failed += 1;
    console.error(`  ✗ ${msg}`);
  }
}

// ---- フィクスチャ ----------------------------------------------------------
function baseCandidate(over: Partial<Candidate> = {}): Candidate {
  return {
    id: "c-test",
    displayName: "候補 T.K.",
    headline: "SaaS 海外営業",
    currentRole: "Account Executive",
    yearsOfExperience: 6,
    jobCategories: ["海外営業", "フィールドセールス"],
    industries: ["SaaS"],
    skills: ["法人営業", "英語商談", "Salesforce", "越境SaaS"],
    languages: { japanese: "N1", english: "Fluent" },
    residence: { country: "日本", prefecture: "東京都", inJapan: true },
    workAuthorization: { status: "PermanentResident", needsSponsorship: false },
    desiredConditions: {
      salaryMin: 600,
      salaryMax: 800,
      locations: ["東京都"],
      remotePreference: "hybrid",
      jobCategories: ["海外営業"],
      industries: ["SaaS"],
      startTiming: "即日",
    },
    cultureTraits: ["自走力", "顧客志向", "数値志向"],
    careerSummary: "SaaS の海外営業を6年。",
    workExperiences: [],
    lastLoginAt: "2026-06-18",
    resumeUpdatedAt: "2026-06-10",
    replyLikelihood: 80,
    jobChangeMotivation: "high",
    tags: [],
    ...over,
  };
}

function basePersona(over: Partial<Persona> = {}, weights?: PersonaWeights): Persona {
  return {
    id: "p-test",
    name: "SaaS 海外営業",
    version: 1,
    jobId: "j-test",
    required: {
      jobCategories: ["海外営業"],
      skills: ["法人営業", "英語商談", "Salesforce"],
      minYears: 3,
      japanese: "N2",
      english: "Business",
      allowSponsorship: true,
    },
    welcome: {
      skills: ["越境SaaS"],
      industries: ["SaaS"],
    },
    offer: {
      salaryMin: 600,
      salaryMax: 850,
      locations: ["東京都"],
      remoteAvailable: true,
      startTiming: "即日",
    },
    cultureWanted: ["自走力", "顧客志向", "数値志向"],
    exclusions: [],
    weights: weights ?? DEFAULT_WEIGHTS,
    ...over,
  };
}

// ---- 1. 必須未達 → hardRequirementPassed=false -----------------------------
console.log("Test 1: 必須未達候補はハードフィルター不合格");
{
  const persona = basePersona();
  const weakJp = baseCandidate({ languages: { japanese: "N4", english: "Fluent" } });
  const r = matchCandidate(persona, weakJp);
  assert(r.hardRequirementPassed === false, "日本語N4はN2要件で不合格");
  assert(
    r.failedRequirements.some((f) => f.includes("日本語")),
    "失敗理由に日本語が含まれる",
  );

  const fewYears = baseCandidate({ yearsOfExperience: 1 });
  assert(
    matchCandidate(persona, fewYears).hardRequirementPassed === false,
    "経験1年は最低3年要件で不合格",
  );
}

// ---- 2. 完全適合 → S ランク -------------------------------------------------
console.log("Test 2: 完全適合候補は S ランク");
{
  const persona = basePersona();
  const ideal = baseCandidate();
  const r = matchCandidate(persona, ideal);
  assert(r.hardRequirementPassed === true, "理想候補はハード通過");
  assert(r.rank === "S", `理想候補は S（実際: ${r.rank} / score=${r.score}）`);
  assert(r.reasons.length > 0, "reasons が生成される");
  assert(r.scoutAngles.length > 0, "scoutAngles が生成される");
  assert(r.interviewQuestions.length > 0, "interviewQuestions が生成される");
}

// ---- 3. 重み変更でランク順位が変わる ---------------------------------------
console.log("Test 3: 重み変更でスコア/順位が変わる");
{
  // 日本語は最高だがスキル一致が弱い候補
  const cand = baseCandidate({
    skills: ["カスタマーサポート"], // 必須スキルを満たさない → ただしハード不合格になるので調整
    languages: { japanese: "Native", english: "Native" },
  });
  // ハード不合格を避けるため、スキル必須を緩めたペルソナを2種の重みで比較
  const personaSkillHeavy = basePersona(
    { required: { japanese: "N2", english: "Business", allowSponsorship: true } },
    { ...DEFAULT_WEIGHTS, skill: 60, japanese: 2, english: 2, roleExp: 6, industryExp: 6, workAuth: 6, salaryFit: 6, locationFit: 6, culture: 6 },
  );
  const personaLangHeavy = basePersona(
    { required: { japanese: "N2", english: "Business", allowSponsorship: true } },
    { ...DEFAULT_WEIGHTS, skill: 4, japanese: 50, english: 30, roleExp: 4, industryExp: 2, workAuth: 4, salaryFit: 1, locationFit: 1, culture: 4 },
  );
  const sSkill = matchCandidate(personaSkillHeavy, cand).score;
  const sLang = matchCandidate(personaLangHeavy, cand).score;
  assert(
    sLang > sSkill,
    `語学重視の方が高スコア（lang=${sLang} > skill=${sSkill}）`,
  );
}

// ---- 4. 決定論性 ------------------------------------------------------------
console.log("Test 4: 同一入力で常に同じ結果（決定論性）");
{
  const persona = basePersona();
  const cand = baseCandidate();
  const a = matchCandidate(persona, cand);
  const b = matchCandidate(persona, cand);
  assert(JSON.stringify(a) === JSON.stringify(b), "2回実行で完全一致");
}

console.log(`\n結果: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
