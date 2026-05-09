import type { Prisma, User } from "@prisma/client";

export const employeeSelect = {
  id: true,
  employeeId: true,
  dni: true,
  name: true,
  email: true,
  role: true,
  department: true,
  position: true,
  phone: true,
  startDate: true,
  isActive: true,
  avatarUrl: true,
  baseSalary: true,
  vacationDays: true,
  scheduleId: true,
  createdAt: true,
  updatedAt: true,
  schedule: {
    select: {
      id: true,
      name: true
    }
  }
} satisfies Prisma.UserSelect;

export type SafeEmployee = Prisma.UserGetPayload<{
  select: typeof employeeSelect;
}>;

export function getEmployeeSearchWhere(search?: string): Prisma.UserWhereInput {
  if (!search) {
    return {};
  }

  return {
    OR: [
      { name: { contains: search, mode: "insensitive" } },
      { employeeId: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { dni: { contains: search, mode: "insensitive" } }
    ]
  };
}

export function toEmployeeResponse(employee: SafeEmployee) {
  return employee;
}

export function assertNoPassword<T extends Partial<User>>(user: T) {
  const { password: _password, ...safeUser } = user;
  return safeUser;
}
