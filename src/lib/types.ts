// =============================================================================
// WORK BRIDGE — データ契約 (§5)
// UI より先にこの型を確定し、モックも推薦も全てこの型に準拠させる。
// 列挙値は本ファイル / lib/constants.ts の 1 箇所に集約し、各所で再定義しない。
// =============================================================================

// ---- 言語レベル -------------------------------------------------------------
export type JLPT = "N5" | "N4" | "N3" | "N2" | "N1" | "Business" | "Native";
export const JLPT_ORDER: JLPT[] = ["N5", "N4", "N3", "N2", "N1", "Business", "Native"];

export type EnglishLevel = "Basic" | "Business" | "Fluent" | "Native";
export const EN_ORDER: EnglishLevel[] = ["Basic", "Business", "Fluent", "Native"];

// ---- 在留資格（属性ではなく就労可否に関わる実務情報として扱う）-------------
export type VisaStatus =
  | "PermanentResident" // 永住者
  | "Engineer_Specialist" // 技術・人文知識・国際業務
  | "HighlySkilled" // 高度専門職
  | "SpecifiedSkilled" // 特定技能
  | "Student" // 留学
  | "DependentFamily" // 家族滞在
  | "DesignatedActivities" // 特定活動
  | "Other";

export const VISA_STATUSES: VisaStatus[] = [
  "PermanentResident",
  "Engineer_Specialist",
  "HighlySkilled",
  "SpecifiedSkilled",
  "Student",
  "DependentFamily",
  "DesignatedActivities",
  "Other",
];

// ---- 候補者 -----------------------------------------------------------------
export type Candidate = {
  id: string;
  displayName: string; // 仮名 or イニシャル（属性を示唆しない）
  headline: string;
  currentRole: string;
  currentCompany?: string;
  yearsOfExperience: number;
  jobCategories: string[];
  industries: string[];
  skills: string[];
  languages: { japanese: JLPT; english: EnglishLevel; others?: string[] };
  residence: { country: string; prefecture?: string; city?: string; inJapan: boolean };
  workAuthorization: { status: VisaStatus; validUntil?: string; needsSponsorship: boolean };
  desiredConditions: {
    salaryMin: number;
    salaryMax?: number;
    locations: string[];
    remotePreference: "office" | "hybrid" | "remote";
    jobCategories: string[];
    industries: string[];
    startTiming: string;
  };
  cultureTraits: string[]; // 行動特性タグ（自走力・顧客志向 等）。属性は不可
  careerSummary: string;
  workExperiences: { company: string; role: string; years: number; description: string }[];
  education?: string;
  certifications?: string[];
  lastLoginAt: string; // ISO
  resumeUpdatedAt: string;
  replyLikelihood: number; // 0-100
  jobChangeMotivation: "high" | "medium" | "low";
  tags: string[];
};

// ---- ペルソナ ---------------------------------------------------------------
export type PersonaWeights = {
  skill: number;
  roleExp: number;
  industryExp: number;
  japanese: number;
  english: number;
  workAuth: number;
  salaryFit: number;
  locationFit: number;
  culture: number;
};

export type Persona = {
  id: string;
  name: string;
  version: number; // §9 ペルソナのバージョン管理用
  jobId: string;
  required: {
    // ハードフィルター
    jobCategories?: string[];
    skills?: string[];
    minYears?: number;
    japanese?: JLPT;
    english?: EnglishLevel;
    visaStatuses?: VisaStatus[]; // いずれか該当でOK
    allowSponsorship: boolean; // 可なら needsSponsorship 候補も通す
    mustBeInJapan?: boolean;
  };
  welcome: {
    // 加点条件
    skills?: string[];
    industries?: string[];
    jobCategories?: string[];
    managementExp?: boolean;
    startupExp?: boolean;
    multiculturalTeamExp?: boolean;
    marketExperience?: string[]; // 「市場経験」。国籍ではない
  };
  offer: {
    // 訴求軸の素材＆希望条件適合の基準
    salaryMin: number;
    salaryMax: number;
    locations: string[];
    remoteAvailable: boolean;
    startTiming: string;
  };
  cultureWanted: string[]; // 行動特性タグ
  exclusions: string[]; // NG条件（属性ベース不可）
  weights: PersonaWeights; // 合計100
};

// ---- マッチ結果 -------------------------------------------------------------
export type MatchRank = "S" | "A" | "B" | "C";

export type MatchResult = {
  candidateId: string;
  personaId: string;
  score: number; // 0-100
  rank: MatchRank;
  breakdown: Record<keyof PersonaWeights, number>; // 各0-1の素点（透明性のため保持）
  adjust: number; // 補正係数 0.9..1.1（motivation×recency×reply）
  reasons: string[]; // なぜ合うか
  concerns: string[]; // どこが懸念か
  scoutAngles: string[]; // どう刺すか
  interviewQuestions: string[]; // 面談で何を聞くか
  hardRequirementPassed: boolean;
  failedRequirements: string[];
};

// ---- 求人 -------------------------------------------------------------------
export type JobStatus = "公開中" | "下書き" | "審査中" | "停止中";

export type Job = {
  id: string;
  title: string;
  jobCategory: string;
  location: string;
  salaryMin: number;
  salaryMax: number;
  status: JobStatus;
  personaIds: string[];
  applicantsCount: number;
  scoutsCount: number;
};

// ---- フィードバック（§8 AI推薦・将来の学習用）------------------------------
export type FeedbackVerdict = "good" | "soso" | "bad";

export type RecommendationFeedback = {
  candidateId: string;
  personaId: string;
  verdict: FeedbackVerdict;
  reasonTags: string[]; // FEEDBACK_REASON_TAGS から
  note?: string;
  createdAt: string;
};
