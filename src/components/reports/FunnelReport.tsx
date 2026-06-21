"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";

const DATA = [
  { stage: "スカウト送信", value: 120, fill: "#8b5cf6" },
  { stage: "開封", value: 86, fill: "#6366f1" },
  { stage: "返信", value: 41, fill: "#3b82f6" },
  { stage: "面談", value: 22, fill: "#10b981" },
  { stage: "内定", value: 6, fill: "#059669" },
];

export function FunnelReport() {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={DATA} layout="vertical" margin={{ left: 24, right: 24 }}>
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="stage" width={88} tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
        <Tooltip cursor={{ fill: "#f1f5f9" }} />
        <Bar dataKey="value" radius={[0, 6, 6, 0]} label={{ position: "right", fontSize: 12, fill: "#475569" }}>
          {DATA.map((d, i) => (
            <Cell key={i} fill={d.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
