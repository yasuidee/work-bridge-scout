"use client";

import { useState } from "react";
import { Check, ChevronLeft, ChevronRight, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button, Card, Input, Label, Select } from "@/components/ui";
import { ChipSelect, TagInput, Toggle } from "./inputs";
import { PersonaWeightEditor } from "./PersonaWeightEditor";
import { PersonaSummaryCard } from "./PersonaSummaryCard";
import {
  CULTURE_TRAITS,
  DEFAULT_WEIGHTS,
  INDUSTRIES,
  JOB_CATEGORIES,
  VISA_LABELS,
  WEIGHT_KEYS,
} from "@/lib/constants";
import { EN_ORDER, JLPT_ORDER, VISA_STATUSES } from "@/lib/types";
import type { Persona, PersonaWeights, VisaStatus } from "@/lib/types";
import { JOBS } from "@/lib/mock/jobs";
import { CANDIDATES, candidateById } from "@/lib/mock/candidates";
import { matchAll } from "@/lib/matching";
import { MatchScoreBadge } from "@/components/ai/MatchScoreBadge";
import { Sparkles } from "lucide-react";

type Draft = Omit<Persona, "id">;

const STEPS = [
  "基本情報",
  "必須条件",
  "歓迎条件",
  "希望条件適合",
  "カルチャー・人物像",
  "除外条件",
  "重み付け",
  "プレビュー",
];

function emptyDraft(): Draft {
  return {
    name: "",
    version: 1,
    jobId: JOBS[0].id,
    required: { allowSponsorship: false, skills: [], jobCategories: [] },
    welcome: { skills: [], industries: [], marketExperience: [] },
    offer: {
      salaryMin: 500,
      salaryMax: 800,
      locations: [],
      remoteAvailable: true,
      startTiming: "1ヶ月以内",
    },
    cultureWanted: [],
    exclusions: [],
    weights: { ...DEFAULT_WEIGHTS },
  };
}

const ComplianceNote = () => (
  <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-100 bg-amber-50/60 p-3 text-xs text-amber-700">
    <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
    <span>
      国籍・人種・性別・年齢・宗教・婚姻状況などの属性は、法令（雇用対策法・職業安定法）の趣旨に基づき
      <b>入力・スコアリング・絞り込みのいずれにも使用しません</b>。条件は就労資格・スキル・経験など合理的な項目のみで構成されます。
    </span>
  </div>
);

export function PersonaFormWizard({
  onComplete,
}: {
  onComplete: (p: Persona) => void;
}) {
  const [step, setStep] = useState(0);
  const [d, setD] = useState<Draft>(emptyDraft());

  const set = (patch: Partial<Draft>) => setD((prev) => ({ ...prev, ...patch }));
  const setReq = (patch: Partial<Draft["required"]>) =>
    setD((prev) => ({ ...prev, required: { ...prev.required, ...patch } }));
  const setWel = (patch: Partial<Draft["welcome"]>) =>
    setD((prev) => ({ ...prev, welcome: { ...prev.welcome, ...patch } }));
  const setOffer = (patch: Partial<Draft["offer"]>) =>
    setD((prev) => ({ ...prev, offer: { ...prev.offer, ...patch } }));

  const weightTotal = WEIGHT_KEYS.reduce((s, k) => s + d.weights[k], 0);
  const canNext =
    step === 0 ? d.name.trim().length > 0 : step === 6 ? weightTotal === 100 : true;
  const isLast = step === STEPS.length - 1;

  const finish = () => {
    const persona: Persona = { ...d, id: `up-${Date.now()}` };
    onComplete(persona);
  };

  const previewPersona: Persona = { ...d, id: "preview" };

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[220px,1fr]">
      {/* ステッパー */}
      <div className="lg:sticky lg:top-20 lg:self-start">
        <ol className="space-y-1">
          {STEPS.map((s, i) => (
            <li key={s}>
              <button
                onClick={() => setStep(i)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition",
                  i === step
                    ? "bg-brand-50 font-medium text-brand-700"
                    : "text-slate-500 hover:bg-slate-50",
                )}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full text-[11px]",
                    i < step
                      ? "bg-emerald-500 text-white"
                      : i === step
                        ? "ai-gradient text-white"
                        : "bg-slate-200 text-slate-500",
                  )}
                >
                  {i < step ? <Check className="h-3 w-3" /> : i + 1}
                </span>
                {s}
              </button>
            </li>
          ))}
        </ol>
      </div>

      {/* ステップ本体 */}
      <Card className="p-6">
        <h2 className="mb-1 text-lg font-bold text-slate-900">
          Step {step + 1}. {STEPS[step]}
        </h2>
        <p className="mb-5 text-sm text-slate-500">{stepHint(step)}</p>

        {step === 0 && (
          <div className="max-w-lg space-y-4">
            <div>
              <Label>ペルソナ名</Label>
              <Input
                value={d.name}
                onChange={(e) => set({ name: e.target.value })}
                placeholder="例: 日本語N2以上の海外SaaS営業"
              />
            </div>
            <div>
              <Label>対象求人</Label>
              <Select value={d.jobId} onChange={(e) => set({ jobId: e.target.value })}>
                {JOBS.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <ComplianceNote />
            <Field label="必須の職種">
              <ChipSelect
                options={JOB_CATEGORIES}
                value={d.required.jobCategories ?? []}
                onChange={(v) => setReq({ jobCategories: v })}
              />
            </Field>
            <Field label="必須スキル（80%以上の保有でハード通過）">
              <TagInput
                value={d.required.skills ?? []}
                onChange={(v) => setReq({ skills: v })}
                placeholder="例: 法人営業"
              />
            </Field>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <Field label="最低経験年数">
                <Input
                  type="number"
                  value={d.required.minYears ?? 0}
                  onChange={(e) => setReq({ minYears: Number(e.target.value) })}
                />
              </Field>
              <Field label="日本語（最低）">
                <Select
                  value={d.required.japanese ?? ""}
                  onChange={(e) => setReq({ japanese: (e.target.value || undefined) as Persona["required"]["japanese"] })}
                >
                  <option value="">不問</option>
                  {JLPT_ORDER.map((j) => (
                    <option key={j} value={j}>
                      {j}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="英語（最低）">
                <Select
                  value={d.required.english ?? ""}
                  onChange={(e) => setReq({ english: (e.target.value || undefined) as Persona["required"]["english"] })}
                >
                  <option value="">不問</option>
                  {EN_ORDER.map((j) => (
                    <option key={j} value={j}>
                      {j}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
            <Field label="対象の在留資格（いずれか該当でOK）">
              <div className="flex flex-wrap gap-1.5">
                {VISA_STATUSES.map((v) => {
                  const active = (d.required.visaStatuses ?? []).includes(v);
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => {
                        const cur = d.required.visaStatuses ?? [];
                        setReq({
                          visaStatuses: active ? cur.filter((x) => x !== v) : [...cur, v as VisaStatus],
                        });
                      }}
                      className={cn(
                        "rounded-full border px-3 py-1 text-xs transition",
                        active
                          ? "border-brand-300 bg-brand-50 text-brand-700"
                          : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50",
                      )}
                    >
                      {VISA_LABELS[v]}
                    </button>
                  );
                })}
              </div>
            </Field>
            <div className="flex gap-6">
              <Toggle
                checked={d.required.allowSponsorship}
                onChange={(v) => setReq({ allowSponsorship: v })}
                label="就労ビザのスポンサー可"
              />
              <Toggle
                checked={d.required.mustBeInJapan ?? false}
                onChange={(v) => setReq({ mustBeInJapan: v })}
                label="国内在住が必須"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <Field label="歓迎スキル">
              <TagInput value={d.welcome.skills ?? []} onChange={(v) => setWel({ skills: v })} />
            </Field>
            <Field label="歓迎業界">
              <ChipSelect
                options={INDUSTRIES}
                value={d.welcome.industries ?? []}
                onChange={(v) => setWel({ industries: v })}
              />
            </Field>
            <Field label="市場経験（国籍ではなく実務知見として扱います）">
              <TagInput
                value={d.welcome.marketExperience ?? []}
                onChange={(v) => setWel({ marketExperience: v })}
                placeholder="例: 台湾EC市場の実務経験"
              />
            </Field>
            <div className="flex flex-wrap gap-6">
              <Toggle checked={!!d.welcome.managementExp} onChange={(v) => setWel({ managementExp: v })} label="マネジメント経験を歓迎" />
              <Toggle checked={!!d.welcome.startupExp} onChange={(v) => setWel({ startupExp: v })} label="スタートアップ経験を歓迎" />
              <Toggle checked={!!d.welcome.multiculturalTeamExp} onChange={(v) => setWel({ multiculturalTeamExp: v })} label="多文化チーム経験を歓迎" />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Field label="提示年収 下限（万円）">
                <Input type="number" value={d.offer.salaryMin} onChange={(e) => setOffer({ salaryMin: Number(e.target.value) })} />
              </Field>
              <Field label="提示年収 上限（万円）">
                <Input type="number" value={d.offer.salaryMax} onChange={(e) => setOffer({ salaryMax: Number(e.target.value) })} />
              </Field>
            </div>
            <Field label="勤務地">
              <TagInput value={d.offer.locations} onChange={(v) => setOffer({ locations: v })} placeholder="例: 東京都" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="着任時期の目安">
                <Input value={d.offer.startTiming} onChange={(e) => setOffer({ startTiming: e.target.value })} />
              </Field>
              <div className="flex items-end">
                <Toggle checked={d.offer.remoteAvailable} onChange={(v) => setOffer({ remoteAvailable: v })} label="リモート勤務可" />
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5">
            <Field label="求める行動特性（属性ではなく行動特性のみ）">
              <ChipSelect
                options={CULTURE_TRAITS}
                value={d.cultureWanted}
                onChange={(v) => set({ cultureWanted: v })}
              />
            </Field>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-5">
            <ComplianceNote />
            <Field label="NG条件（属性ベースは指定できません。行動・実務に関する条件のみ）">
              <TagInput
                value={d.exclusions}
                onChange={(v) => set({ exclusions: v })}
                placeholder="例: 1年未満での離職が連続"
              />
            </Field>
          </div>
        )}

        {step === 6 && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr,260px]">
            <PersonaWeightEditor weights={d.weights} onChange={(w: PersonaWeights) => set({ weights: w })} />
            <div className="lg:border-l lg:border-slate-100 lg:pl-5">
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                <Sparkles className="h-3.5 w-3.5 text-ai-from" /> ライブプレビュー（上位候補）
              </p>
              <p className="mb-3 text-[11px] text-slate-400">
                重みを動かすと推薦順位がリアルタイムに変わります。
              </p>
              <div className="space-y-2">
                {matchAll(previewPersona, CANDIDATES).slice(0, 4).map((r) => {
                  const c = candidateById(r.candidateId);
                  if (!c) return null;
                  return (
                    <div key={r.candidateId} className="flex items-center gap-2.5 rounded-lg border border-slate-100 p-2">
                      <MatchScoreBadge score={r.score} rank={r.rank} size="sm" />
                      <div className="min-w-0">
                        <p className="truncate text-xs font-medium text-slate-700">{c.displayName}</p>
                        <p className="truncate text-[10px] text-slate-400">{c.headline}</p>
                      </div>
                    </div>
                  );
                })}
                {matchAll(previewPersona, CANDIDATES).length === 0 && (
                  <p className="rounded-lg border border-dashed border-slate-200 p-3 text-center text-[11px] text-slate-400">
                    現在の必須条件に合致する候補者がいません
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {step === 7 && (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">
              以下の内容でAIが候補者を評価します。問題なければ保存してください。
            </p>
            <PersonaSummaryCard persona={previewPersona} />
          </div>
        )}

        {/* ナビ */}
        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
          <Button
            variant="ghost"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            <ChevronLeft className="h-4 w-4" /> 戻る
          </Button>
          {isLast ? (
            <Button variant="ai" onClick={finish}>
              <Check className="h-4 w-4" /> 保存してAI推薦を実行
            </Button>
          ) : (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext}>
              次へ <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-medium text-slate-600">{label}</p>
      {children}
    </div>
  );
}

function stepHint(step: number): string {
  return [
    "ペルソナの名称と紐づける求人を選びます。",
    "これを満たさない候補者は推薦から除外される、ハードフィルター条件です。",
    "加点対象となる歓迎条件。満たすほどスコアが上がります。",
    "提示できるオファー内容。候補者の希望条件との適合度を測ります。",
    "求める人物像を行動特性で定義します（属性は使いません）。",
    "推薦から外したい条件。属性ベースの除外はできません。",
    "各評価軸の重みを合計100で配分します。重み次第で推薦順位が変わります。",
    "AIが理解したペルソナの最終確認です。",
  ][step];
}
