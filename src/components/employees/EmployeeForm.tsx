"use client";

import type { Role } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import type { SafeEmployee } from "@/lib/employees";

type ScheduleOption = {
  id: string;
  name: string;
};

type EmployeeFormProps = {
  schedules: ScheduleOption[];
  employee?: SafeEmployee;
};

type Credentials = {
  email: string;
  password: string;
};

function formatDateInput(date?: Date | string) {
  if (!date) {
    return new Date().toISOString().slice(0, 10);
  }

  return new Date(date).toISOString().slice(0, 10);
}

export function EmployeeForm({ schedules, employee }: EmployeeFormProps) {
  const router = useRouter();
  const isEditing = Boolean(employee);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [credentials, setCredentials] = useState<Credentials | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setCredentials(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name") ?? ""),
      dni: String(formData.get("dni") ?? ""),
      email: String(formData.get("email") ?? ""),
      employeeId: String(formData.get("employeeId") ?? ""),
      department: String(formData.get("department") ?? ""),
      position: String(formData.get("position") ?? ""),
      role: String(formData.get("role") ?? "EMPLOYEE") as Role,
      phone: String(formData.get("phone") ?? ""),
      avatarUrl: String(formData.get("avatarUrl") ?? ""),
      startDate: String(formData.get("startDate") ?? ""),
      scheduleId: String(formData.get("scheduleId") ?? ""),
      baseSalary: Number(formData.get("baseSalary") ?? 0),
      vacationDays: Number(formData.get("vacationDays") ?? 22),
      isActive: String(formData.get("isActive") ?? "true") === "true",
      initialPassword: String(formData.get("initialPassword") ?? ""),
      resetPassword: String(formData.get("resetPassword") ?? "")
    };

    const body = isEditing
      ? {
          ...payload,
          initialPassword: undefined,
          resetPassword: payload.resetPassword || undefined
        }
      : payload;

    try {
      const response = await fetch(
        isEditing ? `/api/employees/${employee?.id}` : "/api/employees",
        {
          method: isEditing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        }
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof result.error === "string"
            ? result.error
            : "No se pudo guardar el empleado"
        );
      }

      if (result.initialCredentials) {
        setCredentials(result.initialCredentials);
      }

      toast.success(isEditing ? "Empleado actualizado" : "Empleado creado");

      if (!isEditing) {
        router.refresh();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error inesperado");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      {credentials ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
          <h3 className="text-sm font-semibold text-emerald-900">
            Credenciales iniciales
          </h3>
          <p className="mt-2 text-sm text-emerald-800">
            Email: <span className="font-medium">{credentials.email}</span>
          </p>
          <p className="text-sm text-emerald-800">
            Contrasena:{" "}
            <span className="font-medium">{credentials.password}</span>
          </p>
          <p className="mt-2 text-xs text-emerald-700">
            Esta contrasena solo se muestra en este momento.
          </p>
        </div>
      ) : null}

      <form className="space-y-6" onSubmit={onSubmit}>
        <section className="rounded-lg border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-primary">
            Informacion personal
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Field label="Nombre completo" name="name" defaultValue={employee?.name} required />
            <Field label="DNI/NIE" name="dni" defaultValue={employee?.dni} required />
            <Field
              label="Email"
              name="email"
              type="email"
              defaultValue={employee?.email}
              required
            />
            {!isEditing ? (
              <Field
                label="Contrasena inicial"
                name="initialPassword"
                type="password"
                required
              />
            ) : (
              <Field
                label="Reset de contrasena"
                name="resetPassword"
                type="password"
                placeholder="Opcional"
              />
            )}
            <Field label="Telefono" name="phone" defaultValue={employee?.phone ?? ""} />
            <Field
              label="Avatar URL"
              name="avatarUrl"
              defaultValue={employee?.avatarUrl ?? ""}
            />
          </div>
        </section>

        <section className="rounded-lg border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-primary">
            Informacion laboral
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Field
              label="ID empleado"
              name="employeeId"
              defaultValue={employee?.employeeId}
              required
            />
            <Field
              label="Departamento"
              name="department"
              defaultValue={employee?.department ?? ""}
              required
            />
            <Field
              label="Cargo"
              name="position"
              defaultValue={employee?.position ?? ""}
              required
            />
            <SelectField label="Rol" name="role" defaultValue={employee?.role ?? "EMPLOYEE"}>
              <option value="EMPLOYEE">EMPLOYEE</option>
              <option value="MANAGER">MANAGER</option>
              <option value="ADMIN">ADMIN</option>
            </SelectField>
            <Field
              label="Fecha de inicio"
              name="startDate"
              type="date"
              defaultValue={formatDateInput(employee?.startDate)}
              required
            />
            <SelectField
              label="Horario asignado"
              name="scheduleId"
              defaultValue={employee?.scheduleId ?? ""}
            >
              <option value="">Sin horario</option>
              {schedules.map((schedule) => (
                <option value={schedule.id} key={schedule.id}>
                  {schedule.name}
                </option>
              ))}
            </SelectField>
            <Field
              label="Salario base"
              name="baseSalary"
              type="number"
              min="0"
              step="0.01"
              defaultValue={employee?.baseSalary ?? 0}
              required
            />
            <Field
              label="Dias de vacaciones"
              name="vacationDays"
              type="number"
              min="0"
              defaultValue={employee?.vacationDays ?? 22}
              required
            />
            {isEditing ? (
              <SelectField
                label="Estado"
                name="isActive"
                defaultValue={employee?.isActive ? "true" : "false"}
              >
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </SelectField>
            ) : null}
          </div>
        </section>

        <div className="flex justify-end gap-3">
          <button
            className="h-10 rounded-md border border-slate-200 px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
            type="button"
            onClick={() => router.push("/employees")}
          >
            Volver
          </button>
          <button
            className="h-10 rounded-md bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Guardando..."
              : isEditing
                ? "Guardar cambios"
                : "Crear empleado"}
          </button>
        </div>
      </form>
    </div>
  );
}

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  name: string;
};

function Field({ label, name, ...props }: FieldProps) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
        name={name}
        {...props}
      />
    </label>
  );
}

type SelectFieldProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  name: string;
};

function SelectField({ label, name, children, ...props }: SelectFieldProps) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <select
        className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20"
        name={name}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}
