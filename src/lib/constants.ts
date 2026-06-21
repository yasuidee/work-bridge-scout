// =============================================================================
// 列挙値ラベル・既定値の集約 (§4 規約: 列挙値は 1 箇所に集約)
// =============================================================================
import type {
  EnglishLevel,
  JLPT,
  MatchRank,
  PersonaWeights,
  VisaStatus,
} from "./types";

// ---- 在留資格の日本語ラベル -------------------------------------------------
export const VISA_LABELS: Record<VisaStatus, string> = {
  PermanentResident: "永住者",
  Engineer_Specialist: "技術・人文知識・国際業務",
  HighlySkilled: "高度専門職",
  SpecifiedSkilled: "特定技能",
  Student: "留学",
  DependentFamily: "家族滞在",
  DesignatedActivities: "特定活動",
  Other: "その他",
};

export const JLPT_LABELS: Record<JLPT, string> = {
  N5: "日本語 N5",
  N4: "日本語 N4",
  N3: "日本語 N3",
  N2: "日本語 N2",
  N1: "日本語 N1",
  Business: "日本語 ビジネス",
  Native: "日本語 ネイティブ",
};

export const EN_LABELS: Record<EnglishLevel, string> = {
  Basic: "英語 日常会話",
  Business: "英語 ビジネス",
  Fluent: "英語 流暢",
  Native: "英語 ネイティブ",
};

// ---- ランク表示 -------------------------------------------------------------
export const RANK_ORDER: MatchRank[] = ["S", "A", "B", "C"];

export const RANK_META: Record<
  MatchRank,
  { label: string; description: string; className: string }
> = {
  S: {
    label: "S",
    description: "最有力。要件を広く満たし今動きやすい",
    className: "bg-gradient-to-br from-ai-from to-ai-to text-white",
  },
  A: {
    label: "A",
    description: "有力。主要要件を満たす",
    className: "bg-brand-600 text-white",
  },
  B: {
    label: "B",
    description: "候補。一部に懸念あり",
    className: "bg-brand-100 text-brand-700",
  },
  C: {
    label: "C",
    description: "参考。適合度は低め",
    className: "bg-slate-200 text-slate-600",
  },
};

// ---- 推薦フィードバックの理由タグ (§8) -------------------------------------
export const FEEDBACK_REASON_TAGS = [
  "スキル不足",
  "日本語不足",
  "年収不一致",
  "勤務地不一致",
  "経験過多",
  "経験不足",
  "ビザ確認要",
  "カルチャー不一致",
  "その他",
] as const;
export type FeedbackReasonTag = (typeof FEEDBACK_REASON_TAGS)[number];

// ---- 重み付けの推奨バランス（合計100）-------------------------------------
export const DEFAULT_WEIGHTS: PersonaWeights = {
  skill: 22,
  roleExp: 16,
  industryExp: 12,
  japanese: 12,
  english: 8,
  workAuth: 10,
  salaryFit: 8,
  locationFit: 6,
  culture: 6,
};

export const WEIGHT_KEYS: (keyof PersonaWeights)[] = [
  "skill",
  "roleExp",
  "industryExp",
  "japanese",
  "english",
  "workAuth",
  "salaryFit",
  "locationFit",
  "culture",
];

export const WEIGHT_LABELS: Record<keyof PersonaWeights, string> = {
  skill: "スキル適合",
  roleExp: "職種経験",
  industryExp: "業界経験",
  japanese: "日本語力",
  english: "英語力",
  workAuth: "就労資格・着任",
  salaryFit: "希望年収適合",
  locationFit: "勤務地適合",
  culture: "カルチャー適合",
};

// ---- 職種・業界・カルチャー特性の語彙（入力候補・属性は含めない）-----------
export const JOB_CATEGORIES = [
  "海外営業",
  "フィールドセールス",
  "カスタマーサクセス",
  "バックエンドエンジニア",
  "フロントエンドエンジニア",
  "機械設計",
  "生産管理",
  "EC運営",
  "海外マーケティング",
  "デジタルマーケティング",
  "貿易実務",
  "カスタマーサポート",
  "ホテル・接客",
  "通訳・翻訳",
] as const;

export const INDUSTRIES = [
  "SaaS",
  "EC・小売",
  "製造業",
  "人材",
  "観光・ホテル",
  "物流・貿易",
  "広告・マーケティング",
  "コンサルティング",
  "金融",
] as const;

export const CULTURE_TRAITS = [
  "自走力",
  "顧客志向",
  "チーム協働",
  "オーナーシップ",
  "学習意欲",
  "変化対応力",
  "論理的思考",
  "多文化協働",
  "数値志向",
  "丁寧なコミュニケーション",
] as const;

// 企業情報（プロトタイプ用の固定値）
export const TENANT = {
  companyName: "株式会社グローバルブリッジ採用",
  planName: "Enterprise",
  scoutQuota: 120,
  scoutUsed: 47,
};
