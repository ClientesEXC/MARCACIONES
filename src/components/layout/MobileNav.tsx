"use client";

import type { Role } from "@prisma/client";
import * as Dialog from "@radix-ui/react-dialog";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { LogoutButton } from "@/components/layout/LogoutButton";
import { cn } from "@/lib/utils";
import { getNavGroupsForRole } from "@/lib/navigation";

type MobileNavProps = {
  user: {
    name?: string | null;
    email?: string | null;
    role: Role;
    employeeId: string;
  };
};

export function MobileNav({ user }: MobileNavProps) {
  const pathname = usePathname();
  const groups = getNavGroupsForRole(user.role);

  return (
    <Dialog.Root>
          <Dialog.Trigger asChild>
            <button
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-700 transition-colors hover:bg-slate-100 lg:hidden"
              type="button"
              aria-label="Abrir menu de navegacion"
            >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden" />
        <Dialog.Content className="fixed inset-y-0 left-0 z-50 flex w-[min(20rem,calc(100vw-2rem))] flex-col border-r bg-white shadow-lg lg:hidden">
          <div className="flex items-center justify-between border-b px-4 py-4">
            <div>
              <Dialog.Title className="text-base font-semibold text-primary">
                Asistencia
              </Dialog.Title>
              <Dialog.Description className="text-sm text-slate-500">
                Control Laboral
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-700 transition-colors hover:bg-slate-100"
                type="button"
                aria-label="Cerrar menu de navegacion"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </Dialog.Close>
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
                      <Dialog.Close asChild key={`${group.title}-${item.href}`}>
                        <Link
                          className={cn(
                            "flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors",
                            isActive
                              ? "bg-primary text-white"
                              : "text-slate-700 hover:bg-slate-100 hover:text-primary"
                          )}
                          href={item.href}
                        >
                          <Icon className="h-4 w-4" aria-hidden="true" />
                          <span className="truncate">{item.title}</span>
                        </Link>
                      </Dialog.Close>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
          <div className="border-t p-4">
            <p className="truncate text-sm font-medium text-slate-900">
              {user.name}
            </p>
            <p className="mb-3 truncate text-xs text-slate-500">
              {user.employeeId} - {user.role}
            </p>
            <LogoutButton />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
