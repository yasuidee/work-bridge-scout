"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, RotateCcw } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { SearchFilterCard } from "@/components/common/SearchFilterCard";
import { DataTable, type Column } from "@/components/common/DataTable";
import { CandidateDetailDrawer } from "@/components/candidates/CandidateDetailDrawer";
import { Button, Input, Label, Select } from "@/components/ui";
import { JLPT_LABELS, EN_LABELS, VISA_LABELS } from "@/lib/constants";
import { CANDIDATES } from "@/lib/mock/candidates";
import { EN_ORDER, JLPT_ORDER, VISA_STATUSES, type Candidate } from "@/lib/types";
import { matchCandidate } from "@/lib/matching";
import { fmtSalary, residenceLabel } from "@/lib/format";
import { useAllPersonas } from "@/lib/store";

type Filters = {
  q: string;
  japanese: string;
  english: string;
  residence: "all" | "in" | "out";
  visa: string;
  salaryMin: string;
  startTiming: string;
  intentToJapan: boolean; // 来日意向
};

const EMPTY: Filters = {
  q: "",
  japanese: "",
  english: "",
  residence: "all",
  visa: "",
  salaryMin: "",
  startTiming: "",
  intentToJapan: false,
};

export default function CandidateSearchPage() {
  const personas = useAllPersonas();
  const [personaId, setPersonaId] = useState(personas[0]?.id ?? "");
  const persona = personas.find((p) => p.id === personaId);

  const [f, setF] = useState<Filters>(EMPTY);
  const [detailId, setDetailId] = useState<string | null>(null);
  const set = (patch: Partial<Filters>) => setF((p) => ({ ...p, ...patch }));

  // コマンドパレットからの ?focus=候補者ID で詳細を開く
  useEffect(() => {
    const focus = new URLSearchParams(window.location.search).get("focus");
    if (focus && CANDIDATES.some((c) => c.id === focus)) setDetailId(focus);
  }, []);

  const rows = useMemo(() => {
    const list = CANDIDATES.filter((c) => {
      if (f.q) {
        const hay = (c.displayName + c.headline + c.skills.join() + c.currentRole).toLowerCase();
        if (!hay.includes(f.q.toLowerCase())) return false;
      }
      if (f.japanese && JLPT_ORDER.indexOf(c.languages.japanese) < JLPT_ORDER.indexOf(f.japanese as Candidate["languages"]["japanese"]))
        return false;
      if (f.english && EN_ORDER.indexOf(c.languages.english) < EN_ORDER.indexOf(f.english as Candidate["languages"]["english"]))
        return false;
      if (f.residence === "in" && !c.residence.inJapan) return false;
      if (f.residence === "out" && c.residence.inJapan) return false;
      if (f.visa && c.workAuthorization.status !== f.visa) return false;
      if (f.salaryMin && c.desiredConditions.salaryMin < Number(f.salaryMin)) return false;
      if (f.startTiming && !c.desiredConditions.startTiming.includes(f.startTiming)) return false;
      if (f.intentToJapan && c.residence.inJapan && !c.tags.includes("来日意向")) return false;
      return true;
    });
    // AI マッチ度で降順
    return list
      .map((c) => ({ c, r: persona ? matchCandidate(persona, c) : null }))
      .sort((a, b) => (b.r?.score ?? 0) - (a.r?.score ?? 0));
  }, [f, persona]);

  type Row = { id: string; c: Candidate; r: ReturnType<typeof matchCandidate> | null };
  const tableRows: Row[] = rows.map(({ c, r }) => ({ id: c.id, c, r }));

  const columns: Column<Row>[] = [
    {
      key: "name",
      header: "候補者",
      render: (row) => (
        <div>
          <p className="font-medium text-slate-800">{row.c.displayName}</p>
          <p className="text-xs text-slate-400">{row.c.headline}</p>
        </div>
      ),
    },
    {
      key: "lang",
      header: "語学",
      render: (row) => (
        <span className="text-xs text-slate-600">
          {JLPT_LABELS[row.c.languages.japanese].replace("日本語 ", "日本語")} /{" "}
          {EN_LABELS[row.c.languages.english].replace("英語 ", "英")}
        </span>
      ),
    },
    {
      key: "visa",
      header: "在留資格",
      render: (row) => <span className="text-xs text-slate-600">{VISA_LABELS[row.c.workAuthorization.status]}</span>,
    },
    {
      key: "res",
      header: "在住",
      render: (row) => <span className="text-xs text-slate-600">{residenceLabel(row.c)}</span>,
    },
    {
      key: "salary",
      header: "希望年収",
      render: (row) => (
        <span className="text-xs text-slate-600">
          {fmtSalary(row.c.desiredConditions.salaryMin, row.c.desiredConditions.salaryMax)}
        </span>
      ),
    },
    {
      key: "match",
      header: "AIマッチ度",
      className: "w-28",
      render: (row) => {
        if (!row.r) return "—";
        const passed = row.r.hardRequirementPassed;
        return (
          <div className="flex items-center gap-2">
            <span
              className={
                "flex h-6 w-6 items-center justify-center rounded text-[11px] font-bold " +
                (passed ? "ai-gradient text-white" : "bg-slate-200 text-slate-500")
              }
            >
              {passed ? row.r.rank : "—"}
            </span>
            <span className={passed ? "text-sm font-semibold text-slate-700" : "text-sm text-slate-400"}>
              {passed ? row.r.score : "条件外"}
            </span>
          </div>
        );
      },
    },
  ];

  return (
    <PageContainer
      title="候補者検索"
      description="外国籍・グローバル人材に特化した条件で候補者DBを検索します。AIマッチ度つきで一覧表示します。"
    >
      <div className="mb-4">
        <SearchFilterCard
          footer={
            <>
              <Button variant="ghost" onClick={() => setF(EMPTY)}>
                <RotateCcw className="h-3.5 w-3.5" /> リセット
              </Button>
              <Button>
                <Search className="h-3.5 w-3.5" /> {tableRows.length} 件
              </Button>
            </>
          }
        >
          <div>
            <Label>キーワード（職種・スキル）</Label>
            <Input value={f.q} onChange={(e) => set({ q: e.target.value })} placeholder="例: 海外営業 / React" />
          </div>
          <div>
            <Label>日本語レベル（以上）</Label>
            <Select value={f.japanese} onChange={(e) => set({ japanese: e.target.value })}>
              <option value="">指定なし</option>
              {JLPT_ORDER.map((j) => (
                <option key={j} value={j}>{JLPT_LABELS[j]}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label>英語レベル（以上）</Label>
            <Select value={f.english} onChange={(e) => set({ english: e.target.value })}>
              <option value="">指定なし</option>
              {EN_ORDER.map((j) => (
                <option key={j} value={j}>{EN_LABELS[j]}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label>在住</Label>
            <Select value={f.residence} onChange={(e) => set({ residence: e.target.value as Filters["residence"] })}>
              <option value="all">国内・海外問わず</option>
              <option value="in">国内在住</option>
              <option value="out">海外在住</option>
            </Select>
          </div>
          <div>
            <Label>在留資格</Label>
            <Select value={f.visa} onChange={(e) => set({ visa: e.target.value })}>
              <option value="">指定なし</option>
              {VISA_STATUSES.map((v) => (
                <option key={v} value={v}>{VISA_LABELS[v]}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label>就業開始可能時期（含む）</Label>
            <Input value={f.startTiming} onChange={(e) => set({ startTiming: e.target.value })} placeholder="例: 即日 / 1ヶ月" />
          </div>
          <div>
            <Label>希望年収 下限（万円）</Label>
            <Input type="number" value={f.salaryMin} onChange={(e) => set({ salaryMin: e.target.value })} />
          </div>
          <div>
            <Label>マッチ度の評価ペルソナ</Label>
            <Select value={personaId} onChange={(e) => setPersonaId(e.target.value)}>
              {personas.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </Select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={f.intentToJapan}
                onChange={(e) => set({ intentToJapan: e.target.checked })}
                className="h-4 w-4 rounded accent-brand-600"
              />
              来日意向ありに絞る
            </label>
          </div>
        </SearchFilterCard>
      </div>

      <DataTable columns={columns} rows={tableRows} onRowClick={(row) => setDetailId(row.id)} />

      <CandidateDetailDrawer
        candidate={detailId ? CANDIDATES.find((c) => c.id === detailId) ?? null : null}
        persona={persona}
        open={detailId !== null}
        onClose={() => setDetailId(null)}
      />
    </PageContainer>
  );
}
