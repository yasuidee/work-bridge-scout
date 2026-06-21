import {
  Languages,
  IdCard,
  MapPin,
  Wallet,
  CalendarClock,
  MessageSquareReply,
} from "lucide-react";
import { JLPT_LABELS, EN_LABELS, VISA_LABELS } from "@/lib/constants";
import { fmtSalary, residenceLabel } from "@/lib/format";
import type { Candidate } from "@/lib/types";

// 主要属性（語学・在留資格・在住地・希望年収・着任時期・返信可能性）
// ※ 国籍/年齢/性別 等の属性は一切表示しない (§3)
export function CandidateMeta({ c }: { c: Candidate }) {
  const items = [
    {
      icon: Languages,
      label: `${JLPT_LABELS[c.languages.japanese]} / ${EN_LABELS[c.languages.english].replace("英語 ", "英語")}`,
    },
    { icon: IdCard, label: VISA_LABELS[c.workAuthorization.status] },
    { icon: MapPin, label: residenceLabel(c) },
    {
      icon: Wallet,
      label: `希望 ${fmtSalary(c.desiredConditions.salaryMin, c.desiredConditions.salaryMax)}`,
    },
    { icon: CalendarClock, label: `着任 ${c.desiredConditions.startTiming}` },
    { icon: MessageSquareReply, label: `返信可能性 ${c.replyLikelihood}%` },
  ];
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-3">
      {items.map((it, i) => {
        const Icon = it.icon;
        return (
          <div key={i} className="flex items-center gap-1.5 text-xs text-slate-500">
            <Icon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span className="truncate">{it.label}</span>
          </div>
        );
      })}
    </div>
  );
}
