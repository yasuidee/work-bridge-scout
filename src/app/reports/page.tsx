"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Info, TrendingUp } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { StatCard } from "@/components/common/StatCard";
import { FunnelReport } from "@/components/reports/FunnelReport";

const TREND = [
  { month: "1月", reply: 28, meeting: 12 },
  { month: "2月", reply: 31, meeting: 14 },
  { month: "3月", reply: 30, meeting: 15 },
  { month: "4月", reply: 34, meeting: 18 },
  { month: "5月", reply: 36, meeting: 19 },
  { month: "6月", reply: 41, meeting: 22 },
];

const BY_PERSONA = [
  { name: "海外SaaS営業", reply: 44, meeting: 24 },
  { name: "EC運営", reply: 38, meeting: 20 },
  { name: "SaaS CS", reply: 35, meeting: 18 },
  { name: "現場責任者", reply: 30, meeting: 15 },
  { name: "ECマーケ", reply: 33, meeting: 16 },
];

export default function ReportsPage() {
  return (
    <PageContainer title="振り返りレポート" description="スカウト活動の成果を可視化します。">
      <div className="mb-3 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
        <Info className="h-3.5 w-3.5" />
        本ページの数値は機能デモ用の説明的なダミーデータです。
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard label="スカウト数" value={120} />
        <StatCard label="開封率" value="72%" />
        <StatCard label="返信率" value="34%" accent />
        <StatCard label="面談化率" value="18%" accent />
        <StatCard label="内定率" value="5%" />
      </div>

      {/* AI vs 通常検索 比較 */}
      <Card className="mb-5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-ai-from" /> AI推薦 vs 通常検索（返信率・面談化率）
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <Compare label="返信率" ai={41} normal={26} />
            <Compare label="面談化率" ai={22} normal={11} />
          </div>
          <p className="mt-3 text-[11px] text-slate-400">※ 比較値は説明用のダミーです。実データ連携時に置き換えます。</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>返信率・面談化率の推移</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={TREND} margin={{ left: -16, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="reply" name="返信率" stroke="#6366f1" strokeWidth={2} />
                <Line type="monotone" dataKey="meeting" name="面談化率" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>ペルソナ別の成果</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={BY_PERSONA} margin={{ left: -16, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} interval={0} />
                <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: "#f8fafc" }} />
                <Legend />
                <Bar dataKey="reply" name="返信率" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="meeting" name="面談化率" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>採用ファネル</CardTitle></CardHeader>
          <CardContent>
            <FunnelReport />
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}

function Compare({ label, ai, normal }: { label: string; ai: number; normal: number }) {
  return (
    <div className="rounded-xl border border-slate-100 p-4">
      <p className="mb-2 text-sm font-medium text-slate-600">{label}</p>
      <div className="space-y-2">
        <Bar2 label="AI推薦" value={ai} color="ai-gradient" max={50} />
        <Bar2 label="通常検索" value={normal} color="bg-slate-300" max={50} />
      </div>
      <p className="mt-2 text-xs text-emerald-600">+{ai - normal}pt の改善</p>
    </div>
  );
}

function Bar2({ label, value, color, max }: { label: string; value: number; color: string; max: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-16 shrink-0 text-xs text-slate-500">{label}</span>
      <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div className={`${color} h-full rounded-full`} style={{ width: `${(value / max) * 100}%` }} />
      </div>
      <span className="w-9 text-right text-xs font-semibold text-slate-600">{value}%</span>
    </div>
  );
}
