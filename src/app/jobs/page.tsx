"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Sparkles } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button, Input, Label, Select, Tabs } from "@/components/ui";
import { DataTable, type Column } from "@/components/common/DataTable";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Modal } from "@/components/overlay";
import { JOBS } from "@/lib/mock/jobs";
import { fmtSalary } from "@/lib/format";
import { JOB_CATEGORIES } from "@/lib/constants";
import { useAllPersonas } from "@/lib/store";
import type { Job } from "@/lib/types";

const TABS = ["すべて", "公開中", "下書き", "審査中", "停止中"];

export default function JobsPage() {
  const router = useRouter();
  const personas = useAllPersonas();
  const [tab, setTab] = useState("すべて");
  const [open, setOpen] = useState(false);

  const rows = JOBS.filter((j) => tab === "すべて" || j.status === tab);

  const columns: Column<Job>[] = [
    {
      key: "title",
      header: "求人",
      render: (j) => (
        <div>
          <p className="font-medium text-slate-800">{j.title}</p>
          <p className="text-xs text-slate-400">{j.jobCategory} ・ {j.location}</p>
        </div>
      ),
    },
    { key: "salary", header: "年収", render: (j) => <span className="text-xs text-slate-600">{fmtSalary(j.salaryMin, j.salaryMax)}</span> },
    {
      key: "persona",
      header: "紐づくペルソナ",
      render: (j) => {
        const ps = personas.filter((p) => j.personaIds.includes(p.id));
        return ps.length ? (
          <div className="flex flex-wrap gap-1">
            {ps.map((p) => (
              <span key={p.id} className="inline-flex items-center gap-1 rounded-md bg-violet-50 px-1.5 py-0.5 text-[11px] text-violet-700">
                <Sparkles className="h-3 w-3" /> {p.name}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-xs text-slate-300">未設定</span>
        );
      },
    },
    { key: "applicants", header: "応募", className: "w-16 text-center", render: (j) => <span className="text-sm font-medium">{j.applicantsCount}</span> },
    { key: "scouts", header: "スカウト", className: "w-20 text-center", render: (j) => <span className="text-sm font-medium">{j.scoutsCount}</span> },
    { key: "status", header: "ステータス", className: "w-24", render: (j) => <StatusBadge status={j.status} /> },
  ];

  return (
    <PageContainer
      title="求人一覧"
      description="募集中の求人と、紐づく採用ペルソナを管理します。"
      actions={
        <Button variant="ai" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> 求人を作成
        </Button>
      }
    >
      <div className="mb-4">
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={TABS.map((t) => ({
            value: t,
            label: t,
            count: t === "すべて" ? JOBS.length : JOBS.filter((j) => j.status === t).length,
          }))}
        />
      </div>

      <DataTable
        columns={columns}
        rows={rows}
        onRowClick={(j) => {
          const p = personas.find((x) => j.personaIds.includes(x.id));
          if (p) router.push(`/ai-recommendations?personaId=${p.id}`);
        }}
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="求人を作成（簡易）"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>キャンセル</Button>
            <Button onClick={() => setOpen(false)}>下書き保存</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <Label>求人タイトル</Label>
            <Input placeholder="例: 海外SaaS営業（APAC新規開拓）" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>職種</Label>
              <Select>
                {JOB_CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label>勤務地</Label>
              <Input placeholder="例: 東京都" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>年収下限（万円）</Label>
              <Input type="number" defaultValue={500} />
            </div>
            <div>
              <Label>年収上限（万円）</Label>
              <Input type="number" defaultValue={800} />
            </div>
          </div>
          <p className="text-xs text-slate-400">※ 作成後、採用ペルソナを紐づけるとAI推薦が利用できます。</p>
        </div>
      </Modal>
    </PageContainer>
  );
}
