"use client";

import { useState } from "react";
import { Eye, Code } from "lucide-react";
import { Modal } from "@/components/overlay";
import { Button, Input, Label, Textarea } from "@/components/ui";
import type { ScoutTemplate } from "@/lib/mock/templates";

// 差し込み変数（AI推薦理由を差し込めるのが肝）
export const SCOUT_VARS = [
  "{候補者名}",
  "{会社名}",
  "{求人名}",
  "{AI推薦理由}",
  "{訴求軸}",
  "{スキル}",
  "{面談URL}",
];

const SAMPLE: Record<string, string> = {
  "{候補者名}": "候補 R.T.",
  "{会社名}": "株式会社グローバルブリッジ採用",
  "{求人名}": "海外SaaS営業（APAC新規開拓）",
  "{AI推薦理由}": "・必須スキル2/2を保有（法人営業・英語商談）\n・日本語N1で要件N2を上回る",
  "{訴求軸}": "・リモート可を前面に\n・越境SaaSの裁量を訴求",
  "{スキル}": "法人営業・英語商談・Salesforce",
  "{面談URL}": "https://work-bridge.example/meet/xxxx",
};

function preview(text: string): string {
  return text.replace(/\{(.+?)\}/g, (m) => SAMPLE[m] ?? m);
}

export function TemplateEditor({
  open,
  onClose,
  template,
}: {
  open: boolean;
  onClose: () => void;
  template: ScoutTemplate | null;
}) {
  const [subject, setSubject] = useState(template?.subject ?? "");
  const [body, setBody] = useState(template?.body ?? "");
  const [mode, setMode] = useState<"edit" | "preview">("edit");

  const insert = (v: string) => setBody((b) => b + v);

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={template ? `テンプレート編集: ${template.name}` : "新規テンプレート"}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>キャンセル</Button>
          <Button onClick={onClose}>保存</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex gap-1">
          <Button size="sm" variant={mode === "edit" ? "primary" : "outline"} onClick={() => setMode("edit")}>
            <Code className="h-3.5 w-3.5" /> 編集
          </Button>
          <Button size="sm" variant={mode === "preview" ? "primary" : "outline"} onClick={() => setMode("preview")}>
            <Eye className="h-3.5 w-3.5" /> プレビュー
          </Button>
        </div>

        {mode === "edit" ? (
          <>
            <div>
              <Label>件名</Label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>
            <div>
              <Label>差し込み変数（クリックで本文に挿入）</Label>
              <div className="flex flex-wrap gap-1.5">
                {SCOUT_VARS.map((v) => (
                  <button
                    key={v}
                    onClick={() => insert(v)}
                    className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] text-slate-600 hover:bg-brand-50 hover:text-brand-700"
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>本文</Label>
              <Textarea rows={12} value={body} onChange={(e) => setBody(e.target.value)} className="font-mono text-xs" />
            </div>
          </>
        ) : (
          <div className="rounded-lg border border-slate-200 bg-slate-50/50 p-4">
            <p className="mb-2 text-sm font-semibold text-slate-700">{preview(subject)}</p>
            <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-slate-600">
              {preview(body)}
            </pre>
          </div>
        )}
      </div>
    </Modal>
  );
}
