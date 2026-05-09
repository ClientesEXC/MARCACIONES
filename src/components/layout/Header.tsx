"use client";

import type { Role } from "@prisma/client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

import { MobileNav } from "@/components/layout/MobileNav";
import { getPageTitle } from "@/lib/navigation";

type HeaderProps = {
  user: {
    name?: string | null;
    email?: string | null;
    role: Role;
    employeeId: string;
  };
};

function formatNow(date: Date) {
  return new Intl.DateTimeFormat("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Madrid"
  }).format(date);
}

export function Header({ user }: HeaderProps) {
  const pathname = usePathname();
  const [now, setNow] = useState(() => formatNow(new Date()));

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(formatNow(new Date()));
    }, 60_000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <MobileNav user={user} />
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold text-primary">
              {getPageTitle(pathname)}
            </h1>
            <p className="truncate text-xs text-slate-500 sm:text-sm">{now}</p>
          </div>
        </div>
        <div className="flex min-w-0 items-center gap-3">
          <div className="hidden text-right md:block">
            <p className="max-w-48 truncate text-sm font-medium text-slate-900">
              {user.name}
            </p>
            <p className="text-xs text-slate-500">{user.role}</p>
          </div>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-semibold text-white">
            {user.name?.slice(0, 1).toUpperCase() ?? "U"}
          </div>
        </div>
      </div>
    </header>
  );
}
