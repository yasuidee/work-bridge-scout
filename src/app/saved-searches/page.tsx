import Link from "next/link";
import { Bookmark, Search } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, Button } from "@/components/ui";

const SAVED = [
  { name: "日本語N2以上・海外営業", conditions: "日本語N2 / 海外営業 / 国内在住", hits: 8 },
  { name: "越境EC運営（福岡可）", conditions: "EC運営 / Amazon運用 / 福岡県", hits: 3 },
  { name: "英語ネイティブのCS", conditions: "カスタマーサクセス / 英語Fluent以上", hits: 4 },
];

export default function SavedSearchesPage() {
  return (
    <PageContainer
      title="保存した検索条件"
      description="よく使う検索条件を保存して再利用できます。"
      actions={
        <Link href="/candidates/search">
          <Button variant="outline"><Search className="h-4 w-4" /> 検索へ</Button>
        </Link>
      }
    >
      <div className="space-y-3">
        {SAVED.map((s) => (
          <Card key={s.name} className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <Bookmark className="h-4 w-4 text-brand-600" />
              <div>
                <p className="text-sm font-medium text-slate-800">{s.name}</p>
                <p className="text-xs text-slate-400">{s.conditions}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-brand-700">{s.hits} 名</span>
              <Link href="/candidates/search">
                <Button variant="outline" size="sm">この条件で検索</Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
