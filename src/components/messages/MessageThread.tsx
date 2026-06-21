"use client";

import { useState } from "react";
import { Sparkles, Send, Wand2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button, Textarea } from "@/components/ui";
import { candidateById } from "@/lib/mock/candidates";
import type { MessageThreadData } from "@/lib/mock/activity";

// 簡易ルールでAI返信要約・返信案を生成（将来 LLM に差し替え可能）
function aiSummary(thread: MessageThreadData): string {
  const last = [...thread.messages].reverse().find((m) => m.from === "candidate");
  if (!last) return "候補者からの返信はまだありません。";
  if (/カジュアル|情報交換/.test(last.text)) return "前向き。まずはカジュアル面談を希望しています。";
  if (/日程|来週|可能/.test(last.text)) return "面談に前向き。日程調整を求めています。";
  return "返信あり。関心を示しています。";
}

function aiDraft(thread: MessageThreadData): string {
  const c = candidateById(thread.candidateId);
  const name = c?.displayName ?? "ご担当者";
  const last = [...thread.messages].reverse().find((m) => m.from === "candidate");
  if (last && /カジュアル|情報交換/.test(last.text)) {
    return `${name} 様\n\nありがとうございます。まずは30分ほどのカジュアル面談はいかがでしょうか。\n下記いずれかでご都合の良い日時をお知らせください。\n・6/24(水) 14:00-\n・6/25(木) 18:00-\nオンラインでも対応可能です。`;
  }
  return `${name} 様\n\nご返信ありがとうございます。ぜひ一度お話しさせてください。\n直近の候補日時を3つほどお送りいたしますので、ご都合をお聞かせください。`;
}

export function MessageThread({ thread }: { thread: MessageThreadData }) {
  const c = candidateById(thread.candidateId);
  const [draft, setDraft] = useState("");

  return (
    <div className="flex h-full flex-col">
      {/* ヘッダー */}
      <div className="border-b border-slate-100 px-5 py-3">
        <p className="text-sm font-semibold text-slate-800">{c?.displayName}</p>
        <p className="text-xs text-slate-400">{c?.headline}</p>
      </div>

      {/* AI パネル */}
      <div className="m-4 rounded-xl border border-violet-100 bg-violet-50/50 p-3">
        <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-violet-700">
          <Sparkles className="h-3.5 w-3.5" /> AI返信要約
        </p>
        <p className="text-xs text-slate-600">{aiSummary(thread)}</p>
        <Button size="sm" variant="ai" className="mt-2.5" onClick={() => setDraft(aiDraft(thread))}>
          <Wand2 className="h-3.5 w-3.5" /> AI返信案を生成
        </Button>
      </div>

      {/* スレッド */}
      <div className="flex-1 space-y-3 overflow-y-auto px-5 pb-4">
        {thread.messages.map((m, i) => (
          <div key={i} className={cn("flex", m.from === "company" ? "justify-end" : "justify-start")}>
            <div className={cn("max-w-[80%] rounded-2xl px-3.5 py-2 text-sm", m.from === "company" ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-700")}>
              <p className="whitespace-pre-wrap">{m.text}</p>
              <p className={cn("mt-1 text-[10px]", m.from === "company" ? "text-white/70" : "text-slate-400")}>{m.at}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 返信欄 */}
      <div className="border-t border-slate-100 p-4">
        <Textarea
          rows={4}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="返信を入力、または「AI返信案を生成」"
        />
        <div className="mt-2 flex justify-end">
          <Button size="sm">
            <Send className="h-3.5 w-3.5" /> 送信
          </Button>
        </div>
      </div>
    </div>
  );
}
