"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui";
import { EmptyState } from "@/components/common/EmptyState";
import { CandidateMeta } from "@/components/candidates/CandidateMeta";
import { CandidateDetailDrawer } from "@/components/candidates/CandidateDetailDrawer";
import { candidateById } from "@/lib/mock/candidates";
import { PERSONAS } from "@/lib/mock/personas";
import { useAppStore } from "@/lib/store";

export default function FavoritesPage() {
  const favorites = useAppStore((s) => s.favorites);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const [detailId, setDetailId] = useState<string | null>(null);

  return (
    <PageContainer title="気になるリスト" description="気になる候補者をブックマークして後から確認できます。">
      {favorites.length === 0 ? (
        <EmptyState icon={Heart} title="気になる候補者がいません" description="候補者詳細から「気になる」を押すと、ここに表示されます。" />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {favorites.map((id) => {
            const c = candidateById(id);
            if (!c) return null;
            return (
              <Card key={id} className="p-5">
                <div className="mb-3 flex items-start justify-between">
                  <button onClick={() => setDetailId(id)} className="text-left">
                    <p className="text-sm font-semibold text-slate-800 hover:text-brand-700">{c.displayName}</p>
                    <p className="text-xs text-slate-400">{c.headline}</p>
                  </button>
                  <button onClick={() => toggleFavorite(id)}>
                    <Heart className="h-4 w-4 fill-rose-400 text-rose-400" />
                  </button>
                </div>
                <CandidateMeta c={c} />
              </Card>
            );
          })}
        </div>
      )}

      <CandidateDetailDrawer
        candidate={detailId ? candidateById(detailId) ?? null : null}
        persona={PERSONAS[0]}
        open={detailId !== null}
        onClose={() => setDetailId(null)}
      />
    </PageContainer>
  );
}
