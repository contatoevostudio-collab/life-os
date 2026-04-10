import {
  CalendarDays,
  CheckSquare2,
  CircleGauge,
  BellRing,
  FolderKanban,
  Settings
} from "lucide-react";

export const primaryNavigation = [
  { href: "/", label: "Hoje", icon: CircleGauge },
  { href: "/tasks", label: "Tarefas", icon: CheckSquare2 },
  { href: "/projects", label: "Projetos", icon: FolderKanban },
  { href: "/events", label: "Eventos", icon: BellRing },
  { href: "/calendar", label: "Calendário", icon: CalendarDays },
  { href: "/settings", label: "Configurações", icon: Settings }
] as const;
