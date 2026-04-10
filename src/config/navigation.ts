import {
  CalendarDays,
  CheckSquare2,
  FolderKanban,
  LayoutDashboard,
  Settings
} from "lucide-react";

export const primaryNavigation = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/tasks", label: "Atividades", icon: CheckSquare2 },
  { href: "/projects", label: "Projetos", icon: FolderKanban },
  { href: "/calendar", label: "Calendário", icon: CalendarDays },
  { href: "/settings", label: "Configurações", icon: Settings }
] as const;
