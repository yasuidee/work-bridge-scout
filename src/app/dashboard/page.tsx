"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  Target,
  Briefcase,
  ArrowRight,
  Crown,
  Lightbulb,
  Send,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardContent, CardHeader, CardTitle, Button } from "@/components/ui";
import { StatCard } from "@/components/common/StatCard";
import { MatchScoreBadge } from "@/components/ai/MatchScoreBadge";
import { CandidateDetailDrawer } from "@/components/candidates/CandidateDetailDrawer";
import { CANDIDATES, candidateById } from "@/lib/mock/candidates";
import { JOBS } from "@/lib/mock/jobs";
import { matchAll } from "@/lib/matching";
import { TENANT } from "@/lib/constants";
import { useAllPersonas, useAppStore } from "@/lib/store";

export default function DashboardPage() {
  const router = useRouter();
  const personas = useAllPersonas();
  const targetLists = useAppStore((s) => s.targetLists);
  const feedbacks = useAppStore((s) => s.feedbacks);

  const [detailId, setDetailId] = useState<string | null>(null);
  const [detailPersonaId, setDetailPersonaId] = useState<string>(personas[0]?.id ?? "");

  const targetTotal = targetLists.reduce((s, l) => s + l.candidateIds.length, 0);
  const openJobs = JOBS.filter((j) => j.status === "公開中");

  return (
    <PageContainer
      title="ダッシュボード"
      description={`${TENANT.companyName} の採用活動サマリー`}
    >
      {/* サマリー */}
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="AI推薦（合計）" value={personas.reduce((s, p) => s + matchAll(p, CANDIDATES).length, 0)} icon={Sparkles} accent sub="全ペルソナ" />
        <StatCard label="ターゲット候補" value={targetTotal} icon={Target} sub={`${targetLists.length}リスト`} />
        <StatCard label="公開中の求人" value={openJobs.length} icon={Briefcase} sub={`全${JOBS.length}件`} />
        <StatCard label="記録した評価" value={feedbacks.length} sub="フィードバック" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr,300px]">
        {/* メイン */}
        <div className="space-y-5">
          {/* AI ピックアップ候補者（主役） */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg ai-gradient">
                  <Sparkles className="h-3.5 w-3.5 text-white" />
                </span>
                本日のAIピックアップ候補者
              </CardTitle>
              <Link href="/ai-recommendations" className="text-xs font-medium text-brand-600 hover:underline">
                すべて見る
              </Link>
            </CardHeader>
            <CardContent className="space-y-5">
              {personas.slice(0, 3).map((p) => {
                const top = matchAll(p, CANDIDATES).slice(0, 4);
                return (
                  <div key={p.id}>
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs font-semibold text-slate-500">
                        ペルソナ「{p.name}」のおすすめ
                      </p>
                      <button
                        onClick={() => router.push(`/ai-recommendations?personaId=${p.id}`)}
                        className="text-[11px] text-brand-600 hover:underline"
                      >
                        推薦一覧 →
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {top.map((r) => {
                        const c = candidateById(r.candidateId);
                        if (!c) return null;
                        return (
                          <button
                            key={r.candidateId}
                            onClick={() => {
                              setDetailPersonaId(p.id);
                              setDetailId(c.id);
                            }}
                            className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 text-left transition hover:border-brand-200 hover:bg-brand-50/30"
                          >
                            <MatchScoreBadge score={r.score} rank={r.rank} size="sm" />
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-slate-800">{c.displayName}</p>
                              <p className="truncate text-xs text-slate-400">{c.headline}</p>
                              <p className="mt-0.5 truncate text-[11px] text-emerald-600">
                                {r.reasons[0]}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* 求人別ファネル */}
          <Card>
            <CardHeader>
              <CardTitle>求人別ファネル</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {openJobs.slice(0, 5).map((j) => {
                  const persona = personas.find((p) => j.personaIds.includes(p.id));
                  const reco = persona ? matchAll(persona, CANDIDATES).length : 0;
                  return (
                    <div key={j.id} className="flex items-center gap-3">
                      <div className="w-44 shrink-0">
                        <p className="truncate text-sm font-medium text-slate-700">{j.title}</p>
                        <p className="text-[11px] text-slate-400">{j.location}</p>
                      </div>
                      <Funnel label="AI推薦" value={reco} color="bg-violet-400" max={20} />
                      <Funnel label="スカウト" value={j.scoutsCount} color="bg-brand-400" max={40} />
                      <Funnel label="応募" value={j.applicantsCount} color="bg-emerald-400" max={20} />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右カラム */}
        <div className="space-y-5">
          {/* ターゲットリスト要約 */}
          <Card>
            <CardHeader>
              <CardTitle>ターゲットリスト要約</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {targetLists.map((l) => (
                <Link
                  key={l.id}
                  href="/target-lists"
                  className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 hover:bg-slate-50"
                >
                  <span className="truncate text-sm text-slate-600">{l.name}</span>
                  <span className="text-sm font-semibold text-brand-700">{l.candidateIds.length}</span>
                </Link>
              ))}
              <Button variant="outline" size="sm" className="w-full" onClick={() => router.push("/target-lists")}>
                ターゲットリストへ <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </CardContent>
          </Card>

          {/* プラン・残数 */}
          <Card className="overflow-hidden">
            <div className="ai-gradient px-5 py-4 text-white">
              <p className="flex items-center gap-1.5 text-xs"><Crown className="h-4 w-4" /> {TENANT.planName} プラン</p>
              <p className="mt-2 text-2xl font-bold">
                {TENANT.scoutQuota - TENANT.scoutUsed}
                <span className="text-sm font-normal"> / {TENANT.scoutQuota} 通</span>
              </p>
              <p className="text-xs text-white/80">今月のスカウト残数</p>
            </div>
          </Card>

          {/* ご利用ステップ */}
          <Card>
            <CardHeader>
              <CardTitle>ご利用ステップ</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2.5">
                <Step done icon={Briefcase} text="求人を作成する" href="/jobs" />
                <Step done icon={Sparkles} text="採用ペルソナを登録する" href="/personas/new" />
                <Step done icon={Target} text="AI推薦からターゲット追加" href="/ai-recommendations" />
                <Step icon={Send} text="スカウトを送信する" href="/scout-history" />
              </ol>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="border-violet-100 bg-violet-50/40">
            <CardContent className="flex gap-2">
              <Lightbulb className="h-4 w-4 shrink-0 text-violet-500" />
              <p className="text-xs leading-relaxed text-slate-600">
                重み付けを調整すると推薦順位が変わります。返信率が伸び悩むペルソナは「カルチャー」より「就労資格・着任」の重みを上げると、今動ける候補者が上位に来やすくなります。
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <CandidateDetailDrawer
        candidate={detailId ? candidateById(detailId) ?? null : null}
        persona={personas.find((p) => p.id === detailPersonaId)}
        open={detailId !== null}
        onClose={() => setDetailId(null)}
      />
    </PageContainer>
  );
}

function Funnel({ label, value, color, max }: { label: string; value: number; color: string; max: number }) {
  return (
    <div className="flex-1">
      <div className="mb-0.5 flex items-center justify-between text-[10px] text-slate-400">
        <span>{label}</span>
        <span className="font-semibold text-slate-600">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={color + " h-full rounded-full"} style={{ width: `${Math.min(100, (value / max) * 100)}%` }} />
      </div>
    </div>
  );
}

function Step({
  done,
  icon: Icon,
  text,
  href,
}: {
  done?: boolean;
  icon: typeof Briefcase;
  text: string;
  href: string;
}) {
  return (
    <li>
      <Link href={href} className="flex items-center gap-2.5 text-sm text-slate-600 hover:text-brand-700">
        {done ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        ) : (
          <Circle className="h-4 w-4 text-slate-300" />
        )}
        <Icon className="h-3.5 w-3.5 text-slate-400" />
        {text}
      </Link>
    </li>
  );
}
