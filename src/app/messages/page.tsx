"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, Tabs } from "@/components/ui";
import { EmptyState } from "@/components/common/EmptyState";
import { MessageThread } from "@/components/messages/MessageThread";
import { MessageSquare } from "lucide-react";
import { THREADS } from "@/lib/mock/activity";
import { candidateById } from "@/lib/mock/candidates";

export default function MessagesPage() {
  const [box, setBox] = useState<"inbox" | "sent" | "draft">("inbox");
  const list = THREADS.filter((t) => t.box === box);
  const [selectedId, setSelectedId] = useState<string | null>(THREADS[0]?.id ?? null);
  const selected = THREADS.find((t) => t.id === selectedId) ?? list[0] ?? null;

  return (
    <PageContainer title="メッセージ" description="候補者とのやり取り。AIが返信要約と返信案を提示します。">
      <div className="mb-4">
        <Tabs
          value={box}
          onChange={(v) => setBox(v as "inbox" | "sent" | "draft")}
          tabs={[
            { value: "inbox", label: "受信", count: THREADS.filter((t) => t.box === "inbox").length },
            { value: "sent", label: "送信", count: THREADS.filter((t) => t.box === "sent").length },
            { value: "draft", label: "下書き", count: THREADS.filter((t) => t.box === "draft").length },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[300px,1fr]">
        {/* スレッド一覧 */}
        <Card className="overflow-hidden">
          {list.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-400">メッセージがありません</div>
          ) : (
            <ul>
              {list.map((t) => {
                const c = candidateById(t.candidateId);
                const last = t.messages[t.messages.length - 1];
                return (
                  <li key={t.id}>
                    <button
                      onClick={() => setSelectedId(t.id)}
                      className={cn(
                        "flex w-full flex-col gap-0.5 border-b border-slate-50 px-4 py-3 text-left transition",
                        selected?.id === t.id ? "bg-brand-50/50" : "hover:bg-slate-50",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-800">{c?.displayName}</span>
                        {t.unread && <span className="h-2 w-2 rounded-full bg-brand-500" />}
                      </div>
                      <span className="truncate text-xs text-slate-400">{last?.text}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        {/* スレッド本体 */}
        <Card className="min-h-[520px] overflow-hidden">
          {selected ? (
            <MessageThread key={selected.id} thread={selected} />
          ) : (
            <EmptyState icon={MessageSquare} title="スレッドを選択してください" />
          )}
        </Card>
      </div>
    </PageContainer>
  );
}
