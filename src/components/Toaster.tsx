"use client";

import { Check, Info, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { useToast } from "@/lib/toast";

const ICONS = {
  success: Check,
  info: Info,
  ai: Sparkles,
};

const STYLES = {
  success: "border-emerald-200 bg-white",
  info: "border-slate-200 bg-white",
  ai: "border-violet-200 bg-white",
};

const ICON_WRAP = {
  success: "bg-emerald-100 text-emerald-600",
  info: "bg-slate-100 text-slate-600",
  ai: "ai-gradient text-white",
};

export function Toaster() {
  const toasts = useToast((s) => s.toasts);
  const dismiss = useToast((s) => s.dismiss);

  return (
    <div className="pointer-events-none fixed bottom-5 right-5 z-[100] flex w-80 flex-col gap-2">
      {toasts.map((t) => {
        const Icon = ICONS[t.kind];
        return (
          <div
            key={t.id}
            className={cn(
              "animate-toast-in pointer-events-auto flex items-start gap-3 rounded-xl border px-3.5 py-3 shadow-lg shadow-slate-900/5",
              STYLES[t.kind],
            )}
          >
            <span className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-lg", ICON_WRAP[t.kind])}>
              <Icon className="h-3.5 w-3.5" />
            </span>
            <p className="flex-1 pt-0.5 text-sm text-slate-700">{t.message}</p>
            <button onClick={() => dismiss(t.id)} className="text-slate-300 hover:text-slate-500">
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
