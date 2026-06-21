"use client";

import { useMemo, useState } from "react";
import {
  X,
  Heart,
  Target,
  Send,
  Sparkles,
  Briefcase,
  GraduationCap,
  Award,
  Clock,
  Check,
} from "lucide-react";
import { Drawer } from "@/components/overlay";
import { Button, Badge } from "@/components/ui";
import { CandidateMeta } from "./CandidateMeta";
import { MatchScoreBadge } from "@/components/ai/MatchScoreBadge";
import { MatchReasonPanel } from "@/components/ai/MatchReasonPanel";
import { MatchBreakdown } from "@/components/ai/MatchBreakdown";
import { MatchRadar } from "@/components/ai/MatchRadar";
import { cn } from "@/lib/cn";
import { daysAgo, motivationLabel, remoteLabel, fmtSalary } from "@/lib/format";
import { matchCandidate } from "@/lib/matching";
import { useAppStore } from "@/lib/store";
import { toast } from "@/lib/toast";
import type { Candidate, Persona } from "@/lib/types";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-slate-100 px-6 py-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </p>
      {children}
    </div>
  );
}

export function CandidateDetailDrawer({
  candidate,
  persona,
  open,
  onClose,
  onScout,
}: {
  candidate: Candidate | null;
  persona?: Persona | null;
  open: boolean;
  onClose: () => void;
  onScout?: (id: string) => void;
}) {
  const favorites = useAppStore((s) => s.favorites);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const targetLists = useAppStore((s) => s.targetLists);
  const addToTargetList = useAppStore((s) => s.addToTargetList);
  const notes = useAppStore((s) => s.notes);
  const setNote = useAppStore((s) => s.setNote);

  const [added, setAdded] = useState(false);

  const result = useMemo(
    () => (candidate && persona ? matchCandidate(persona, candidate) : null),
    [candidate, persona],
  );

  if (!candidate) return null;
  const isFav = favorites.includes(candidate.id);

  return (
    <Drawer open={open} onClose={onClose}>
      {/* ヘッダー */}
      <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-100 bg-white px-6 py-4">
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-slate-900">{candidate.displayName}</h2>
          <p className="truncate text-sm text-slate-500">{candidate.headline}</p>
          <p className="mt-0.5 text-xs text-slate-400">
            {candidate.currentRole}
            {candidate.currentCompany ? ` ・ ${candidate.currentCompany}` : ""}
            ｜実務 {candidate.yearsOfExperience}年
          </p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* アクション */}
      <div className="flex flex-wrap gap-2 px-6 py-3">
        <Button
          variant={added ? "secondary" : "outline"}
          size="sm"
          onClick={() => {
            const l = targetLists[0];
            if (l) addToTargetList(l.id, candidate.id);
            setAdded(true);
            toast(`「${candidate.displayName}」をターゲットに追加しました`);
            setTimeout(() => setAdded(false), 1500);
          }}
        >
          {added ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Target className="h-3.5 w-3.5" />}
          {added ? "追加済み" : "ターゲット追加"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            toggleFavorite(candidate.id);
            toast(isFav ? "気になるから外しました" : `「${candidate.displayName}」を気になるに追加`, "info");
          }}
        >
          <Heart className={cn("h-3.5 w-3.5", isFav && "fill-rose-400 text-rose-400")} />
          {isFav ? "気になる済み" : "気になる"}
        </Button>
        {onScout && (
          <Button variant="ai" size="sm" onClick={() => onScout(candidate.id)}>
            <Send className="h-3.5 w-3.5" /> スカウト
          </Button>
        )}
      </div>

      {/* AI マッチ分析 */}
      {result && persona && (
        <Section title="AI マッチ分析">
          <div className="mb-3 flex items-center gap-3 rounded-xl border border-violet-100 bg-gradient-to-r from-violet-50/60 to-brand-50/60 p-3">
            <MatchScoreBadge score={result.score} rank={result.rank} />
            <div className="text-xs text-slate-600">
              <p className="flex items-center gap-1 font-semibold text-slate-700">
                <Sparkles className="h-3.5 w-3.5 text-ai-from" />
                ペルソナ「{persona.name}」との適合
              </p>
              <p className="mt-1 text-slate-500">
                {result.hardRequirementPassed
                  ? "必須要件を満たしています"
                  : `条件外: ${result.failedRequirements.join(" / ")}`}
              </p>
            </div>
          </div>
          <div className="mb-3 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-100 bg-white p-2">
              <MatchRadar result={result} />
            </div>
            <div className="flex flex-col justify-center">
              <MatchBreakdown result={result} persona={persona} />
            </div>
          </div>
          <MatchReasonPanel result={result} columns={2} />
        </Section>
      )}

      {/* 主要属性 */}
      <Section title="主要属性">
        <CandidateMeta c={candidate} />
      </Section>

      {/* 職務要約 */}
      <Section title="職務要約">
        <p className="text-sm leading-relaxed text-slate-600">{candidate.careerSummary}</p>
      </Section>

      {/* スキル / カルチャー */}
      <Section title="スキル・行動特性">
        <div className="mb-2 flex flex-wrap gap-1.5">
          {candidate.skills.map((s) => (
            <Badge key={s} className="bg-brand-50 text-brand-700">
              {s}
            </Badge>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {candidate.cultureTraits.map((t) => (
            <Badge key={t} className="bg-violet-50 text-violet-700">
              {t}
            </Badge>
          ))}
        </div>
      </Section>

      {/* 経歴 */}
      <Section title="経歴">
        <ul className="space-y-3">
          {candidate.workExperiences.map((w, i) => (
            <li key={i} className="flex gap-3">
              <Briefcase className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
              <div>
                <p className="text-sm font-medium text-slate-700">
                  {w.role} ・ {w.company}
                  <span className="ml-2 text-xs font-normal text-slate-400">{w.years}年</span>
                </p>
                <p className="text-xs text-slate-500">{w.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      {/* 希望条件 / 学歴 / その他 */}
      <Section title="希望条件・その他">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
          <Row label="希望年収" value={fmtSalary(candidate.desiredConditions.salaryMin, candidate.desiredConditions.salaryMax)} />
          <Row label="希望勤務地" value={candidate.desiredConditions.locations.join("・")} />
          <Row label="就業形態" value={remoteLabel[candidate.desiredConditions.remotePreference]} />
          <Row label="着任可能時期" value={candidate.desiredConditions.startTiming} />
          <Row label="転職意欲" value={motivationLabel[candidate.jobChangeMotivation]} />
          <Row label="最終ログイン" value={daysAgo(candidate.lastLoginAt)} icon={Clock} />
          {candidate.education && <Row label="学歴" value={candidate.education} icon={GraduationCap} />}
          {candidate.certifications && (
            <Row label="資格" value={candidate.certifications.join("・")} icon={Award} />
          )}
        </dl>
      </Section>

      {/* メモ */}
      <Section title="メモ">
        <textarea
          value={notes[candidate.id] ?? ""}
          onChange={(e) => setNote(candidate.id, e.target.value)}
          placeholder="社内共有メモ（自動保存）"
          rows={3}
          className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
      </Section>
      <div className="h-6" />
    </Drawer>
  );
}

function Row({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: typeof Clock;
}) {
  return (
    <div>
      <dt className="flex items-center gap-1 text-slate-400">
        {Icon && <Icon className="h-3 w-3" />}
        {label}
      </dt>
      <dd className="mt-0.5 font-medium text-slate-700">{value}</dd>
    </div>
  );
}
