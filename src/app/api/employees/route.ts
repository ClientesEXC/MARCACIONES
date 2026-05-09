import bcrypt from "bcryptjs";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { auth } from "@/../auth";
import { employeeSelect, getEmployeeSearchWhere } from "@/lib/employees";
import { isAdminRole } from "@/lib/auth/roles";
import { prisma } from "@/lib/prisma";
import {
  employeeCreateSchema,
  employeeQuerySchema
} from "@/lib/validations/employee";

function forbidden() {
  return NextResponse.json({ error: "No autorizado" }, { status: 403 });
}

export async function GET(request: Request) {
  const session = await auth();

  if (!isAdminRole(session?.user.role)) {
    return forbidden();
  }

  const { searchParams } = new URL(request.url);
  const parsed = employeeQuerySchema.safeParse(Object.fromEntries(searchParams));

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { page, limit, search, role, department, isActive } = parsed.data;
  const where: Prisma.UserWhereInput = {
    ...getEmployeeSearchWhere(search),
    ...(role ? { role } : {}),
    ...(department ? { department } : {}),
    ...(isActive === undefined ? {} : { isActive })
  };

  const [data, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: employeeSelect,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit
    }),
    prisma.user.count({ where })
  ]);

  return NextResponse.json({
    data,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  });
}

export async function POST(request: Request) {
  const session = await auth();

  if (!isAdminRole(session?.user.role)) {
    return forbidden();
  }

  const body = await request.json();
  const parsed = employeeCreateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { initialPassword, ...data } = parsed.data;
  const password = await bcrypt.hash(initialPassword, 12);

  try {
    const employee = await prisma.user.create({
      data: {
        ...data,
        password,
        scheduleId: data.scheduleId ?? undefined
      },
      select: employeeSelect
    });

    return NextResponse.json(
      {
        data: employee,
        initialCredentials: {
          email: employee.email,
          password: initialPassword
        }
      },
      { status: 201 }
    );
  } catch (error) {
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
