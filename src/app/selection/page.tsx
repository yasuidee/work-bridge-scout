"use client";

import { useState } from "react";
import { CalendarClock, X, Star } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui";
import { SELECTIONS, STAGES, type SelectionRow } from "@/lib/mock/activity";
import { candidateById } from "@/lib/mock/candidates";
import { jobById } from "@/lib/mock/jobs";

const STAGE_COLOR: Record<string, string> = {
  応募: "border-t-slate-300",
  書類選考: "border-t-blue-300",
  一次面接: "border-t-violet-300",
  最終面接: "border-t-amber-300",
  内定: "border-t-emerald-400",
};

export default function SelectionPage() {
  const [selected, setSelected] = useState<SelectionRow | null>(null);

  return (
    <PageContainer title="進捗管理" description="応募から内定までの選考ステージを管理します。">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {STAGES.map((stage) => {
          const rows = SELECTIONS.filter((s) => s.stage === stage);
          return (
            <div key={stage} className="rounded-xl bg-slate-100/60 p-2">
              <div className="mb-2 flex items-center justify-between px-2 pt-1">
                <span className="text-xs font-semibold text-slate-600">{stage}</span>
                <span className="rounded-full bg-white px-1.5 text-[11px] text-slate-500">{rows.length}</span>
              </div>
              <div className="space-y-2">
                {rows.map((s) => {
                  const c = candidateById(s.candidateId);
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSelected(s)}
                      className={`w-full rounded-lg border border-t-2 bg-white p-3 text-left shadow-sm transition hover:shadow ${STAGE_COLOR[stage]}`}
                    >
                      <p className="text-sm font-medium text-slate-800">{c?.displayName}</p>
                      <p className="truncate text-[11px] text-slate-400">{jobById(s.jobId)?.title}</p>
                      <p className="mt-1.5 flex items-center gap-1 text-[11px] text-brand-600">
                        <CalendarClock className="h-3 w-3" /> {s.nextAction}
                      </p>
                    </button>
                  );
                })}
                {rows.length === 0 && <p className="px-2 py-4 text-center text-[11px] text-slate-300">なし</p>}
              </div>
            </div>
          );
        })}
      </div>

      {/* サイドパネル */}
      {selected && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-slate-900/30" onClick={() => setSelected(null)} />
          <div className="absolute inset-y-0 right-0 w-full max-w-md overflow-y-auto bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{candidateById(selected.candidateId)?.displayName}</h2>
                <p className="text-sm text-slate-500">{jobById(selected.jobId)?.title}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <Card className="p-4">
                <p className="mb-1 text-xs font-semibold text-slate-500">現ステージ</p>
                <p className="text-sm font-medium text-brand-700">{selected.stage}</p>
              </Card>
              <Card className="p-4">
                <p className="mb-1 flex items-center gap-1 text-xs font-semibold text-slate-500">
                  <CalendarClock className="h-3.5 w-3.5" /> 面接日程
                </p>
                <p className="text-sm text-slate-700">{selected.nextAction}</p>
                <p className="mt-1 text-xs text-slate-400">担当: {selected.evaluator}</p>
              </Card>
              <div>
                <p className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-slate-500">
                  <Star className="h-3.5 w-3.5" /> 評価メモ
                </p>
                <textarea
                  rows={5}
                  placeholder="面接の評価を記録"
                  className="w-full rounded-lg border border-slate-300 p-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
