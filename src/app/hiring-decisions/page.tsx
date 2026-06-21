"use client";

import { Trophy } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui";
import { DataTable, type Column } from "@/components/common/DataTable";
import { EmptyState } from "@/components/common/EmptyState";
import { SELECTIONS, type SelectionRow } from "@/lib/mock/activity";
import { candidateById } from "@/lib/mock/candidates";
import { jobById } from "@/lib/mock/jobs";

export default function HiringDecisionsPage() {
  const decided = SELECTIONS.filter((s) => s.stage === "内定");

  const columns: Column<SelectionRow>[] = [
    { key: "cand", header: "候補者", render: (s) => <span className="font-medium text-slate-800">{candidateById(s.candidateId)?.displayName}</span> },
    { key: "job", header: "求人", render: (s) => <span className="text-xs text-slate-600">{jobById(s.jobId)?.title}</span> },
    { key: "status", header: "ステータス", render: () => <span className="rounded bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700">内定</span> },
    { key: "next", header: "次のアクション", render: (s) => <span className="text-xs text-slate-500">{s.nextAction}</span> },
  ];

  return (
    <PageContainer title="採用決定" description="内定・採用が確定した候補者の一覧です。">
      {decided.length === 0 ? (
        <EmptyState icon={Trophy} title="採用決定はまだありません" />
      ) : (
        <Card className="overflow-hidden">
          <DataTable columns={columns} rows={decided} />
        </Card>
      )}
    </PageContainer>
  );
}
