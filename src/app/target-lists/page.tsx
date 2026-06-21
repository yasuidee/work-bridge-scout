"use client";

import { useMemo, useState } from "react";
import { Plus, Target, X, Sparkles, UserPlus } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from "@/components/ui";
import { EmptyState } from "@/components/common/EmptyState";
import { MatchScoreBadge } from "@/components/ai/MatchScoreBadge";
import { candidateById, CANDIDATES } from "@/lib/mock/candidates";
import { SCOUTS } from "@/lib/mock/activity";
import { matchAll, matchCandidate } from "@/lib/matching";
import { PERSONAS } from "@/lib/mock/personas";
import { useAllPersonas, useAppStore } from "@/lib/store";
import { toast } from "@/lib/toast";
import type { MatchRank } from "@/lib/types";

const sentSet = new Set(SCOUTS.filter((s) => s.status === "送信済").map((s) => s.candidateId));

// 候補者の最良ランク（全ペルソナ横断）
function bestRank(candidateId: string): { rank: MatchRank; score: number } {
  const c = candidateById(candidateId);
  if (!c) return { rank: "C", score: 0 };
  let best = { rank: "C" as MatchRank, score: -1 };
  for (const p of PERSONAS) {
    const r = matchCandidate(p, c);
    if (r.hardRequirementPassed && r.score > best.score) best = { rank: r.rank, score: r.score };
  }
  return best.score < 0 ? { rank: "C", score: 0 } : best;
}

export default function TargetListsPage() {
  const personas = useAllPersonas();
  const lists = useAppStore((s) => s.targetLists);
  const createTargetList = useAppStore((s) => s.createTargetList);
  const addToTargetList = useAppStore((s) => s.addToTargetList);
  const removeFromTargetList = useAppStore((s) => s.removeFromTargetList);
  const feedbacks = useAppStore((s) => s.feedbacks);

  const [newName, setNewName] = useState("");

  const inAnyList = useMemo(
    () => new Set(lists.flatMap((l) => l.candidateIds)),
    [lists],
  );

  // AI推薦からの自動追加候補（どのリストにも未追加の上位）
  const suggestions = useMemo(() => {
    const top = matchAll(personas[0], CANDIDATES).filter((r) => !inAnyList.has(r.candidateId));
    return top.slice(0, 4);
  }, [personas, inAnyList]);

  return (
    <PageContainer
      title="ターゲットリスト"
      description="スカウト対象の候補者をリストで管理します。AI推薦から自動で追加候補を提案します。"
      actions={
        <div className="flex gap-2">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="新しいリスト名"
            className="w-48"
          />
          <Button
            onClick={() => {
              if (newName.trim()) {
                createTargetList(newName.trim());
                toast(`リスト「${newName.trim()}」を作成しました`);
                setNewName("");
              }
            }}
          >
            <Plus className="h-4 w-4" /> 作成
          </Button>
        </div>
      }
    >
      {/* AI推薦からの自動追加候補 */}
      {suggestions.length > 0 && (
        <Card className="mb-5 border-violet-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-ai-from" /> AI推薦からの自動追加候補
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {suggestions.map((r) => {
                const c = candidateById(r.candidateId);
                if (!c) return null;
                return (
                  <div key={r.candidateId} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
                    <MatchScoreBadge score={r.score} rank={r.rank} size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-800">{c.displayName}</p>
                      <p className="truncate text-xs text-slate-400">{c.headline}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        addToTargetList(lists[0]?.id ?? "tl-default", c.id);
                        toast(`「${c.displayName}」を追加しました`);
                      }}
                    >
                      <UserPlus className="h-3.5 w-3.5" /> 追加
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* リスト一覧 */}
      <div className="space-y-5">
        {lists.length === 0 && <EmptyState icon={Target} title="リストがありません" description="右上から新しいリストを作成してください。" />}
        {lists.map((l) => {
          const rows = l.candidateIds.map((id) => ({ id, ...bestRank(id) }));
          const counts = {
            A: rows.filter((r) => r.rank === "S" || r.rank === "A").length,
            B: rows.filter((r) => r.rank === "B").length,
            unrated: l.candidateIds.filter((id) => !feedbacks.some((f) => f.candidateId === id)).length,
            unscouted: l.candidateIds.filter((id) => !sentSet.has(id)).length,
          };
          return (
            <Card key={l.id}>
              <CardHeader className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-brand-600" /> {l.name}
                  <span className="text-xs font-normal text-slate-400">（{l.candidateIds.length}名）</span>
                </CardTitle>
                <div className="flex gap-1.5 text-[11px]">
                  <span className="rounded bg-brand-50 px-2 py-0.5 text-brand-700">S/A {counts.A}</span>
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-slate-600">B {counts.B}</span>
                  <span className="rounded bg-amber-50 px-2 py-0.5 text-amber-700">未評価 {counts.unrated}</span>
                  <span className="rounded bg-rose-50 px-2 py-0.5 text-rose-600">未スカウト {counts.unscouted}</span>
                </div>
              </CardHeader>
              <CardContent>
                {rows.length === 0 ? (
                  <p className="py-4 text-center text-sm text-slate-400">候補者が登録されていません</p>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {rows.map((r) => {
                      const c = candidateById(r.id);
                      if (!c) return null;
                      return (
                        <div key={r.id} className="flex items-center gap-3 py-2.5">
                          <span className="flex h-6 w-6 items-center justify-center rounded text-[11px] font-bold ai-gradient text-white">
                            {r.rank}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-slate-700">{c.displayName}</p>
                            <p className="truncate text-xs text-slate-400">{c.headline}</p>
                          </div>
                          {!sentSet.has(r.id) && (
                            <span className="rounded bg-rose-50 px-1.5 py-0.5 text-[10px] text-rose-500">未スカウト</span>
                          )}
                          <button onClick={() => removeFromTargetList(l.id, r.id)} className="text-slate-300 hover:text-rose-500">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
}
