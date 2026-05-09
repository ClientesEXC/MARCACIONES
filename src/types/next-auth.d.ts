import type { Role } from "@prisma/client";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role: Role;
    employeeId: string;
    dni: string;
  }

  interface Session {
    user: {
      id: string;
      role: Role;
      employeeId: string;
      dni: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    employeeId: string;
    dni: string;
  }
}
