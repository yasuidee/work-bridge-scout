"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  UserRound,
  Target,
  Send,
  EyeOff,
  ExternalLink,
  Check,
  Sparkles,
  GitCompare,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { Button, Card } from "@/components/ui";
import { CandidateMeta } from "@/components/candidates/CandidateMeta";
import { MatchScoreBadge } from "./MatchScoreBadge";
import { MatchReasonPanel } from "./MatchReasonPanel";
import { MatchBreakdown } from "./MatchBreakdown";
import { MatchRadar } from "./MatchRadar";
import { RecommendationFeedback } from "./RecommendationFeedback";
import { useAppStore } from "@/lib/store";
import { toast } from "@/lib/toast";
import type { Candidate, MatchResult, Persona } from "@/lib/types";

export function AiRecommendationCard({
  candidate,
  result,
  persona,
  onOpenDetail,
  onScout,
  compareSelected,
  onToggleCompare,
}: {
  candidate: Candidate;
  result: MatchResult;
  persona: Persona;
  onOpenDetail: (id: string) => void;
  onScout: (id: string) => void;
  compareSelected?: boolean;
  onToggleCompare?: (id: string) => void;
}) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [added, setAdded] = useState(false);

  const targetLists = useAppStore((s) => s.targetLists);
  const addToTargetList = useAppStore((s) => s.addToTargetList);
  const excludeRec = useAppStore((s) => s.excludeRec);

  const handleAddTarget = () => {
    const list = targetLists[0];
    if (list) addToTargetList(list.id, candidate.id);
    setAdded(true);
    toast(`「${candidate.displayName}」を${list ? `「${list.name}」` : "ターゲット"}に追加しました`);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <Card className={cn("overflow-hidden transition", compareSelected && "ring-2 ring-ai-from")}>
      {/* ヘッダー */}
      <div className="flex items-start gap-4 p-5">
        <MatchScoreBadge score={result.score} rank={result.rank} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenDetail(candidate.id)}
              className="truncate text-base font-semibold text-slate-900 hover:text-brand-700"
            >
              {candidate.displayName}
            </button>
            {candidate.tags.slice(0, 2).map((t) => (
              <span
                key={t}
                className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500"
              >
                {t}
              </span>
            ))}
            {onToggleCompare && (
              <button
                onClick={() => onToggleCompare(candidate.id)}
                className={cn(
                  "ml-auto inline-flex shrink-0 items-center gap-1 rounded-md border px-2 py-1 text-[11px] transition",
                  compareSelected
                    ? "border-ai-from bg-violet-50 text-ai-from"
                    : "border-slate-200 text-slate-500 hover:bg-slate-50",
                )}
              >
                <GitCompare className="h-3 w-3" />
                {compareSelected ? "比較中" : "比較"}
              </button>
            )}
          </div>
          <p className="mt-0.5 truncate text-sm text-slate-500">{candidate.headline}</p>
          <div className="mt-3">
            <CandidateMeta c={candidate} />
          </div>
        </div>
      </div>

      {/* スコア内訳トグル */}
      <div className="border-t border-slate-100 px-5 py-2">
        <button
          onClick={() => setShowBreakdown((v) => !v)}
          className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700"
        >
          <Sparkles className="h-3.5 w-3.5 text-ai-from" />
          スコア内訳（透明性）
          {showBreakdown ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
        {showBreakdown && (
          <div className="grid grid-cols-1 gap-4 py-3 md:grid-cols-[200px,1fr]">
            <div className="rounded-xl border border-slate-100 bg-white">
              <MatchRadar result={result} height={200} />
            </div>
            <div className="flex flex-col justify-center">
              <MatchBreakdown result={result} persona={persona} />
            </div>
          </div>
        )}
      </div>

      {/* AI 説明 4 ブロック */}
      <div className="bg-slate-50/50 px-5 py-4">
        <MatchReasonPanel result={result} />
      </div>

      {/* フィードバック */}
      <div className="px-5 pt-4">
        <RecommendationFeedback personaId={persona.id} candidateId={candidate.id} />
      </div>

      {/* アクション */}
      <div className="flex flex-wrap items-center gap-2 p-5">
        <Button variant="outline" size="sm" onClick={() => onOpenDetail(candidate.id)}>
          <UserRound className="h-3.5 w-3.5" /> 詳細
        </Button>
        <Button
          variant={added ? "secondary" : "outline"}
          size="sm"
          onClick={handleAddTarget}
        >
          {added ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Target className="h-3.5 w-3.5" />}
          {added ? "追加しました" : "ターゲット追加"}
        </Button>
        <Button variant="ai" size="sm" onClick={() => onScout(candidate.id)}>
          <Send className="h-3.5 w-3.5" /> スカウト作成
        </Button>
        <button
          onClick={() => {
            excludeRec(persona.id, candidate.id);
            toast(`「${candidate.displayName}」を推薦から除外しました`, "info");
          }}
          className={cn(
            "ml-auto inline-flex items-center gap-1 text-xs text-slate-400 hover:text-rose-500",
          )}
        >
          <EyeOff className="h-3.5 w-3.5" /> 推薦除外
        </button>
        <button
          onClick={() => onOpenDetail(candidate.id)}
          className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-brand-600"
        >
          <ExternalLink className="h-3.5 w-3.5" /> 経歴を見る
        </button>
      </div>
    </Card>
  );
}
