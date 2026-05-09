import { notFound } from "next/navigation";

import { EmployeeForm } from "@/components/employees/EmployeeForm";
import { PageHeader } from "@/components/shared/PageHeader";
import { employeeSelect } from "@/lib/employees";
import { prisma } from "@/lib/prisma";

type EmployeeDetailPageProps = {
  params: {
    id: string;
  };
};

export default async function EmployeeDetailPage({
  params
}: EmployeeDetailPageProps) {
  const [employee, schedules] = await Promise.all([
    prisma.user.findUnique({
      where: { id: params.id },
      select: employeeSelect
    }),
    prisma.schedule.findMany({
      select: {
        id: true,
        name: true
      },
      orderBy: {
        name: "asc"
      }
    })
  ]);

  if (!employee) {
    notFound();
  }

  return (
    <section>
      <PageHeader
        title={employee.name}
        description="Detalle, edicion, activacion y reset de contrasena del empleado."
      />
      <EmployeeForm employee={employee} schedules={schedules} />
    </section>
  );
}
