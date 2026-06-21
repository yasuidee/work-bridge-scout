"use client";

import { HelpCircle, ChevronDown, Search } from "lucide-react";
import { TENANT } from "@/lib/constants";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur">
      <div className="flex items-center gap-4">
        <div className="text-sm font-medium text-slate-700">{TENANT.companyName}</div>
        <button
          onClick={() => window.dispatchEvent(new Event("open-command-palette"))}
          className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-400 transition hover:bg-slate-100 md:flex"
        >
          <Search className="h-3.5 w-3.5" />
          候補者・ペルソナを検索
          <kbd className="rounded border border-slate-200 bg-white px-1 text-[10px] text-slate-400">⌘K</kbd>
        </button>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-1.5 text-xs text-slate-500 md:flex">
          今月のスカウト残数
          <span className="font-semibold text-brand-700">
            {TENANT.scoutQuota - TENANT.scoutUsed} / {TENANT.scoutQuota} 通
          </span>
        </div>
        <button className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700">
          <HelpCircle className="h-4 w-4" />
          ヘルプ
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
            採用
          </div>
          <span className="hidden text-sm text-slate-600 md:inline">採用担当者</span>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </div>
      </div>
    </header>
  );
}
