"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Sparkles,
  Users,
  UserRound,
  CornerDownLeft,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { NAV } from "@/components/layout/nav";
import { CANDIDATES } from "@/lib/mock/candidates";
import { PERSONAS } from "@/lib/mock/personas";

type Item = { id: string; label: string; sub: string; icon: LucideIcon; href: string; group: string };

function buildItems(): Item[] {
  const pages: Item[] = NAV.flatMap((g) =>
    g.items.map((it) => ({
      id: `page-${it.href}`,
      label: it.label,
      sub: g.group,
      icon: it.icon,
      href: it.href,
      group: "ページ",
    })),
  );
  const personas: Item[] = PERSONAS.map((p) => ({
    id: `persona-${p.id}`,
    label: p.name,
    sub: "採用ペルソナ",
    icon: Sparkles,
    href: `/ai-recommendations?personaId=${p.id}`,
    group: "ペルソナ",
  }));
  const candidates: Item[] = CANDIDATES.map((c) => ({
    id: `cand-${c.id}`,
    label: c.displayName,
    sub: c.headline,
    icon: UserRound,
    href: `/candidates/search?focus=${c.id}`,
    group: "候補者",
  }));
  return [...pages, ...personas, ...candidates];
}

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);

  const items = useMemo(buildItems, []);

  const filtered = useMemo(() => {
    if (!q.trim()) return items.filter((i) => i.group === "ページ" || i.group === "ペルソナ").slice(0, 8);
    const t = q.toLowerCase();
    return items.filter((i) => (i.label + i.sub).toLowerCase().includes(t)).slice(0, 12);
  }, [q, items]);

  // ⌘K / Ctrl+K でトグル
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-command-palette", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-command-palette", onOpen);
    };
  }, []);

  useEffect(() => {
    setActive(0);
  }, [q]);

  useEffect(() => {
    if (open) setQ("");
  }, [open]);

  if (!open) return null;

  const go = (item: Item) => {
    setOpen(false);
    router.push(item.href);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-start justify-center p-4 pt-[12vh]">
      <div className="animate-fade-in absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="animate-scale-in relative z-10 w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center gap-2.5 border-b border-slate-100 px-4">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(filtered.length - 1, a + 1)); }
              if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(0, a - 1)); }
              if (e.key === "Enter" && filtered[active]) go(filtered[active]);
            }}
            placeholder="候補者・ペルソナ・ページを検索…"
            className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
          <kbd className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-400">ESC</kbd>
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-slate-400">該当する項目がありません</p>
          ) : (
            filtered.map((item, i) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(item)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left",
                    i === active ? "bg-brand-50" : "hover:bg-slate-50",
                  )}
                >
                  <span className={cn("flex h-7 w-7 items-center justify-center rounded-lg", i === active ? "bg-white text-brand-600" : "bg-slate-100 text-slate-500")}>
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-slate-800">{item.label}</span>
                    <span className="block truncate text-xs text-slate-400">{item.sub}</span>
                  </span>
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-400">{item.group}</span>
                  {i === active && <CornerDownLeft className="h-3.5 w-3.5 text-slate-300" />}
                </button>
              );
            })
          )}
        </div>
        <div className="flex items-center gap-3 border-t border-slate-100 bg-slate-50/60 px-4 py-2 text-[11px] text-slate-400">
          <span className="flex items-center gap-1"><Users className="h-3 w-3" /> 横断検索</span>
          <span>↑↓ 移動</span>
          <span>⏎ 開く</span>
          <span className="ml-auto">⌘K で開閉</span>
        </div>
      </div>
    </div>
  );
}
