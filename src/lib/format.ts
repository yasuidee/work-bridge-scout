import type { Candidate } from "./types";

export const fmtSalary = (min: number, max?: number): string =>
  max ? `${min}〜${max}万円` : `${min}万円〜`;

export const remoteLabel: Record<Candidate["desiredConditions"]["remotePreference"], string> = {
  office: "出社",
  hybrid: "ハイブリッド",
  remote: "フルリモート",
};

export const motivationLabel: Record<Candidate["jobChangeMotivation"], string> = {
  high: "高い",
  medium: "中程度",
  low: "低め",
};

export const residenceLabel = (c: Candidate): string =>
  c.residence.inJapan
    ? `${c.residence.prefecture ?? "国内"}（在住）`
    : `${c.residence.country}（海外在住）`;

export const daysAgo = (iso: string, refIso = "2026-06-21"): string => {
  const a = Date.parse(iso);
  const b = Date.parse(refIso);
  if (Number.isNaN(a) || Number.isNaN(b)) return "—";
  const d = Math.round((b - a) / 86400000);
  if (d <= 0) return "本日";
  if (d === 1) return "昨日";
  if (d < 7) return `${d}日前`;
  if (d < 30) return `${Math.floor(d / 7)}週間前`;
  return `${Math.floor(d / 30)}ヶ月前`;
};
