"use client";

import { useState } from "react";
import { MailOpen, Mail, Reply, Clock } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Tabs } from "@/components/ui";
import { DataTable, type Column } from "@/components/common/DataTable";
import { StatCard } from "@/components/common/StatCard";
import { StatusBadge } from "@/components/common/StatusBadge";
import { SCOUTS, type ScoutRow } from "@/lib/mock/activity";
import { candidateById } from "@/lib/mock/candidates";
import { personaById } from "@/lib/mock/personas";

export default function ScoutHistoryPage() {
  const [tab, setTab] = useState<"送信済" | "送信待ち">("送信済");
  const rows = SCOUTS.filter((s) => s.status === tab);

  const sent = SCOUTS.filter((s) => s.status === "送信済");
  const openedRate = sent.length ? Math.round((sent.filter((s) => s.opened).length / sent.length) * 100) : 0;
  const replyRate = sent.length ? Math.round((sent.filter((s) => s.replied).length / sent.length) * 100) : 0;

  const columns: Column<ScoutRow>[] = [
    {
      key: "cand",
      header: "候補者",
      render: (s) => {
        const c = candidateById(s.candidateId);
        return (
          <div>
            <p className="font-medium text-slate-800">{c?.displayName}</p>
            <p className="text-xs text-slate-400">{c?.headline}</p>
          </div>
        );
      },
    },
    { key: "persona", header: "ペルソナ", render: (s) => <span className="text-xs text-slate-600">{personaById(s.personaId)?.name ?? "—"}</span> },
    { key: "sent", header: "送信日", render: (s) => <span className="text-xs text-slate-500">{s.sentAt}</span> },
    {
      key: "opened",
      header: "開封",
      className: "w-20",
      render: (s) =>
        s.status === "送信待ち" ? (
          <span className="text-xs text-slate-300">—</span>
        ) : s.opened ? (
          <StatusBadge status="開封" />
        ) : (
          <span className="text-xs text-slate-400">未開封</span>
        ),
    },
    {
      key: "reply",
      header: "返信",
      className: "w-24",
      render: (s) =>
        s.status === "送信待ち" ? (
          <span className="text-xs text-slate-300">—</span>
        ) : (
          <StatusBadge status={s.replied ? "返信あり" : "未返信"} />
        ),
    },
    { key: "status", header: "ステータス", className: "w-24", render: (s) => <StatusBadge status={s.status} /> },
  ];

  return (
    <PageContainer title="スカウト送信履歴" description="送信済み・送信待ちのスカウトと、開封・返信状況を管理します。">
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="送信済" value={sent.length} icon={Mail} />
        <StatCard label="送信待ち" value={SCOUTS.length - sent.length} icon={Clock} />
        <StatCard label="開封率" value={`${openedRate}%`} icon={MailOpen} accent />
        <StatCard label="返信率" value={`${replyRate}%`} icon={Reply} accent />
      </div>
      <div className="mb-4">
        <Tabs
          value={tab}
          onChange={(v) => setTab(v as "送信済" | "送信待ち")}
          tabs={[
            { value: "送信済", label: "送信済", count: sent.length },
            { value: "送信待ち", label: "送信待ち", count: SCOUTS.length - sent.length },
          ]}
        />
      </div>
      <DataTable columns={columns} rows={rows} />
    </PageContainer>
  );
}
