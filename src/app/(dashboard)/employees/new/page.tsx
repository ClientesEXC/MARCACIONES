import { EmployeeForm } from "@/components/employees/EmployeeForm";
import { PageHeader } from "@/components/shared/PageHeader";
import { prisma } from "@/lib/prisma";

export default async function NewEmployeePage() {
  const schedules = await prisma.schedule.findMany({
    select: {
      id: true,
      name: true
    },
    orderBy: {
      name: "asc"
    }
  });

  return (
    <section>
      <PageHeader
        title="Nuevo Empleado"
        description="Formulario de creacion de cuentas gestionado por administradores."
      />
      <EmployeeForm schedules={schedules} />
    </section>
  );
}
