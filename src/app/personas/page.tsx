"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Users, Sparkles, History } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, Button, Badge } from "@/components/ui";
import { CANDIDATES } from "@/lib/mock/candidates";
import { jobById } from "@/lib/mock/jobs";
import { PERSONA_HISTORY } from "@/lib/mock/personas";
import { matchAll } from "@/lib/matching";
import { useAllPersonas } from "@/lib/store";

export default function PersonasPage() {
  const router = useRouter();
  const personas = useAllPersonas();

  return (
    <PageContainer
      title="採用ペルソナ"
      description="登録済みの採用ペルソナ。AIはこの定義に基づいて候補者を評価します。"
      actions={
        <Link href="/personas/new">
          <Button variant="ai">
            <Plus className="h-4 w-4" /> ペルソナを作成
          </Button>
        </Link>
      }
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {personas.map((p) => {
          const job = jobById(p.jobId);
          const reco = matchAll(p, CANDIDATES);
          const top = reco[0];
          const hasHistory = !!PERSONA_HISTORY[p.id];
          return (
            <Card key={p.id} className="flex flex-col p-5">
              <div className="mb-3 flex items-start justify-between">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50">
                  <Users className="h-4.5 w-4.5 text-brand-600" />
                </div>
                <div className="flex items-center gap-1.5">
                  {hasHistory && (
                    <Badge className="bg-slate-100 text-slate-500">
                      <History className="mr-1 h-3 w-3" /> v{p.version}
                    </Badge>
                  )}
                </div>
              </div>
              <h3 className="text-sm font-semibold text-slate-800">{p.name}</h3>
              <p className="mt-0.5 text-xs text-slate-400">{job?.title ?? "未紐付け"}</p>

              <div className="my-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-slate-50 py-2">
                  <p className="text-base font-bold text-slate-800">{reco.length}</p>
                  <p className="text-[10px] text-slate-400">推薦数</p>
                </div>
                <div className="rounded-lg bg-slate-50 py-2">
                  <p className="text-base font-bold text-slate-800">
                    {reco.filter((r) => r.rank === "S").length}
                  </p>
                  <p className="text-[10px] text-slate-400">Sランク</p>
                </div>
                <div className="rounded-lg bg-slate-50 py-2">
                  <p className="text-base font-bold ai-gradient-text">
                    {top?.score ?? "—"}
                  </p>
                  <p className="text-[10px] text-slate-400">最高スコア</p>
                </div>
              </div>

              <div className="mt-auto flex gap-2">
                <Button
                  variant="ai"
                  size="sm"
                  className="flex-1"
                  onClick={() => router.push(`/ai-recommendations?personaId=${p.id}`)}
                >
                  <Sparkles className="h-3.5 w-3.5" /> AI推薦を見る
                </Button>
                <Link href={`/personas/${p.id}`}>
                  <Button variant="outline" size="sm">
                    詳細
                  </Button>
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
}
