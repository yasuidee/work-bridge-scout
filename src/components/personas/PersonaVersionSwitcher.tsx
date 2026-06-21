"use client";

import { History } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Persona } from "@/lib/types";

// §9 ペルソナのバージョン管理（版の一覧と切替）
export function PersonaVersionSwitcher({
  versions,
  selected,
  onSelect,
}: {
  versions: Persona[];
  selected: number;
  onSelect: (version: number) => void;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
        <History className="h-3.5 w-3.5 text-brand-600" /> バージョン履歴
      </p>
      <div className="space-y-1.5">
        {[...versions]
          .sort((a, b) => b.version - a.version)
          .map((v) => (
            <button
              key={v.version}
              onClick={() => onSelect(v.version)}
              className={cn(
                "flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition",
                v.version === selected
                  ? "border-brand-300 bg-brand-50"
                  : "border-slate-200 hover:bg-slate-50",
              )}
            >
              <span className="font-medium text-slate-700">v{v.version}</span>
              <span className="truncate pl-3 text-xs text-slate-400">{v.name}</span>
              {v.version === Math.max(...versions.map((x) => x.version)) && (
                <span className="ml-2 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] text-emerald-600">
                  現行
                </span>
              )}
            </button>
          ))}
      </div>
    </div>
  );
}
