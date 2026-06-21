"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { NAV } from "./nav";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-60 flex-col border-r border-slate-200 bg-white">
      {/* ロゴ */}
      <div className="flex h-14 items-center border-b border-slate-100 px-5">
        <Link href="/dashboard" aria-label="JobseeQ ホーム">
          <Image
            src="/jobseeq-logo.png"
            alt="JobseeQ"
            width={1073}
            height={253}
            priority
            className="h-[30px] w-auto"
          />
        </Link>
      </div>

      {/* ナビ */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {NAV.map((g) => (
          <div key={g.group} className="mb-5">
            <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {g.group}
            </p>
            <ul className="space-y-0.5">
              {g.items.map((item) => {
                const active =
                  pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition",
                        active
                          ? "bg-brand-50 font-medium text-brand-700"
                          : "text-slate-600 hover:bg-slate-50",
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          active
                            ? item.ai
                              ? "text-ai-from"
                              : "text-brand-600"
                            : "text-slate-400 group-hover:text-slate-500",
                        )}
                      />
                      <span className="truncate">{item.label}</span>
                      {item.ai && (
                        <span className="ml-auto rounded bg-gradient-to-r from-ai-from to-ai-to px-1 py-0.5 text-[9px] font-bold text-white">
                          AI
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
