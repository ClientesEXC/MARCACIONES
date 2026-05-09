import Link from "next/link";
import { Prisma, Role } from "@prisma/client";

import { DataTable } from "@/components/shared/DataTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { employeeSelect, getEmployeeSearchWhere } from "@/lib/employees";
import { prisma } from "@/lib/prisma";
import { employeeQuerySchema } from "@/lib/validations/employee";

type EmployeesPageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getPageHref(page: number, params: URLSearchParams) {
  const nextParams = new URLSearchParams(params);
  nextParams.set("page", String(page));
  return `/employees?${nextParams.toString()}`;
}

export default async function EmployeesPage({ searchParams }: EmployeesPageProps) {
  const parsed = employeeQuerySchema.parse({
    page: firstParam(searchParams.page),
    limit: 20,
    search: firstParam(searchParams.search),
    role: firstParam(searchParams.role) || undefined,
    department: firstParam(searchParams.department) || undefined,
    isActive: firstParam(searchParams.isActive) || undefined
  });
  const where: Prisma.UserWhereInput = {
    ...getEmployeeSearchWhere(parsed.search),
    ...(parsed.role ? { role: parsed.role } : {}),
    ...(parsed.department ? { department: parsed.department } : {}),
    ...(parsed.isActive === undefined ? {} : { isActive: parsed.isActive })
  };
  const [employees, total, departments] = await Promise.all([
    prisma.user.findMany({
      where,
      select: employeeSelect,
      orderBy: { createdAt: "desc" },
      skip: (parsed.page - 1) * parsed.limit,
      take: parsed.limit
    }),
    prisma.user.count({ where }),
    prisma.user.findMany({
      where: { department: { not: null } },
      select: { department: true },
      distinct: ["department"],
      orderBy: { department: "asc" }
    })
  ]);
  const totalPages = Math.ceil(total / parsed.limit);
  const currentParams = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    const single = firstParam(value);
    if (single) {
      currentParams.set(key, single);
    }
  }

  return (
    <section>
      <PageHeader
        title="Empleados"
        description="Gestion de empleados, altas, edicion, activacion y reset de contrasenas."
        actions={
          <Link
            className="inline-flex h-10 items-center rounded-md bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-primary/90"
            href="/employees/new"
          >
            Nuevo Empleado
          </Link>
        }
      />

      <form className="mb-4 grid gap-3 rounded-lg border bg-white p-4 shadow-sm md:grid-cols-5">
        <input
          className="h-10 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 md:col-span-2"
          name="search"
          placeholder="Buscar por nombre, ID, email o DNI"
          defaultValue={parsed.search ?? ""}
        />
        <select
          className="h-10 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          name="role"
          defaultValue={parsed.role ?? ""}
        >
          <option value="">Todos los roles</option>
          {(["SUPER_ADMIN", "ADMIN", "MANAGER", "EMPLOYEE"] satisfies Role[]).map(
            (role) => (
              <option value={role} key={role}>
                {role}
              </option>
            )
          )}
        </select>
        <select
          className="h-10 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          name="department"
          defaultValue={parsed.department ?? ""}
        >
          <option value="">Todos los departamentos</option>
          {departments.map((item) =>
            item.department ? (
              <option value={item.department} key={item.department}>
                {item.department}
              </option>
            ) : null
          )}
        </select>
        <select
          className="h-10 rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          name="isActive"
          defaultValue={
            parsed.isActive === undefined ? "" : parsed.isActive ? "true" : "false"
          }
        >
          <option value="">Todos</option>
          <option value="true">Activos</option>
          <option value="false">Inactivos</option>
        </select>
        <button
          className="h-10 rounded-md border border-slate-200 px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 md:col-start-5"
          type="submit"
        >
          Filtrar
        </button>
      </form>

      <DataTable
        columns={[
          "Empleado",
          "ID",
          "Departamento",
          "Cargo",
          "Rol",
          "Estado",
          "Acciones"
        ]}
        emptyMessage="No hay empleados registrados"
        pagination={{
          page: parsed.page,
          total,
          totalPages,
          getPageHref: (page) => getPageHref(page, currentParams)
        }}
      >
        {employees.map((employee) => (
          <tr key={employee.id}>
            <td className="px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-100 text-sm font-semibold text-primary">
                  {employee.name.slice(0, 1).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-900">
                    {employee.name}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {employee.email}
                  </p>
                </div>
              </div>
            </td>
            <td className="px-4 py-3 text-slate-600">{employee.employeeId}</td>
            <td className="px-4 py-3 text-slate-600">
              {employee.department ?? "-"}
            </td>
            <td className="px-4 py-3 text-slate-600">
              {employee.position ?? "-"}
            </td>
            <td className="px-4 py-3">
              <StatusBadge variant="neutral">{employee.role}</StatusBadge>
            </td>
            <td className="px-4 py-3">
              <StatusBadge variant={employee.isActive ? "success" : "danger"}>
                {employee.isActive ? "Activo" : "Inactivo"}
              </StatusBadge>
            </td>
            <td className="px-4 py-3">
              <Link
                className="text-sm font-medium text-accent hover:text-primary"
                href={`/employees/${employee.id}`}
              >
                Ver detalle
              </Link>
            </td>
          </tr>
        ))}
      </DataTable>
    </section>
  );
}
