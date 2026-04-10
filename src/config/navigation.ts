import {
  CalendarDays,
  ChartColumnBig,
  CheckSquare2,
  CircleGauge,
  FolderKanban,
  LayoutDashboard,
  Settings
} from "lucide-react";

export const primaryNavigation = [
  { href: "/", label: "Hoje", icon: CircleGauge },
  { href: "/tasks", label: "Tarefas", icon: CheckSquare2 },
  { href: "/projects", label: "Projetos", icon: FolderKanban },
  { href: "/calendar", label: "Calendário", icon: CalendarDays },
  { href: "/finance", label: "Financeiro", icon: ChartColumnBig },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/settings", label: "Configurações", icon: Settings }
] as const;
