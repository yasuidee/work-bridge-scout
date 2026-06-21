import { cn } from "@/lib/cn";
import { RANK_META } from "@/lib/constants";
import type { MatchRank } from "@/lib/types";

export function MatchScoreBadge({
  score,
  rank,
  size = "md",
}: {
  score: number;
  rank: MatchRank;
  size?: "sm" | "md" | "lg";
}) {
  const meta = RANK_META[rank];
  const sizes = {
    sm: "h-10 w-10 text-sm",
    md: "h-14 w-14 text-lg",
    lg: "h-16 w-16 text-xl",
  };
  return (
    <div className="flex flex-col items-center">
      <div
        className={cn(
          "flex flex-col items-center justify-center rounded-xl font-bold leading-none shadow-sm",
          sizes[size],
          meta.className,
        )}
      >
        <span>{rank}</span>
      </div>
      <span className="mt-1 text-xs font-semibold text-slate-500">
        マッチ {score}
      </span>
    </div>
  );
}
