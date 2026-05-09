import { Role } from "@prisma/client";
import { z } from "zod";

import { paginationSchema } from "@/lib/validations/shared";

const dniLetters = "TRWAGMYFPDXBNJZSQVHLCKE";

function isValidSpanishDocument(value: string) {
  const normalized = value.trim().toUpperCase();

  if (/^\d{8}[A-Z]$/.test(normalized)) {
    const number = Number(normalized.slice(0, 8));
    return dniLetters[number % 23] === normalized[8];
  }

  if (/^[XYZ]\d{7}[A-Z]$/.test(normalized)) {
    const prefix = { X: "0", Y: "1", Z: "2" }[normalized[0] as "X" | "Y" | "Z"];
    const number = Number(`${prefix}${normalized.slice(1, 8)}`);
    return dniLetters[number % 23] === normalized[8];
  }

  return false;
}

const roleSchema = z.enum(["ADMIN", "MANAGER", "EMPLOYEE"]);

const optionalTextSchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : undefined));

const scheduleIdSchema = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : null));

export const employeeQuerySchema = paginationSchema.extend({
  role: z.nativeEnum(Role).optional(),
  department: z.string().trim().optional(),
  isActive: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => (value === undefined ? undefined : value === "true"))
});

export const employeeCreateSchema = z.object({
  name: z.string().trim().min(2, "El nombre es obligatorio"),
  dni: z
    .string()
    .trim()
    .transform((value) => value.toUpperCase())
    .refine(isValidSpanishDocument, "DNI/NIE no valido"),
  email: z
    .string()
    .trim()
    .email("Email no valido")
    .transform((value) => value.toLowerCase()),
  initialPassword: z
    .string()
    .min(8, "La contrasena debe tener al menos 8 caracteres")
    .regex(/[A-Z]/, "Debe incluir una mayuscula")
    .regex(/[a-z]/, "Debe incluir una minuscula")
    .regex(/\d/, "Debe incluir un numero"),
  employeeId: z.string().trim().min(3, "El ID de empleado es obligatorio"),
  department: z.string().trim().min(2, "El departamento es obligatorio"),
  position: z.string().trim().min(2, "El cargo es obligatorio"),
  role: roleSchema.default("EMPLOYEE"),
  phone: optionalTextSchema,
  avatarUrl: optionalTextSchema.pipe(z.string().url().optional()).optional(),
  startDate: z.coerce.date(),
  scheduleId: scheduleIdSchema,
  baseSalary: z.coerce.number().min(0, "El salario no puede ser negativo"),
  vacationDays: z.coerce
    .number()
    .int()
    .min(0, "Los dias no pueden ser negativos")
    .max(60, "Valor demasiado alto")
});

export const employeeUpdateSchema = employeeCreateSchema
  .omit({ initialPassword: true })
  .partial()
  .extend({
    resetPassword: z
      .string()
      .optional()
      .refine(
        (value) =>
          !value ||
          (value.length >= 8 && /[A-Z]/.test(value) && /[a-z]/.test(value) && /\d/.test(value)),
        "La nueva contrasena debe tener 8 caracteres, mayuscula, minuscula y numero"
      ),
    isActive: z.coerce.boolean().optional()
  });

export type EmployeeCreateInput = z.infer<typeof employeeCreateSchema>;
export type EmployeeUpdateInput = z.infer<typeof employeeUpdateSchema>;
