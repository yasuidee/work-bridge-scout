import { Mail } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui";
import { MESSAGE_TEMPLATES } from "@/lib/mock/templates";

export default function MessageTemplatesPage() {
  return (
    <PageContainer title="メッセージテンプレート" description="選考連絡で使う定型文です。">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {MESSAGE_TEMPLATES.map((t) => (
          <Card key={t.id} className="p-4">
            <p className="mb-1 flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Mail className="h-4 w-4 text-brand-600" /> {t.name}
            </p>
            <p className="text-xs text-slate-500">{t.body}</p>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
