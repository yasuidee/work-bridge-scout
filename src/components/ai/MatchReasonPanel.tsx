// =============================================================================
// §10 MatchReasonPanel — reasons / concerns / scoutAngles / interviewQuestions
// を 4 ブロックで視覚的に区別して表示（ここが見せ場）
// =============================================================================
import {
  ThumbsUp,
  AlertTriangle,
  Target,
  MessageCircleQuestion,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";
import type { MatchResult } from "@/lib/types";

type BlockSpec = {
  key: keyof Pick<MatchResult, "reasons" | "concerns" | "scoutAngles" | "interviewQuestions">;
  title: string;
  caption: string;
  icon: LucideIcon;
  wrap: string;
  iconWrap: string;
  dot: string;
};

const BLOCKS: BlockSpec[] = [
  {
    key: "reasons",
    title: "なぜ合うか",
    caption: "一致点",
    icon: ThumbsUp,
    wrap: "border-emerald-100 bg-emerald-50/50",
    iconWrap: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-400",
  },
  {
    key: "concerns",
    title: "どこが懸念か",
    caption: "確認すべき点",
    icon: AlertTriangle,
    wrap: "border-amber-100 bg-amber-50/50",
    iconWrap: "bg-amber-100 text-amber-700",
    dot: "bg-amber-400",
  },
  {
    key: "scoutAngles",
    title: "どう刺すか",
    caption: "スカウト訴求軸",
    icon: Target,
    wrap: "border-violet-100 bg-violet-50/50",
    iconWrap: "bg-violet-100 text-violet-700",
    dot: "bg-violet-400",
  },
  {
    key: "interviewQuestions",
    title: "面談で何を聞くか",
    caption: "確認質問",
    icon: MessageCircleQuestion,
    wrap: "border-brand-100 bg-brand-50/50",
    iconWrap: "bg-brand-100 text-brand-700",
    dot: "bg-brand-400",
  },
];

export function MatchReasonPanel({
  result,
  columns = 2,
}: {
  result: MatchResult;
  columns?: 1 | 2;
}) {
  return (
    <div className={cn("grid gap-3", columns === 2 ? "md:grid-cols-2" : "grid-cols-1")}>
      {BLOCKS.map((b) => {
        const items = result[b.key];
        const Icon = b.icon;
        return (
          <div key={b.key} className={cn("rounded-xl border p-4", b.wrap)}>
            <div className="mb-2.5 flex items-center gap-2">
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-lg",
                  b.iconWrap,
                )}
              >
                <Icon className="h-3.5 w-3.5" />
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-800">{b.title}</p>
                <p className="text-[10px] text-slate-400">{b.caption}</p>
              </div>
            </div>
            <ul className="space-y-1.5">
              {items.map((t, i) => (
                <li key={i} className="flex gap-2 text-xs leading-relaxed text-slate-600">
                  <span className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", b.dot)} />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
