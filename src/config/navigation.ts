import {
  CalendarDays,
  ChartColumnBig,
  CheckSquare2,
  CircleGauge,
  LayoutDashboard,
  Settings
} from "lucide-react";

export const navigation = [
  { href: "/", label: "Hoje", icon: CircleGauge },
  { href: "/tasks", label: "Tarefas", icon: CheckSquare2 },
  { href: "/calendar", label: "Calendário", icon: CalendarDays },
  { href: "/finance", label: "Financeiro", icon: ChartColumnBig },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/settings", label: "Configurações", icon: Settings }
] as const;
