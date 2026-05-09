import type { Role } from "@prisma/client";

export const adminRoles: Role[] = ["SUPER_ADMIN", "ADMIN"];
export const managerRoles: Role[] = ["SUPER_ADMIN", "ADMIN", "MANAGER"];

export function isAdminRole(role: Role | undefined) {
  return role ? adminRoles.includes(role) : false;
}

export function isManagerRole(role: Role | undefined) {
  return role ? managerRoles.includes(role) : false;
}
