// スコア内訳（透明性）: 各次元の素点と重みを可視化
import { WEIGHT_KEYS, WEIGHT_LABELS } from "@/lib/constants";
import type { MatchResult, Persona } from "@/lib/types";

export function MatchBreakdown({
  result,
  persona,
}: {
  result: MatchResult;
  persona: Persona;
}) {
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
      {WEIGHT_KEYS.map((k) => {
        const sub = result.breakdown[k];
        const weight = persona.weights[k];
        const pct = Math.round(sub * 100);
        return (
          <div key={k} className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-xs text-slate-500">
              {WEIGHT_LABELS[k]}
            </span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-brand-400"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="w-9 shrink-0 text-right text-[11px] tabular-nums text-slate-400">
              {pct}
            </span>
            <span className="w-8 shrink-0 text-right text-[10px] tabular-nums text-slate-300">
              ×{weight}
            </span>
          </div>
        );
      })}
    </div>
  );
}
