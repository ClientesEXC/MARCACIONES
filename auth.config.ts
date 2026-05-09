import type { NextAuthConfig } from "next-auth";
import type { Role } from "@prisma/client";

const roles: Role[] = ["SUPER_ADMIN", "ADMIN", "MANAGER", "EMPLOYEE"];

function isRole(value: unknown): value is Role {
  return typeof value === "string" && roles.includes(value as Role);
}

export const authConfig = {
  trustHost: true,
  pages: {
    signIn: "/login"
  },
  session: {
    strategy: "jwt"
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.employeeId = user.employeeId;
        token.dni = user.dni;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = typeof token.id === "string" ? token.id : "";
        session.user.role = isRole(token.role) ? token.role : "EMPLOYEE";
        session.user.employeeId =
          typeof token.employeeId === "string" ? token.employeeId : "";
        session.user.dni = typeof token.dni === "string" ? token.dni : "";
      }

      return session;
    }
  },
  providers: []
} satisfies NextAuthConfig;
