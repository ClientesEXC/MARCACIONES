import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { auth } from "@/../auth";
import { employeeSelect } from "@/lib/employees";
import { isAdminRole } from "@/lib/auth/roles";
import { prisma } from "@/lib/prisma";
import { employeeUpdateSchema } from "@/lib/validations/employee";

type EmployeeRouteContext = {
  params: {
    id: string;
  };
};

function forbidden() {
  return NextResponse.json({ error: "No autorizado" }, { status: 403 });
}

export async function GET(_request: Request, { params }: EmployeeRouteContext) {
  const session = await auth();

  if (!isAdminRole(session?.user.role)) {
    return forbidden();
  }

  const employee = await prisma.user.findUnique({
    where: { id: params.id },
    select: employeeSelect
  });

  if (!employee) {
    return NextResponse.json({ error: "Empleado no encontrado" }, { status: 404 });
  }

  return NextResponse.json({ data: employee });
}

export async function PATCH(request: Request, { params }: EmployeeRouteContext) {
  const session = await auth();

  if (!isAdminRole(session?.user.role)) {
    return forbidden();
  }

  const body = await request.json();
  const parsed = employeeUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { resetPassword, ...data } = parsed.data;
  const updateData: Prisma.UserUpdateInput = {
    ...data,
    schedule: data.scheduleId
      ? { connect: { id: data.scheduleId } }
      : data.scheduleId === null
        ? { disconnect: true }
        : undefined
  };

  delete (updateData as { scheduleId?: string | null }).scheduleId;

  if (resetPassword) {
    updateData.password = await bcrypt.hash(resetPassword, 12);
  }

  try {
    const employee = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: employeeSelect
    });

    return NextResponse.json({
      data: employee,
      ...(resetPassword
        ? {
            initialCredentials: {
              email: employee.email,
              password: resetPassword
            }
          }
        : {})
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json({ error: "Empleado no encontrado" }, { status: 404 });
    }

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Ya existe un empleado con ese email, DNI o ID" },
        { status: 409 }
      );
    }

    throw error;
  }
}
