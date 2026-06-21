import {
  LayoutDashboard,
  Briefcase,
  Sparkles,
  Users,
  Search,
  Bookmark,
  Target,
  Heart,
  Send,
  FileText,
  ListChecks,
  MessageSquare,
  Trophy,
  Mail,
  BarChart3,
  UsersRound,
  ShieldCheck,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = { label: string; href: string; icon: LucideIcon; ai?: boolean };
export type NavGroup = { group: string; items: NavItem[] };

export const NAV: NavGroup[] = [
  {
    group: "ホーム",
    items: [{ label: "ダッシュボード", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    group: "求人",
    items: [{ label: "求人一覧", href: "/jobs", icon: Briefcase }],
  },
  {
    group: "スカウト",
    items: [
      { label: "AI推薦", href: "/ai-recommendations", icon: Sparkles, ai: true },
      { label: "採用ペルソナ", href: "/personas", icon: Users, ai: true },
      { label: "候補者検索", href: "/candidates/search", icon: Search },
      { label: "保存した検索条件", href: "/saved-searches", icon: Bookmark },
      { label: "ターゲットリスト", href: "/target-lists", icon: Target },
      { label: "気になるリスト", href: "/favorites", icon: Heart },
      { label: "スカウト送信履歴", href: "/scout-history", icon: Send },
      { label: "スカウトテンプレート", href: "/scout-templates", icon: FileText },
    ],
  },
  {
    group: "選考",
    items: [
      { label: "進捗管理", href: "/selection", icon: ListChecks },
      { label: "メッセージ", href: "/messages", icon: MessageSquare },
      { label: "採用決定", href: "/hiring-decisions", icon: Trophy },
      { label: "メッセージテンプレート", href: "/message-templates", icon: Mail },
    ],
  },
  {
    group: "レポート",
    items: [{ label: "振り返りレポート", href: "/reports", icon: BarChart3 }],
  },
  {
    group: "管理",
    items: [
      { label: "グループ一覧", href: "/admin/groups", icon: UsersRound },
      { label: "役割一覧", href: "/admin/roles", icon: ShieldCheck },
      { label: "設定", href: "/settings", icon: Settings },
    ],
  },
];
