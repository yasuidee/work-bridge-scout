"use client";

import { RotateCcw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/cn";
import { DEFAULT_WEIGHTS, WEIGHT_KEYS, WEIGHT_LABELS } from "@/lib/constants";
import type { PersonaWeights } from "@/lib/types";

// §8 Step7 重み付け（スライダー＋数値、合計100強制、超過警告、推奨に戻す）
export function PersonaWeightEditor({
  weights,
  onChange,
}: {
  weights: PersonaWeights;
  onChange: (w: PersonaWeights) => void;
}) {
  const total = WEIGHT_KEYS.reduce((s, k) => s + weights[k], 0);
  const ok = total === 100;

  const set = (k: keyof PersonaWeights, v: number) =>
    onChange({ ...weights, [k]: Math.max(0, Math.min(60, v)) });

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium",
            ok ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700",
          )}
        >
          {!ok && <AlertTriangle className="h-4 w-4" />}
          合計 {total} / 100
          {!ok && <span className="text-xs">（{total > 100 ? "超過" : "不足"}）</span>}
        </div>
        <Button variant="outline" size="sm" onClick={() => onChange({ ...DEFAULT_WEIGHTS })}>
          <RotateCcw className="h-3.5 w-3.5" /> 推奨バランスに戻す
        </Button>
      </div>

      <div className="space-y-3">
        {WEIGHT_KEYS.map((k) => (
          <div key={k} className="flex items-center gap-3">
            <span className="w-28 shrink-0 text-sm text-slate-600">{WEIGHT_LABELS[k]}</span>
            <input
              type="range"
              min={0}
              max={60}
              value={weights[k]}
              onChange={(e) => set(k, Number(e.target.value))}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-slate-200 accent-brand-600"
            />
            <input
              type="number"
              min={0}
              max={60}
              value={weights[k]}
              onChange={(e) => set(k, Number(e.target.value))}
              className="h-8 w-14 rounded-lg border border-slate-300 px-2 text-right text-sm outline-none focus:border-brand-500"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
