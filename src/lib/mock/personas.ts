// =============================================================================
// §7 モックデータ — 採用ペルソナ 5 件 + §9 バージョン履歴
//   各ペルソナで S 2名・A 数名・B 数名・ハード不合格 1〜2名 が出るよう設計
//   weights は合計 100
// =============================================================================
import type { Persona } from "../types";

export const PERSONAS: Persona[] = [
  // p1: 日本語N2以上の海外営業（SaaS）— ゴールデンパスの主役
  {
    id: "p1",
    name: "日本語N2以上の海外SaaS営業",
    version: 3,
    jobId: "j01",
    required: {
      jobCategories: ["海外営業"],
      skills: ["法人営業", "英語商談"],
      minYears: 3,
      japanese: "N2",
      english: "Business",
      allowSponsorship: true,
      mustBeInJapan: false,
    },
    welcome: {
      skills: ["Salesforce", "越境SaaS", "パイプライン管理"],
      industries: ["SaaS"],
      jobCategories: ["フィールドセールス"],
      managementExp: true,
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
    weights: {
      skill: 26, roleExp: 18, industryExp: 10, japanese: 12, english: 8,
      workAuth: 8, salaryFit: 6, locationFit: 4, culture: 8,
    },
  },
  // p2: 日本在住のグローバルEC運営
  {
    id: "p2",
    name: "日本在住のグローバルEC運営",
    version: 1,
    jobId: "j04",
    required: {
      jobCategories: ["EC運営"],
      skills: ["Amazon運用", "在庫管理"],
      minYears: 3,
      japanese: "N2",
      allowSponsorship: false,
      mustBeInJapan: true,
    },
    welcome: {
      skills: ["Shopify", "越境EC", "広告運用", "FBA"],
      industries: ["EC・小売"],
      marketExperience: ["台湾EC市場の実務経験", "東南アジア市場の実務経験"],
    },
    offer: {
      salaryMin: 500,
      salaryMax: 720,
      locations: ["東京都", "福岡県"],
      remoteAvailable: true,
      startTiming: "1ヶ月以内",
    },
    cultureWanted: ["自走力", "数値志向", "オーナーシップ"],
    exclusions: [],
    weights: {
      skill: 24, roleExp: 16, industryExp: 14, japanese: 12, english: 4,
      workAuth: 8, salaryFit: 8, locationFit: 6, culture: 8,
    },
  },
  // p3: 英語ビジネス以上のSaaSカスタマーサクセス
  {
    id: "p3",
    name: "英語ビジネス以上のSaaS CS",
    version: 1,
    jobId: "j06",
    required: {
      jobCategories: ["カスタマーサクセス"],
      skills: ["オンボーディング"],
      minYears: 3,
      japanese: "N3",
      english: "Business",
      allowSponsorship: false,
    },
    welcome: {
      skills: ["英語サポート", "チャーン分析", "ヘルススコア運用", "アップセル"],
      industries: ["SaaS"],
    },
    offer: {
      salaryMin: 550,
      salaryMax: 760,
      locations: ["東京都"],
      remoteAvailable: true,
      startTiming: "即日",
    },
    cultureWanted: ["顧客志向", "丁寧なコミュニケーション", "自走力"],
    exclusions: [],
    weights: {
      skill: 18, roleExp: 14, industryExp: 10, japanese: 8, english: 18,
      workAuth: 8, salaryFit: 8, locationFit: 8, culture: 8,
    },
  },
  // p4: 特定技能人材を管理できる現場責任者
  {
    id: "p4",
    name: "特定技能人材を管理できる現場責任者",
    version: 1,
    jobId: "j08",
    required: {
      jobCategories: ["生産管理"],
      skills: ["多国籍チーム管理"],
      minYears: 3,
      japanese: "N2",
      allowSponsorship: false,
      mustBeInJapan: true,
    },
    welcome: {
      skills: ["品質管理", "5S", "工程管理"],
      industries: ["製造業"],
      multiculturalTeamExp: true,
    },
    offer: {
      salaryMin: 400,
      salaryMax: 520,
      locations: ["愛知県", "静岡県"],
      remoteAvailable: false,
      startTiming: "1ヶ月以内",
    },
    cultureWanted: ["チーム協働", "多文化協働", "オーナーシップ"],
    exclusions: [],
    weights: {
      skill: 18, roleExp: 18, industryExp: 12, japanese: 14, english: 2,
      workAuth: 10, salaryFit: 6, locationFit: 6, culture: 14,
    },
  },
  // p5: 越境ECマーケター
  {
    id: "p5",
    name: "越境ECマーケター",
    version: 1,
    jobId: "j10",
    required: {
      jobCategories: ["海外マーケティング"],
      skills: ["広告運用", "越境EC"],
      minYears: 3,
      japanese: "N2",
      english: "Business",
      allowSponsorship: false,
    },
    welcome: {
      skills: ["CRM", "データ分析", "SEO", "ローカライズ"],
      industries: ["EC・小売"],
      marketExperience: ["東南アジア市場の実務経験", "台湾EC市場の実務経験"],
    },
    offer: {
      salaryMin: 550,
      salaryMax: 800,
      locations: ["東京都"],
      remoteAvailable: true,
      startTiming: "1ヶ月以内",
    },
    cultureWanted: ["数値志向", "自走力", "多文化協働"],
    exclusions: [],
    weights: {
      skill: 22, roleExp: 16, industryExp: 14, japanese: 10, english: 8,
      workAuth: 6, salaryFit: 8, locationFit: 6, culture: 10,
    },
  },
];

// §9 バージョン履歴（p1 のみ。版の一覧と切替だけ提供）
//   v1: 日本語 N1 必須 → v2: N2 可・SaaS 経験重視 → v3: 海外在住可（現行）
export const PERSONA_HISTORY: Record<string, Persona[]> = {
  p1: [
    {
      ...PERSONAS[0],
      version: 1,
      name: "海外SaaS営業（v1: 日本語N1必須）",
      required: { ...PERSONAS[0].required, japanese: "N1", mustBeInJapan: true },
      welcome: { ...PERSONAS[0].welcome, industries: [] },
    },
    {
      ...PERSONAS[0],
      version: 2,
      name: "海外SaaS営業（v2: N2可・SaaS経験重視）",
      required: { ...PERSONAS[0].required, japanese: "N2", mustBeInJapan: true },
    },
    // v3 = 現行（PERSONAS[0]）。海外在住可（mustBeInJapan を外す）
    PERSONAS[0],
  ],
};

export const personaById = (id: string): Persona | undefined =>
  PERSONAS.find((p) => p.id === id);
