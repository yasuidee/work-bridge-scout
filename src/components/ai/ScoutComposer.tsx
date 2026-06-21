"use client";

import { useEffect, useMemo, useState } from "react";
import { Send, Sparkles, Check } from "lucide-react";
import { Modal } from "@/components/overlay";
import { Button, Label, Select, Textarea, Input } from "@/components/ui";
import { TENANT } from "@/lib/constants";
import { toast } from "@/lib/toast";
import { SCOUT_TEMPLATES } from "@/lib/mock/templates";
import { jobById } from "@/lib/mock/jobs";
import type { Candidate, MatchResult, Persona } from "@/lib/types";

// 差し込み変数を実値で置換（AI推薦理由・訴求軸を注入できるのが肝）
function fill(
  tpl: string,
  vars: Record<string, string>,
): string {
  return tpl.replace(/\{(.+?)\}/g, (_, k: string) => vars[k] ?? `{${k}}`);
}

export function ScoutComposer({
  open,
  onClose,
  candidate,
  result,
  persona,
}: {
  open: boolean;
  onClose: () => void;
  candidate: Candidate | null;
  result: MatchResult | null;
  persona: Persona | null;
}) {
  const [templateId, setTemplateId] = useState(SCOUT_TEMPLATES[0].id);
  const [sent, setSent] = useState(false);

  const vars = useMemo(() => {
    if (!candidate || !result) return null;
    const job = persona ? jobById(persona.jobId) : undefined;
    return {
      候補者名: candidate.displayName,
      会社名: TENANT.companyName,
      求人名: job?.title ?? persona?.name ?? "募集ポジション",
      AI推薦理由: result.reasons.map((r) => `・${r}`).join("\n"),
      訴求軸: result.scoutAngles.map((s) => `・${s}`).join("\n"),
      スキル: candidate.skills.slice(0, 3).join("・"),
      面談URL: "https://work-bridge.example/meet/xxxx",
    } as Record<string, string>;
  }, [candidate, result, persona]);

  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  // テンプレ/候補者変更時に初期文面を生成（AI推薦理由・訴求軸を差し込み）
  useEffect(() => {
    const t = SCOUT_TEMPLATES.find((x) => x.id === templateId) ?? SCOUT_TEMPLATES[0];
    if (vars) {
      setSubject(fill(t.subject, vars));
      setBody(fill(t.body, vars));
    }
  }, [vars, templateId]);

  if (!candidate || !result) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="スカウト作成"
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            キャンセル
          </Button>
          <Button
            variant="ai"
            onClick={() => {
              setSent(true);
              toast(`「${candidate.displayName}」へスカウトを送信しました`, "ai");
              setTimeout(() => {
                setSent(false);
                onClose();
              }, 1200);
            }}
          >
            {sent ? <Check className="h-4 w-4" /> : <Send className="h-4 w-4" />}
            {sent ? "送信しました" : "スカウトを送信"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2 rounded-lg border border-violet-100 bg-violet-50/60 px-3 py-2 text-xs text-violet-700">
          <Sparkles className="h-4 w-4" />
          AI推薦理由・訴求軸を文面に自動差し込み済み（編集可能）
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>宛先</Label>
            <Input value={`${candidate.displayName}（マッチ ${result.score} / ${result.rank}）`} readOnly />
          </div>
          <div>
            <Label>テンプレート</Label>
            <Select
              value={templateId}
              onChange={(e) => setTemplateId(e.target.value)}
            >
              {SCOUT_TEMPLATES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div>
          <Label>件名</Label>
          <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
        </div>
        <div>
          <Label>本文</Label>
          <Textarea
            rows={14}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="font-mono text-xs leading-relaxed"
          />
        </div>
      </div>
    </Modal>
  );
}
