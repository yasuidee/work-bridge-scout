"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Sparkles, RefreshCw, Filter, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, Button, Select, Tabs } from "@/components/ui";
import { StatCard } from "@/components/common/StatCard";
import { EmptyState } from "@/components/common/EmptyState";
import { AiRecommendationCard } from "@/components/ai/AiRecommendationCard";
import { CandidateDetailDrawer } from "@/components/candidates/CandidateDetailDrawer";
import { ScoutComposer } from "@/components/ai/ScoutComposer";
import { CompareTray } from "@/components/ai/CompareTray";
import { CANDIDATES, candidateById } from "@/lib/mock/candidates";
import { jobById } from "@/lib/mock/jobs";
import { matchAll, matchCandidate } from "@/lib/matching";
import { timingFactor } from "@/lib/matching/util";
import { useAllPersonas, useAppStore } from "@/lib/store";
import { daysAgo } from "@/lib/format";
import { cn } from "@/lib/cn";
import { RANK_META, RANK_ORDER } from "@/lib/constants";
import type { MatchRank } from "@/lib/types";

function RecommendationsInner() {
  const params = useSearchParams();
  const personas = useAllPersonas();
  const excluded = useAppStore((s) => s.excluded);
  const lastRunAt = useAppStore((s) => s.lastRunAt);
  const markRun = useAppStore((s) => s.markRun);

  const initial = params.get("personaId") ?? personas[0]?.id ?? "";
  const [personaId, setPersonaId] = useState(initial);
  const [tab, setTab] = useState<"reco" | "out">("reco");

  const [detailId, setDetailId] = useState<string | null>(null);
  const [scoutId, setScoutId] = useState<string | null>(null);

  // Stage2: 並び替え・ランク絞り込み / Stage3: 比較・再実行演出
  const [sortBy, setSortBy] = useState<"score" | "reply" | "timing">("score");
  const [rankFilter, setRankFilter] = useState<MatchRank[]>([]);
  const [compare, setCompare] = useState<string[]>([]);
  const [scoring, setScoring] = useState(false);

  const toggleCompare = (id: string) =>
    setCompare((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length >= 3 ? prev : [...prev, id],
    );
  const toggleRank = (r: MatchRank) =>
    setRankFilter((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));

  const rerun = () => {
    setScoring(true);
    setTimeout(() => {
      markRun(persona.id, new Date().toISOString());
      setScoring(false);
    }, 1100);
  };

  const persona = personas.find((p) => p.id === personaId) ?? personas[0];
  const job = persona ? jobById(persona.jobId) : undefined;

  const { passed, failed, avg } = useMemo(() => {
    if (!persona) return { passed: [], failed: [], avg: 0 };
    const ex = new Set(
      excluded.filter((e) => e.personaId === persona.id).map((e) => e.candidateId),
    );
    const all = matchAll(persona, CANDIDATES, { includeFailed: true });
    const passed = all.filter((r) => r.hardRequirementPassed && !ex.has(r.candidateId));
    const failed = all.filter((r) => !r.hardRequirementPassed);
    const avg = passed.length
      ? Math.round(passed.reduce((s, r) => s + r.score, 0) / passed.length)
      : 0;
    return { passed, failed, avg };
  }, [persona, excluded]);

  const displayed = useMemo(() => {
    let list = rankFilter.length ? passed.filter((r) => rankFilter.includes(r.rank)) : passed;
    list = [...list].sort((a, b) => {
      if (sortBy === "reply") {
        return (candidateById(b.candidateId)?.replyLikelihood ?? 0) - (candidateById(a.candidateId)?.replyLikelihood ?? 0);
      }
      if (sortBy === "timing") {
        return (
          timingFactor(candidateById(b.candidateId)?.desiredConditions.startTiming ?? "") -
          timingFactor(candidateById(a.candidateId)?.desiredConditions.startTiming ?? "")
        );
      }
      return b.score - a.score;
    });
    return list;
  }, [passed, rankFilter, sortBy]);

  if (!persona) {
    return (
      <PageContainer title="AI推薦">
        <EmptyState
          icon={Sparkles}
          title="ペルソナがありません"
          description="まず採用ペルソナを作成してください。"
        />
      </PageContainer>
    );
  }

  const lastRun = lastRunAt[persona.id];

  return (
    <PageContainer
      title="AI推薦"
      description="採用ペルソナに基づき、候補者DBからマッチ度の高い人材を理由つきで提案します。"
      actions={
        <Button variant="ai" onClick={rerun} disabled={scoring}>
          <RefreshCw className={cn("h-4 w-4", scoring && "animate-spin")} />
          {scoring ? "スコアリング中…" : "AI推薦を再実行"}
        </Button>
      }
    >
      {/* コントロールバー */}
      <Card className="mb-4 p-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[240px]">
            <label className="mb-1 block text-xs font-medium text-slate-500">
              採用ペルソナ
            </label>
            <Select value={personaId} onChange={(e) => setPersonaId(e.target.value)}>
              {personas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}（v{p.version}）
                </option>
              ))}
            </Select>
          </div>
          <div className="min-w-[200px]">
            <label className="mb-1 block text-xs font-medium text-slate-500">対象求人</label>
            <div className="flex h-9 items-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-600">
              {job?.title ?? "—"}
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2 text-xs text-slate-400">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            最終実行: {lastRun ? daysAgo(lastRun) : "本日（自動）"}
          </div>
        </div>
      </Card>

      {/* サマリー */}
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="推薦候補数" value={passed.length} icon={Sparkles} accent sub="必須要件クリア" />
        <StatCard label="平均マッチ度" value={avg} icon={SlidersHorizontal} sub="0-100" />
        <StatCard
          label="Sランク"
          value={passed.filter((r) => r.rank === "S").length}
          sub="最有力"
        />
        <StatCard label="条件外" value={failed.length} icon={Filter} sub="ハード要件未達" />
      </div>

      <div className="mb-4">
        <Tabs
          value={tab}
          onChange={(v) => setTab(v as "reco" | "out")}
          tabs={[
            { value: "reco", label: "推薦候補", count: passed.length },
            { value: "out", label: "条件外", count: failed.length },
          ]}
        />
      </div>

      {/* ツールバー（並び替え・ランク絞り込み） */}
      {tab === "reco" && passed.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="h-8 w-44 text-xs"
            >
              <option value="score">マッチ度が高い順</option>
              <option value="reply">返信可能性が高い順</option>
              <option value="timing">着任が早い順</option>
            </Select>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-400">ランク:</span>
            {RANK_ORDER.map((r) => (
              <button
                key={r}
                onClick={() => toggleRank(r)}
                className={cn(
                  "h-7 w-7 rounded-md text-xs font-bold transition",
                  rankFilter.includes(r) ? RANK_META[r].className : "bg-slate-100 text-slate-400 hover:bg-slate-200",
                )}
              >
                {r}
              </button>
            ))}
            {rankFilter.length > 0 && (
              <button onClick={() => setRankFilter([])} className="ml-1 text-xs text-slate-400 hover:text-slate-600">
                解除
              </button>
            )}
          </div>
          <span className="ml-auto text-xs text-slate-400">{displayed.length} 名を表示</span>
        </div>
      )}

      {/* 推薦候補 */}
      {tab === "reco" ? (
        scoring ? (
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-44 rounded-xl border border-slate-200 skeleton" />
            ))}
            <p className="text-center text-xs text-slate-400">AIが候補者を再スコアリングしています…</p>
          </div>
        ) : displayed.length === 0 ? (
          <EmptyState icon={Sparkles} title="推薦候補がありません" description="絞り込みを解除するか、条件を見直してください。" />
        ) : (
          <div className="space-y-4">
            {displayed.map((r) => {
              const c = candidateById(r.candidateId);
              if (!c) return null;
              return (
                <AiRecommendationCard
                  key={r.candidateId}
                  candidate={c}
                  result={r}
                  persona={persona}
                  onOpenDetail={setDetailId}
                  onScout={setScoutId}
                  compareSelected={compare.includes(c.id)}
                  onToggleCompare={toggleCompare}
                />
              );
            })}
          </div>
        )
      ) : (
        <div className="space-y-2">
          {failed.map((r) => {
            const c = candidateById(r.candidateId);
            if (!c) return null;
            return (
              <Card key={r.candidateId} className="flex items-center justify-between p-4">
                <div>
                  <button
                    onClick={() => setDetailId(c.id)}
                    className="text-sm font-medium text-slate-700 hover:text-brand-700"
                  >
                    {c.displayName}
                  </button>
                  <p className="text-xs text-slate-400">{c.headline}</p>
                </div>
                <div className="flex flex-wrap justify-end gap-1.5">
                  {r.failedRequirements.map((f, i) => (
                    <span
                      key={i}
                      className="rounded-md bg-rose-50 px-2 py-0.5 text-[11px] text-rose-600"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ドロワー & スカウト */}
      <CandidateDetailDrawer
        candidate={detailId ? candidateById(detailId) ?? null : null}
        persona={persona}
        open={detailId !== null}
        onClose={() => setDetailId(null)}
        onScout={(id) => {
          setDetailId(null);
          setScoutId(id);
        }}
      />
      <ScoutComposer
        open={scoutId !== null}
        onClose={() => setScoutId(null)}
        candidate={scoutId ? candidateById(scoutId) ?? null : null}
        result={scoutId ? matchCandidate(persona, candidateById(scoutId)!) : null}
        persona={persona}
      />
      <CompareTray
        ids={compare}
        persona={persona}
        onRemove={toggleCompare}
        onClear={() => setCompare([])}
      />
    </PageContainer>
  );
}

export default function AiRecommendationsPage() {
  return (
    <Suspense fallback={<PageContainer title="AI推薦">読み込み中…</PageContainer>}>
      <RecommendationsInner />
    </Suspense>
  );
}
