// Tier1 用のモック: スカウト履歴 / メッセージ / 選考進捗
export type ScoutRow = {
  id: string;
  candidateId: string;
  personaId: string;
  status: "送信済" | "送信待ち";
  opened: boolean;
  replied: boolean;
  sentAt: string;
};

export const SCOUTS: ScoutRow[] = [
  { id: "s1", candidateId: "c01", personaId: "p1", status: "送信済", opened: true, replied: true, sentAt: "2026-06-18" },
  { id: "s2", candidateId: "c02", personaId: "p1", status: "送信済", opened: true, replied: false, sentAt: "2026-06-19" },
  { id: "s3", candidateId: "c14", personaId: "p2", status: "送信済", opened: true, replied: true, sentAt: "2026-06-17" },
  { id: "s4", candidateId: "c17", personaId: "p3", status: "送信済", opened: false, replied: false, sentAt: "2026-06-20" },
  { id: "s5", candidateId: "c03", personaId: "p1", status: "送信待ち", opened: false, replied: false, sentAt: "—" },
  { id: "s6", candidateId: "c32", personaId: "p2", status: "送信待ち", opened: false, replied: false, sentAt: "—" },
  { id: "s7", candidateId: "c38", personaId: "p5", status: "送信済", opened: true, replied: false, sentAt: "2026-06-16" },
  { id: "s8", candidateId: "c12", personaId: "p4", status: "送信済", opened: true, replied: true, sentAt: "2026-06-15" },
];

export type ThreadMsg = { from: "company" | "candidate"; text: string; at: string };
export type MessageThreadData = {
  id: string;
  candidateId: string;
  box: "inbox" | "sent" | "draft";
  unread: boolean;
  messages: ThreadMsg[];
};

export const THREADS: MessageThreadData[] = [
  {
    id: "t1",
    candidateId: "c01",
    box: "inbox",
    unread: true,
    messages: [
      { from: "company", text: "はじめまして。海外SaaS営業のポジションでぜひお話しさせてください。", at: "2026-06-18 10:12" },
      { from: "candidate", text: "ご連絡ありがとうございます。ぜひ一度お話を伺いたいです。来週は可能でしょうか？", at: "2026-06-18 18:40" },
    ],
  },
  {
    id: "t2",
    candidateId: "c14",
    box: "inbox",
    unread: false,
    messages: [
      { from: "company", text: "越境EC運営の件でご連絡しました。台湾市場のご経験に大変関心があります。", at: "2026-06-17 09:00" },
      { from: "candidate", text: "ありがとうございます。現職の状況もあり、まずはカジュアルにお話しできれば。", at: "2026-06-17 21:10" },
    ],
  },
  {
    id: "t3",
    candidateId: "c12",
    box: "sent",
    unread: false,
    messages: [
      { from: "company", text: "製造現場責任者のポジションについてご案内です。多国籍チームの取りまとめ経験を高く評価しています。", at: "2026-06-15 14:00" },
    ],
  },
];

export type StageKey = "応募" | "書類選考" | "一次面接" | "最終面接" | "内定";
export const STAGES: StageKey[] = ["応募", "書類選考", "一次面接", "最終面接", "内定"];

export type SelectionRow = {
  id: string;
  candidateId: string;
  jobId: string;
  stage: StageKey;
  nextAction: string;
  evaluator: string;
};

export const SELECTIONS: SelectionRow[] = [
  { id: "se1", candidateId: "c01", jobId: "j01", stage: "一次面接", nextAction: "6/24 14:00 一次面接", evaluator: "山田" },
  { id: "se2", candidateId: "c02", jobId: "j01", stage: "書類選考", nextAction: "書類確認待ち", evaluator: "佐藤" },
  { id: "se3", candidateId: "c14", jobId: "j04", stage: "最終面接", nextAction: "6/26 最終面接調整中", evaluator: "鈴木" },
  { id: "se4", candidateId: "c17", jobId: "j06", stage: "応募", nextAction: "初回連絡", evaluator: "—" },
  { id: "se5", candidateId: "c12", jobId: "j08", stage: "内定", nextAction: "オファー面談", evaluator: "高橋" },
  { id: "se6", candidateId: "c38", jobId: "j10", stage: "一次面接", nextAction: "日程調整中", evaluator: "田中" },
];
