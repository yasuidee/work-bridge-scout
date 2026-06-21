"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import { WEIGHT_KEYS, WEIGHT_LABELS } from "@/lib/constants";
import type { MatchResult } from "@/lib/types";

// サブスコア9軸のレーダーチャート（説明可能性を一目で）
export function MatchRadar({ result, height = 240 }: { result: MatchResult; height?: number }) {
  const data = WEIGHT_KEYS.map((k) => ({
    axis: WEIGHT_LABELS[k],
    value: Math.round(result.breakdown[k] * 100),
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <RadarChart data={data} outerRadius="72%">
        <defs>
          <linearGradient id="radarFill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.45} />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.45} />
          </linearGradient>
        </defs>
        <PolarGrid stroke="#e2e8f0" />
        <PolarAngleAxis dataKey="axis" tick={{ fontSize: 10, fill: "#64748b" }} />
        <Radar dataKey="value" stroke="#6366f1" strokeWidth={2} fill="url(#radarFill)" />
      </RadarChart>
    </ResponsiveContainer>
  );
}
