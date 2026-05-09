import type { Role } from "@prisma/client";
import {
  BriefcaseBusiness,
  CalendarCheck,
  CalendarDays,
  Clock3,
  FileBarChart,
  Home,
  type LucideIcon,
  Plane,
  ReceiptText,
  Settings2,
  Users
} from "lucide-react";

import { isAdminRole, isManagerRole } from "@/lib/auth/roles";

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  roles: Role[];
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

const allRoles: Role[] = ["SUPER_ADMIN", "ADMIN", "MANAGER", "EMPLOYEE"];
const adminRoles: Role[] = ["SUPER_ADMIN", "ADMIN"];
const managerRoles: Role[] = ["SUPER_ADMIN", "ADMIN", "MANAGER"];

export const navGroups: NavGroup[] = [
  {
    title: "Principal",
    items: [
      {
        title: "Dashboard",
        href: "/dashboard",
        icon: Home,
        roles: managerRoles
      },
      {
        title: "Mi Asistencia",
        href: "/attendance",
        icon: CalendarCheck,
        roles: ["EMPLOYEE"]
      },
      {
        title: "Marcar Entrada/Salida",
        href: "/attendance/mark",
        icon: Clock3,
        roles: allRoles
      }
    ]
  },
  {
    title: "Gestion",
    items: [
      {
        title: "Empleados",
        href: "/employees",
        icon: Users,
        roles: adminRoles
      },
      {
        title: "Asistencia",
        href: "/attendance",
        icon: CalendarCheck,
        roles: managerRoles
      },
      {
        title: "Horarios",
        href: "/schedules",
        icon: Settings2,
        roles: adminRoles
      },
      {
        title: "Festivos",
        href: "/holidays",
        icon: CalendarDays,
        roles: adminRoles
      }
    ]
  },
  {
    title: "Solicitudes",
    items: [
      {
        title: "Permisos",
        href: "/permissions",
        icon: BriefcaseBusiness,
        roles: allRoles
      },
      {
        title: "Vacaciones",
        href: "/vacations",
        icon: Plane,
        roles: allRoles
      }
    ]
  },
  {
    title: "Analitica",
    items: [
      {
        title: "Nominas",
        href: "/payroll",
        icon: ReceiptText,
        roles: adminRoles
      },
      {
        title: "Reportes",
        href: "/reports",
        icon: FileBarChart,
        roles: managerRoles
      }
    ]
  }
];

export function getNavGroupsForRole(role: Role) {
  return navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.roles.includes(role))
    }))
    .filter((group) => group.items.length > 0);
}

export function getDefaultPathForRole(role: Role) {
  if (isManagerRole(role)) {
    return "/dashboard";
  }

  return "/attendance/mark";
}

export function canSeeDashboard(role: Role) {
  return isManagerRole(role);
}

export function canSeeAdminArea(role: Role) {
  return isAdminRole(role);
}

export function getPageTitle(pathname: string) {
  const matches: Array<[string, string]> = [
    ["/attendance/mark", "Marcar Entrada/Salida"],
    ["/employees/new", "Nuevo Empleado"],
    ["/permissions/new", "Nuevo Permiso"],
    ["/vacations/new", "Nueva Vacacion"],
    ["/dashboard", "Dashboard"],
    ["/employees", "Empleados"],
    ["/attendance", "Asistencia"],
    ["/schedules", "Horarios"],
    ["/holidays", "Festivos"],
    ["/permissions", "Permisos"],
    ["/vacations", "Vacaciones"],
    ["/payroll", "Nominas"],
    ["/reports", "Reportes"]
  ];

  return (
    matches.find(([path]) => pathname === path || pathname.startsWith(`${path}/`))
      ?.[1] ?? "Control de Asistencia"
  );
}
