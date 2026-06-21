import { Check, Minus } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui";

const ROLES = ["グループ管理者", "採用担当", "調整担当", "AI評価者", "閲覧のみ"];
const PERMISSIONS = [
  "求人の作成・編集",
  "ペルソナの作成・編集",
  "AI推薦の実行",
  "スカウト送信",
  "メッセージ対応",
  "選考ステータス変更",
  "レポート閲覧",
  "メンバー・権限管理",
];
// 各権限 × 役割の許可（true=許可）
const MATRIX: boolean[][] = [
  [true, true, true, true, false],
  [true, true, true, true, false],
  [true, true, true, false, false],
  [true, true, false, false, false],
  [true, true, true, true, false],
  [true, true, true, false, false],
  [true, true, true, true, true],
  [true, false, false, false, false],
];

export default function RolesPage() {
  return (
    <PageContainer title="役割一覧" description="役割ごとの権限設定です。">
      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500">権限</th>
              {ROLES.map((r) => (
                <th key={r} className="px-4 py-3 text-center text-xs font-semibold text-slate-500">{r}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERMISSIONS.map((perm, i) => (
              <tr key={perm} className="border-b border-slate-50 last:border-0">
                <td className="px-4 py-3 text-slate-700">{perm}</td>
                {ROLES.map((_, j) => (
                  <td key={j} className="px-4 py-3 text-center">
                    {MATRIX[i][j] ? (
                      <Check className="mx-auto h-4 w-4 text-emerald-500" />
                    ) : (
                      <Minus className="mx-auto h-4 w-4 text-slate-200" />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </PageContainer>
  );
}
