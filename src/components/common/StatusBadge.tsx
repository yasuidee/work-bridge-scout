import { Badge } from "@/components/ui";
import type { JobStatus } from "@/lib/types";

const MAP: Record<string, string> = {
  公開中: "bg-emerald-50 text-emerald-700",
  下書き: "bg-slate-100 text-slate-500",
  審査中: "bg-amber-50 text-amber-700",
  停止中: "bg-rose-50 text-rose-600",
  送信済: "bg-brand-50 text-brand-700",
  送信待ち: "bg-amber-50 text-amber-700",
  開封: "bg-violet-50 text-violet-700",
  返信あり: "bg-emerald-50 text-emerald-700",
  未返信: "bg-slate-100 text-slate-500",
};

export function StatusBadge({ status }: { status: JobStatus | string }) {
  return <Badge className={MAP[status] ?? "bg-slate-100 text-slate-600"}>{status}</Badge>;
}
