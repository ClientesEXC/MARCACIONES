import { auth } from "@/../auth";
import { WeeklyAttendanceChart } from "@/components/dashboard/WeeklyAttendanceChart";
import type { WeeklyAttendancePoint } from "@/components/dashboard/WeeklyAttendanceChart";
import { DataTable } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { isAdminRole } from "@/lib/auth/roles";
import { canSeeDashboard, getDefaultPathForRole } from "@/lib/navigation";
import { prisma } from "@/lib/prisma";
import { startOfLocalDay } from "@/lib/utils/date";
import type { AttendanceStatus, Prisma, RequestStatus } from "@prisma/client";
import { redirect } from "next/navigation";

const statusConfig: Record<
  AttendanceStatus | RequestStatus,
  { label: string; variant: "success" | "warning" | "danger" | "neutral" | "info" }
> = {
  PRESENT: { label: "Presente", variant: "success" },
  ABSENT: { label: "Ausente", variant: "danger" },
  LATE: { label: "Tarde", variant: "warning" },
  HALF_DAY: { label: "Media jornada", variant: "warning" },
  HOLIDAY: { label: "Festivo", variant: "info" },
  ON_LEAVE: { label: "Permiso", variant: "info" },
  PENDING: { label: "Pendiente", variant: "warning" },
  APPROVED: { label: "Aprobado", variant: "success" },
  REJECTED: { label: "Rechazado", variant: "danger" }
};

function formatTime(date: Date | null) {
  if (!date) {
    return "-";
  }

  return new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Madrid"
  }).format(date);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-ES", {
    day: "2-digit",
    month: "short",
    timeZone: "Europe/Madrid"
  }).format(date);
}

function getWeekDays(today: Date) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = startOfLocalDay(today);
    date.setDate(date.getDate() - (6 - index));
    return date;
  });
}

function buildWeeklyData(
  days: Date[],
  attendances: Array<{ date: Date; status: AttendanceStatus }>
): WeeklyAttendancePoint[] {
  return days.map((day) => {
    const dayTime = day.getTime();
    const dayAttendances = attendances.filter(
      (attendance) => startOfLocalDay(attendance.date).getTime() === dayTime
    );

    return {
      day: formatDate(day),
      presentes: dayAttendances.filter((attendance) =>
        ["PRESENT", "LATE", "HALF_DAY"].includes(attendance.status)
      ).length,
      ausentes: dayAttendances.filter((attendance) => attendance.status === "ABSENT")
        .length,
      tardanzas: dayAttendances.filter((attendance) => attendance.status === "LATE")
        .length
    };
  });
}

export default async function DashboardPage() {
  const session = await auth();

  if (session?.user && !canSeeDashboard(session.user.role)) {
    redirect(getDefaultPathForRole(session.user.role));
  }

  if (!session?.user) {
    redirect("/login");
  }

  const today = startOfLocalDay(new Date());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const weekDays = getWeekDays(today);
  const weekStart = weekDays[0];
  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { department: true }
  });

  const userWhere: Prisma.UserWhereInput = {
    isActive: true,
    ...(isAdminRole(session.user.role)
      ? {}
      : currentUser?.department
        ? { department: currentUser.department }
        : { id: session.user.id })
  };

  const attendanceWhere: Prisma.AttendanceWhereInput = {
    user: userWhere
  };

  const [
    activeEmployees,
    presentToday,
    absentToday,
    lateToday,
    todayAttendances,
    weeklyAttendances,
    upcomingHolidays,
    pendingPermissions,
    pendingVacations
  ] = await Promise.all([
    prisma.user.count({ where: userWhere }),
    prisma.attendance.count({
      where: {
        ...attendanceWhere,
        date: today,
        status: { in: ["PRESENT", "LATE", "HALF_DAY"] }
      }
    }),
    prisma.attendance.count({
      where: { ...attendanceWhere, date: today, status: "ABSENT" }
    }),
    prisma.attendance.count({
      where: { ...attendanceWhere, date: today, status: "LATE" }
    }),
    prisma.attendance.findMany({
      where: { ...attendanceWhere, date: today },
      include: {
        user: {
          select: {
            name: true,
            employeeId: true
          }
        }
      },
      orderBy: [{ status: "asc" }, { checkIn: "asc" }]
    }),
    prisma.attendance.findMany({
      where: {
        ...attendanceWhere,
        date: {
          gte: weekStart,
          lt: tomorrow
        }
      },
      select: {
        date: true,
        status: true
      }
    }),
    prisma.holiday.findMany({
      where: {
        date: {
          gte: today
        }
      },
      orderBy: {
        date: "asc"
      },
      take: 3
    }),
    prisma.permission.findMany({
      where: {
        status: "PENDING",
        user: userWhere
      },
      include: {
        user: {
          select: {
            name: true,
            employeeId: true
          }
        }
      },
      orderBy: {
        createdAt: "asc"
      },
      take: 5
    }),
    prisma.vacation.findMany({
      where: {
        status: "PENDING",
        user: userWhere
      },
      include: {
        user: {
          select: {
            name: true,
            employeeId: true
          }
        }
      },
      orderBy: {
        createdAt: "asc"
      },
      take: 5
    })
  ]);

  const weeklyData = buildWeeklyData(weekDays, weeklyAttendances);
  const pendingRequests = [
    ...pendingPermissions.map((permission) => ({
      id: permission.id,
      type: "Permiso",
      employee: permission.user.name,
      employeeId: permission.user.employeeId,
      period: `${formatDate(permission.startDate)} - ${formatDate(permission.endDate)}`,
      status: permission.status
    })),
    ...pendingVacations.map((vacation) => ({
      id: vacation.id,
      type: "Vacaciones",
      employee: vacation.user.name,
      employeeId: vacation.user.employeeId,
      period: `${formatDate(vacation.startDate)} - ${formatDate(vacation.endDate)}`,
      status: vacation.status
    }))
  ].slice(0, 5);

  return (
    <section className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Resumen operativo con datos reales de empleados, asistencia y solicitudes."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Empleados activos", activeEmployees, "neutral"],
          ["Presentes hoy", presentToday, "success"],
          ["Ausentes hoy", absentToday, "danger"],
          ["Tardanzas hoy", lateToday, "warning"]
        ].map(([label, value, variant]) => (
          <div className="rounded-lg border bg-white p-5 shadow-sm" key={label}>
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-semibold text-primary">
              {value}
            </p>
            <div className="mt-4">
              <StatusBadge variant={variant as "success"}>Hoy</StatusBadge>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(22rem,0.75fr)]">
        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-primary">
              Asistencia semanal
            </h2>
            <p className="text-sm text-slate-500">
              Presentes, ausencias y tardanzas de los ultimos 7 dias.
            </p>
          </div>
          <WeeklyAttendanceChart data={weeklyData} />
        </div>

        <div className="rounded-lg border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-primary">
            Proximos festivos
          </h2>
          <div className="mt-4 space-y-3">
            {upcomingHolidays.length > 0 ? (
              upcomingHolidays.map((holiday) => (
                <div
                  className="flex items-center justify-between gap-3 rounded-md border border-slate-100 px-3 py-2"
                  key={holiday.id}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {holiday.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {holiday.isNational ? "Nacional" : "Empresa"}
                    </p>
                  </div>
                  <StatusBadge variant="info">{formatDate(holiday.date)}</StatusBadge>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">
                No hay festivos proximos registrados.
              </p>
            )}
          </div>
        </div>
      </div>

      <div>
        <div className="mb-3">
          <h2 className="text-lg font-semibold text-primary">
            Asistencia de hoy
          </h2>
          <p className="text-sm text-slate-500">
            Registros ordenados por estado y hora de entrada.
          </p>
        </div>
        <DataTable
          columns={["Empleado", "ID", "Entrada", "Salida", "Estado", "Horas"]}
          emptyMessage="No hay registros de asistencia para hoy"
        >
          {todayAttendances.map((attendance) => {
            const status = statusConfig[attendance.status];

            return (
              <tr key={attendance.id}>
                <td className="px-4 py-3 font-medium text-slate-900">
                  {attendance.user.name}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {attendance.user.employeeId}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {formatTime(attendance.checkIn)}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {formatTime(attendance.checkOut)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge variant={status.variant}>{status.label}</StatusBadge>
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {attendance.totalHours?.toFixed(2) ?? "-"}
                </td>
              </tr>
            );
          })}
        </DataTable>
      </div>

      {isAdminRole(session.user.role) || session.user.role === "MANAGER" ? (
        <div>
          <div className="mb-3">
            <h2 className="text-lg font-semibold text-primary">
              Solicitudes pendientes
            </h2>
            <p className="text-sm text-slate-500">
              Permisos y vacaciones que requieren revision.
            </p>
          </div>
          <DataTable
            columns={["Tipo", "Empleado", "ID", "Periodo", "Estado"]}
            emptyMessage="No hay solicitudes pendientes"
          >
            {pendingRequests.map((request) => {
              const status = statusConfig[request.status];

              return (
                <tr key={`${request.type}-${request.id}`}>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {request.type}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {request.employee}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {request.employeeId}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {request.period}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge variant={status.variant}>{status.label}</StatusBadge>
                  </td>
                </tr>
              );
            })}
          </DataTable>
        </div>
      ) : null}
    </section>
  );
}
