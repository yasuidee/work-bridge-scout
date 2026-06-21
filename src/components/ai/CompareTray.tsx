"use client";

import { useState } from "react";
import { GitCompare, X } from "lucide-react";
import { Modal } from "@/components/overlay";
import { Button } from "@/components/ui";
import { MatchScoreBadge } from "./MatchScoreBadge";
import { WEIGHT_KEYS, WEIGHT_LABELS, JLPT_LABELS, EN_LABELS, VISA_LABELS } from "@/lib/constants";
import { fmtSalary } from "@/lib/format";
import { candidateById } from "@/lib/mock/candidates";
import { matchCandidate } from "@/lib/matching";
import { cn } from "@/lib/cn";
import type { Persona, PersonaWeights } from "@/lib/types";

// Stage3: 候補者比較（最大3名を横並びでサブスコア比較）
export function CompareTray({
  ids,
  persona,
  onRemove,
  onClear,
}: {
  ids: string[];
  persona: Persona;
  onRemove: (id: string) => void;
  onClear: () => void;
}) {
  const [open, setOpen] = useState(false);
  if (ids.length === 0) return null;

  const entries = ids
    .map((id) => candidateById(id))
    .filter((c): c is NonNullable<typeof c> => !!c)
    .map((c) => ({ c, r: matchCandidate(persona, c) }));

  // 各次元で最高素点の候補を強調
  const bestByKey = (k: keyof PersonaWeights) =>
    entries.reduce((best, e) => (e.r.breakdown[k] > (best?.r.breakdown[k] ?? -1) ? e : best), entries[0]);

  return (
    <>
      {/* 下部トレイ */}
      <div className="fixed bottom-5 left-1/2 z-40 -translate-x-1/2">
        <div className="animate-toast-in flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 shadow-xl">
          <div className="flex -space-x-2">
            {entries.map((e) => (
              <span
                key={e.c.id}
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-brand-100 text-[11px] font-semibold text-brand-700"
                title={e.c.displayName}
              >
                {e.r.rank}
              </span>
            ))}
          </div>
          <span className="text-sm text-slate-600">{ids.length}名を選択中</span>
          <Button size="sm" variant="ai" onClick={() => setOpen(true)} disabled={ids.length < 2}>
            <GitCompare className="h-3.5 w-3.5" /> 比較する
          </Button>
          <button onClick={onClear} className="text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 比較モーダル */}
      <Modal open={open} onClose={() => setOpen(false)} title={`候補者の比較（${entries.length}名）`} size="lg">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr>
                <th className="w-28" />
                {entries.map((e) => (
                  <th key={e.c.id} className="px-2 pb-3 align-bottom">
                    <div className="flex flex-col items-center gap-1.5">
                      <MatchScoreBadge score={e.r.score} rank={e.r.rank} size="sm" />
                      <span className="text-sm font-semibold text-slate-800">{e.c.displayName}</span>
                      <button onClick={() => onRemove(e.c.id)} className="text-[10px] text-slate-400 hover:text-rose-500">
                        外す
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <Row label="ヘッドライン" cells={entries.map((e) => e.c.headline)} />
              <Row label="日本語 / 英語" cells={entries.map((e) => `${JLPT_LABELS[e.c.languages.japanese].replace("日本語 ", "")} / ${EN_LABELS[e.c.languages.english].replace("英語 ", "")}`)} />
              <Row label="在留資格" cells={entries.map((e) => VISA_LABELS[e.c.workAuthorization.status])} />
              <Row label="希望年収" cells={entries.map((e) => fmtSalary(e.c.desiredConditions.salaryMin, e.c.desiredConditions.salaryMax))} />
              <Row label="返信可能性" cells={entries.map((e) => `${e.c.replyLikelihood}%`)} />
              <tr>
                <td colSpan={entries.length + 1} className="pt-3 pb-1 text-xs font-semibold text-slate-400">
                  サブスコア（最高値を強調）
                </td>
              </tr>
              {WEIGHT_KEYS.map((k) => {
                const best = bestByKey(k);
                return (
                  <tr key={k} className="border-t border-slate-50">
                    <td className="py-1.5 text-xs text-slate-500">{WEIGHT_LABELS[k]}</td>
                    {entries.map((e) => {
                      const v = Math.round(e.r.breakdown[k] * 100);
                      const isBest = e.c.id === best.c.id && entries.length > 1;
                      return (
                        <td key={e.c.id} className="px-2 py-1.5">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                              <div className={cn("h-full rounded-full", isBest ? "ai-gradient" : "bg-slate-300")} style={{ width: `${v}%` }} />
                            </div>
                            <span className={cn("w-7 text-right text-[11px] tabular-nums", isBest ? "font-semibold text-ai-from" : "text-slate-400")}>{v}</span>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Modal>
    </>
  );
}

function Row({ label, cells }: { label: string; cells: string[] }) {
  return (
    <tr className="border-t border-slate-50">
      <td className="py-2 text-xs text-slate-500">{label}</td>
      {cells.map((c, i) => (
        <td key={i} className="px-2 py-2 text-center text-xs text-slate-700">{c}</td>
      ))}
    </tr>
  );
}
