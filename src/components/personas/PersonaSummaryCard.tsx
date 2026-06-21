import { Sparkles, ShieldCheck, Plus, Target, Heart, Ban } from "lucide-react";
import { Card } from "@/components/ui";
import { JLPT_LABELS, EN_LABELS, VISA_LABELS, WEIGHT_KEYS, WEIGHT_LABELS } from "@/lib/constants";
import { fmtSalary } from "@/lib/format";
import { jobById } from "@/lib/mock/jobs";
import type { Persona } from "@/lib/types";

function Block({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Sparkles;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-3">
      <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
        <Icon className="h-3.5 w-3.5 text-brand-600" />
        {title}
      </p>
      <div className="text-xs text-slate-600">{children}</div>
    </div>
  );
}

const Chips = ({ items }: { items?: string[] }) =>
  items && items.length ? (
    <div className="flex flex-wrap gap-1">
      {items.map((s) => (
        <span key={s} className="rounded bg-white px-1.5 py-0.5 text-[11px] text-slate-600 ring-1 ring-slate-200">
          {s}
        </span>
      ))}
    </div>
  ) : (
    <span className="text-slate-400">指定なし</span>
  );

export function PersonaSummaryCard({ persona }: { persona: Persona }) {
  const job = jobById(persona.jobId);
  const r = persona.required;
  const topWeights = [...WEIGHT_KEYS]
    .sort((a, b) => persona.weights[b] - persona.weights[a])
    .slice(0, 3);

  return (
    <Card className="overflow-hidden">
      <div className="ai-gradient px-5 py-3">
        <p className="flex items-center gap-1.5 text-xs font-medium text-white/90">
          <Sparkles className="h-4 w-4" /> AIが理解した採用ペルソナ
        </p>
        <p className="mt-0.5 text-base font-bold text-white">{persona.name}</p>
        <p className="text-xs text-white/80">
          対象求人: {job?.title ?? "未紐付け"} ・ v{persona.version}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 p-5 md:grid-cols-2">
        <Block icon={ShieldCheck} title="必須条件（ハードフィルター）">
          <ul className="space-y-1">
            <li>職種: {r.jobCategories?.join("・") || "指定なし"}</li>
            <li className="flex items-center gap-1">必須スキル: <Chips items={r.skills} /></li>
            <li>経験: {r.minYears ? `${r.minYears}年以上` : "指定なし"}</li>
            <li>
              語学: {r.japanese ? JLPT_LABELS[r.japanese] : "—"} /{" "}
              {r.english ? EN_LABELS[r.english] : "英語不問"}
            </li>
            <li>
              在留資格: {r.visaStatuses?.map((v) => VISA_LABELS[v]).join("・") || "不問"}
              {r.allowSponsorship ? "（スポンサー可）" : ""}
            </li>
            <li>{r.mustBeInJapan ? "国内在住が必須" : "海外在住も可"}</li>
          </ul>
        </Block>
        <Block icon={Plus} title="歓迎条件（加点）">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-1">スキル: <Chips items={persona.welcome.skills} /></div>
            <div className="flex flex-wrap items-center gap-1">業界: <Chips items={persona.welcome.industries} /></div>
            {persona.welcome.marketExperience && (
              <div className="flex flex-wrap items-center gap-1">市場経験: <Chips items={persona.welcome.marketExperience} /></div>
            )}
          </div>
        </Block>
        <Block icon={Target} title="オファー・希望条件適合">
          <ul className="space-y-1">
            <li>年収: {fmtSalary(persona.offer.salaryMin, persona.offer.salaryMax)}</li>
            <li>勤務地: {persona.offer.locations.join("・")}</li>
            <li>{persona.offer.remoteAvailable ? "リモート可" : "出社中心"} ・ 着任 {persona.offer.startTiming}</li>
          </ul>
        </Block>
        <Block icon={Heart} title="カルチャー・重み付け">
          <div className="mb-1.5 flex flex-wrap items-center gap-1">求める特性: <Chips items={persona.cultureWanted} /></div>
          <p className="text-slate-500">
            重視: {topWeights.map((k) => `${WEIGHT_LABELS[k]}(${persona.weights[k]})`).join(" / ")}
          </p>
          {persona.exclusions.length > 0 && (
            <p className="mt-1 flex items-center gap-1 text-rose-500">
              <Ban className="h-3 w-3" /> 除外: {persona.exclusions.join("・")}
            </p>
          )}
        </Block>
      </div>
    </Card>
  );
}
