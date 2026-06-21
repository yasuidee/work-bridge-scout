import { UsersRound } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui";
import { Badge } from "@/components/ui";

const GROUPS = [
  { name: "海外営業チーム", members: 6, role: "採用担当", jobs: 3 },
  { name: "エンジニア採用", members: 4, role: "採用担当", jobs: 2 },
  { name: "製造・現場採用", members: 5, role: "調整担当", jobs: 2 },
  { name: "EC・マーケ採用", members: 3, role: "AI評価者", jobs: 3 },
];

export default function GroupsPage() {
  return (
    <PageContainer title="グループ一覧" description="採用グループとメンバー構成です。">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {GROUPS.map((g) => (
          <Card key={g.name} className="p-5">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50">
                <UsersRound className="h-4.5 w-4.5 text-brand-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{g.name}</p>
                <p className="text-xs text-slate-400">{g.members} 名</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs">
              <Badge className="bg-brand-50 text-brand-700">{g.role}</Badge>
              <span className="text-slate-400">担当求人 {g.jobs} 件</span>
            </div>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
