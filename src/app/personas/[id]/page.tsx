"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Sparkles, ArrowLeft } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui";
import { EmptyState } from "@/components/common/EmptyState";
import { PersonaSummaryCard } from "@/components/personas/PersonaSummaryCard";
import { PersonaVersionSwitcher } from "@/components/personas/PersonaVersionSwitcher";
import { PERSONA_HISTORY } from "@/lib/mock/personas";
import { useAllPersonas } from "@/lib/store";

export default function PersonaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const personas = useAllPersonas();
  const persona = personas.find((p) => p.id === id);

  const history = id ? PERSONA_HISTORY[id] : undefined;
  const [version, setVersion] = useState(persona?.version ?? 1);

  if (!persona) {
    return (
      <PageContainer title="採用ペルソナ">
        <EmptyState title="ペルソナが見つかりません" />
      </PageContainer>
    );
  }

  const shown = history?.find((v) => v.version === version) ?? persona;

  return (
    <PageContainer
      title={persona.name}
      description="登録済みペルソナの定義とバージョン履歴。"
      actions={
        <>
          <Button variant="ghost" onClick={() => router.push("/personas")}>
            <ArrowLeft className="h-4 w-4" /> 一覧
          </Button>
          <Button variant="ai" onClick={() => router.push(`/ai-recommendations?personaId=${persona.id}`)}>
            <Sparkles className="h-4 w-4" /> AI推薦を見る
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[260px,1fr]">
        <div>
          {history ? (
            <PersonaVersionSwitcher
              versions={history}
              selected={version}
              onSelect={setVersion}
            />
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 p-4 text-xs text-slate-400">
              このペルソナにはバージョン履歴がありません。
            </div>
          )}
        </div>
        <PersonaSummaryCard persona={shown} />
      </div>
    </PageContainer>
  );
}
