"use client";

import { useRouter } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { PersonaFormWizard } from "@/components/personas/PersonaFormWizard";
import { useAppStore } from "@/lib/store";

export default function NewPersonaPage() {
  const router = useRouter();
  const addPersona = useAppStore((s) => s.addPersona);

  return (
    <PageContainer
      title="採用ペルソナの作成"
      description="構造化された条件と重み付けを登録すると、AIが候補者を理由つきで評価します。"
    >
      <PersonaFormWizard
        onComplete={(p) => {
          addPersona(p);
          router.push(`/ai-recommendations?personaId=${p.id}`);
        }}
      />
    </PageContainer>
  );
}
