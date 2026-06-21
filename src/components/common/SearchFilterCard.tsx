import { Card } from "@/components/ui";
import { SlidersHorizontal } from "lucide-react";

export function SearchFilterCard({
  title = "検索条件",
  children,
  footer,
}: {
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-brand-600" />
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">{children}</div>
      {footer && <div className="mt-4 flex justify-end gap-2">{footer}</div>}
    </Card>
  );
}
