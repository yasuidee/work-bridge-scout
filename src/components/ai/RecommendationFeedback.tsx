"use client";

import { useState } from "react";
import { ThumbsUp, Meh, ThumbsDown, Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui";
import { FEEDBACK_REASON_TAGS } from "@/lib/constants";
import { useAppStore } from "@/lib/store";
import { toast } from "@/lib/toast";
import type { FeedbackVerdict } from "@/lib/types";

// §8 推薦フィードバック（localStorage 保存／将来の重み自動調整に使う前提の構造）
export function RecommendationFeedback({
  personaId,
  candidateId,
}: {
  personaId: string;
  candidateId: string;
}) {
  const existing = useAppStore((s) =>
    s.feedbacks.find((f) => f.personaId === personaId && f.candidateId === candidateId),
  );
  const addFeedback = useAppStore((s) => s.addFeedback);

  const [verdict, setVerdict] = useState<FeedbackVerdict | null>(
    existing?.verdict ?? null,
  );
  const [tags, setTags] = useState<string[]>(existing?.reasonTags ?? []);
  const [saved, setSaved] = useState(false);

  const verdicts: { v: FeedbackVerdict; label: string; icon: typeof ThumbsUp; cls: string }[] = [
    { v: "good", label: "良い", icon: ThumbsUp, cls: "text-emerald-600 border-emerald-300 bg-emerald-50" },
    { v: "soso", label: "微妙", icon: Meh, cls: "text-amber-600 border-amber-300 bg-amber-50" },
    { v: "bad", label: "不適合", icon: ThumbsDown, cls: "text-rose-600 border-rose-300 bg-rose-50" },
  ];

  const toggleTag = (t: string) =>
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const save = () => {
    if (!verdict) return;
    addFeedback({
      personaId,
      candidateId,
      verdict,
      reasonTags: tags,
      createdAt: new Date().toISOString(),
    });
    setSaved(true);
    toast("フィードバックを学習データに記録しました", "ai");
    setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-slate-500">この推薦は？</span>
        {verdicts.map(({ v, label, icon: Icon, cls }) => (
          <button
            key={v}
            onClick={() => setVerdict(v)}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition",
              verdict === v ? cls : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50",
            )}
          >
            <Icon className="h-3 w-3" />
            {label}
          </button>
        ))}
        {existing && !saved && (
          <span className="text-[10px] text-slate-400">（記録済み）</span>
        )}
      </div>

      {verdict && verdict !== "good" && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {FEEDBACK_REASON_TAGS.map((t) => (
            <button
              key={t}
              onClick={() => toggleTag(t)}
              className={cn(
                "rounded-md border px-2 py-0.5 text-[11px] transition",
                tags.includes(t)
                  ? "border-brand-300 bg-brand-50 text-brand-700"
                  : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50",
              )}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {verdict && (
        <div className="mt-2.5 flex items-center gap-2">
          <Button size="sm" onClick={save}>
            フィードバックを記録
          </Button>
          {saved && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
              <Check className="h-3.5 w-3.5" /> 保存しました（学習データに反映）
            </span>
          )}
        </div>
      )}
    </div>
  );
}
