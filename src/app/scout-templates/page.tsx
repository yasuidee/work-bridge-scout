"use client";

import { useState } from "react";
import { FileText, Pencil, Plus, Sparkles } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card, Button } from "@/components/ui";
import { TemplateEditor } from "@/components/templates/TemplateEditor";
import { SCOUT_TEMPLATES, type ScoutTemplate } from "@/lib/mock/templates";

export default function ScoutTemplatesPage() {
  const [editing, setEditing] = useState<ScoutTemplate | null>(null);
  const [open, setOpen] = useState(false);

  return (
    <PageContainer
      title="スカウトテンプレート"
      description="差し込み変数つきのテンプレート。AI推薦理由・訴求軸を文面に差し込めます。"
      actions={
        <Button variant="ai" onClick={() => { setEditing(null); setOpen(true); }}>
          <Plus className="h-4 w-4" /> 新規テンプレート
        </Button>
      }
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {SCOUT_TEMPLATES.map((t) => (
          <Card key={t.id} className="flex flex-col p-5">
            <div className="mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4 text-brand-600" />
              <h3 className="text-sm font-semibold text-slate-800">{t.name}</h3>
            </div>
            <p className="mb-2 text-xs font-medium text-slate-500">{t.subject}</p>
            <p className="line-clamp-3 flex-1 whitespace-pre-wrap text-xs text-slate-400">{t.body}</p>
            {t.body.includes("{AI推薦理由}") && (
              <p className="mt-3 inline-flex w-fit items-center gap-1 rounded bg-violet-50 px-2 py-0.5 text-[11px] text-violet-700">
                <Sparkles className="h-3 w-3" /> AI推薦理由を差し込み
              </p>
            )}
            <div className="mt-3">
              <Button variant="outline" size="sm" onClick={() => { setEditing(t); setOpen(true); }}>
                <Pencil className="h-3.5 w-3.5" /> 編集
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <TemplateEditor key={editing?.id ?? "new"} open={open} onClose={() => setOpen(false)} template={editing} />
    </PageContainer>
  );
}
