"use client";

import type { Role } from "@prisma/client";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { LogoutButton } from "@/components/layout/LogoutButton";
import { cn } from "@/lib/utils";
import { getNavGroupsForRole } from "@/lib/navigation";

type SidebarProps = {
  user: {
    name?: string | null;
    email?: string | null;
    role: Role;
    employeeId: string;
  };
};

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const groups = getNavGroupsForRole(user.role);

  return (
    <aside className="hidden h-screen w-60 shrink-0 border-r bg-white lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:flex-col">
      <div className="border-b px-5 py-5">
        <p className="text-sm font-medium text-accent">Control Laboral</p>
        <h1 className="mt-1 text-lg font-semibold text-primary">
          Asistencia
        </h1>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {groups.map((group) => (
          <div className="mb-5" key={group.title}>
            <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-normal text-slate-500">
              {group.title}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" &&
                    pathname.startsWith(`${item.href}/`));

                return (
                  <Link
                    className={cn(
                      "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-white"
                        : "text-slate-700 hover:bg-slate-100 hover:text-primary"
                    )}
                    href={item.href}
                    key={`${group.title}-${item.href}-${item.title}`}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    <span className="truncate">{item.title}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t p-4">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-slate-100 text-sm font-semibold text-primary">
            {user.name?.slice(0, 1).toUpperCase() ?? "U"}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-900">
              {user.name}
            </p>
            <p className="truncate text-xs text-slate-500">
              {user.employeeId} - {user.role}
            </p>
          </div>
        </div>
        <LogoutButton />
      </div>
    </aside>
  );
}
