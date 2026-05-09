# Memory - Proyecto Marcaciones

Ultima actualizacion: 2026-05-08

## Contexto del proyecto

El usuario quiere construir un sistema profesional completo de control de asistencia laboral para una empresa de prevencion de riesgos laborales. La fuente maestra actual es `INSTRUCCIONES.txt`.

El proyecto ya tiene scaffold base. Al iniciar esta memoria, el workspace solo contenia:

- `INSTRUCCIONES.txt`
- `ROADMAP.md`
- `MEMORY.md`

Avance actual:

- Git inicializado.
- Next.js 14.2.35 instalado con App Router, TypeScript y Tailwind.
- Dependencias principales instaladas.
- `package.json`, `package-lock.json`, `.gitignore`, `.env.example`, `.env.local` y `.env` con placeholders, `vercel.json`, `README.md`, configs de TypeScript/Tailwind/PostCSS/ESLint creados.
- Estructura base `src/app`, `src/lib`, `src/types` creada.
- `prisma/schema.prisma` creado con el modelo requerido.
- `prisma/seed.ts` creado con usuarios, horarios, festivos y asistencia inicial realista.
- Prisma Client generado durante `npm install`.
- `npx tsc --noEmit`, `npm run lint` y `npm run build` pasan.
- NextAuth v5 Credentials implementado en `auth.ts`.
- `auth.config.ts` separa configuracion compatible con middleware Edge de la parte que importa Prisma/bcrypt.
- Ruta `src/app/api/auth/[...nextauth]/route.ts` creada.
- Login real conectado con `next-auth/react` en `src/app/(auth)/login/login-form.tsx`.
- Middleware RBAC creado en `middleware.ts`.
- Ruta `/dashboard` minima creada para destino post-login.
- Servidor dev arrancado fuera del sandbox en `http://localhost:3000`.
- Verificado `GET /login` con status 200.
- Verificado `GET /dashboard` sin sesion con redirect 307.
- Verificado `GET /api/auth/providers` exponiendo provider `credentials`.
- Migracion inicial aplicada en Supabase con `npx.cmd prisma migrate dev --name init`.
- Se creo `prisma/migrations/20260508095153_init/migration.sql`.
- `npx.cmd prisma generate` completo despues de cerrar procesos Node que bloqueaban el DLL de Prisma.
- Seed ejecutado con `npm.cmd run db:seed`.
- Conteos verificados en Supabase: 8 usuarios, 2 horarios, 18 festivos, 110 asistencias, 4 permisos.
- Login real verificado por HTTP con `admin@empresa.com`; `/api/auth/session` devuelve rol `SUPER_ADMIN`.
- Fase 4 completada:
  - Layout dashboard creado en `src/app/(dashboard)/layout.tsx`.
  - Sidebar desktop fija y drawer mobile creados en `src/components/layout`.
  - Header con titulo, fecha/hora Europe/Madrid y usuario conectado.
  - Navegacion por rol centralizada en `src/lib/navigation.ts`.
  - Componentes compartidos creados: `DataTable`, `StatusBadge`, `ConfirmDialog`, `PageHeader`.
  - Sonner configurado globalmente en `src/app/layout.tsx`.
  - `DataTable` incluye empty state, loading skeleton y soporte de paginacion por enlaces.
- Verificacion posterior a Fase 4:
  - `npx.cmd tsc --noEmit` pasa.
  - `npm.cmd run lint` pasa.
  - `npm.cmd run build` pasa fuera del sandbox; dentro falla por restriccion conocida `spawn EPERM`.
  - Servidor dev levantado fuera del sandbox en `http://localhost:3001`.
  - `GET /login` responde 200.
  - `GET /dashboard` sin sesion responde redirect 307.
  - `GET /api/auth/providers` responde 200 con provider `credentials`.
- Fase 5 completada:
  - `/dashboard` consulta Prisma directamente, sin mocks.
  - KPIs reales: empleados activos, presentes hoy, ausentes hoy y tardanzas.
  - Tabla de asistencia de hoy con badges de estado.
  - Grafica semanal con Recharts en `src/components/dashboard/WeeklyAttendanceChart.tsx`.
  - Lista de proximos festivos desde `Holiday`.
  - Solicitudes pendientes combinando permisos y vacaciones para ADMIN/MANAGER.
  - MANAGER queda filtrado por departamento si existe; ADMIN/SUPER_ADMIN ven todo.
  - Loading y error states creados en `src/app/(dashboard)/dashboard/loading.tsx` y `error.tsx`.
- Verificacion posterior a Fase 5:
  - `npx.cmd tsc --noEmit` pasa.
  - `npm.cmd run lint` pasa.
  - `npm.cmd run build` pasa fuera del sandbox.
  - Login HTTP con `admin@empresa.com` y carga de `/dashboard` autenticado devuelve 200.
- Fase 6 iniciada y avanzada:
  - Validaciones Zod de empleados creadas en `src/lib/validations/employee.ts`.
  - API `/api/employees` creada con `GET` paginado/filtrado y `POST` con bcrypt 12 rounds.
  - API `/api/employees/[id]` creada con `GET` y `PATCH` para edicion, activar/desactivar y reset de password por admin.
  - Todas las respuestas usan `employeeSelect` en `src/lib/employees.ts` y no devuelven `password`.
  - Lista real `/employees` creada con busqueda, filtros por rol/departamento/estado y paginacion.
  - Formulario reutilizable `EmployeeForm` creado para alta y edicion.
  - `/employees/new` crea empleados y muestra credenciales iniciales solo en la respuesta de creacion.
  - `/employees/[id]` permite editar detalle, estado y resetear password.
- Verificacion posterior al avance de Fase 6:
  - `npx.cmd tsc --noEmit` pasa.
  - `npm.cmd run lint` pasa.
  - `npm.cmd run build` pasa fuera del sandbox.
  - `GET /employees` autenticado como `admin@empresa.com` devuelve 200.
  - `GET /api/employees?limit=2` autenticado como admin devuelve datos paginados sin `password`.
  - `GET /api/employees` autenticado como `juan.perez@empresa.com` devuelve 403.
  - No se creo empleado de prueba para no ensuciar la base real durante la verificacion.

## Fuente maestra

`INSTRUCCIONES.txt` contiene el prompt maestro. Hay que seguirlo como contrato funcional y tecnico.

Nota importante: el archivo parece estar guardado o mostrado con encoding incorrecto. Se ven caracteres mojibake en palabras acentuadas. No se ha modificado para evitar perder contenido. Si una IA futura necesita editarlo, primero debe decidir si corrige encoding con cuidado o si lo deja como referencia intacta.

## Stack obligatorio

- Next.js 14 con App Router y TypeScript.
- Supabase PostgreSQL gestionado.
- Prisma 5 con `DATABASE_URL` para pooler Supabase y `DIRECT_URL` para migraciones.
- NextAuth.js v5/Auth.js con Credentials provider.
- No usar Supabase Auth.
- Zod para validacion.
- Tailwind CSS + shadcn/ui.
- Lucide React para iconos.
- Recharts para graficas.
- `@react-pdf/renderer` para PDF.
- Vercel para app y Supabase para base de datos.

## Reglas funcionales centrales

- No existe registro publico.
- Solo ADMIN y SUPER_ADMIN pueden crear cuentas de empleados.
- Los empleados reciben email y contrasena inicial del administrador.
- La contrasena se hashea con bcrypt a 12 rounds.
- El resumen con contrasena en texto plano solo se muestra una vez al crear usuario.
- El login usa email y password.
- El JWT/session debe incluir `id`, `name`, `email`, `role`, `employeeId`, `dni`.
- RBAC obligatorio en middleware y endpoints.
- Los empleados solo ven sus propios datos.
- Managers pueden ver datos de su departamento.
- Admins tienen acceso total.

## Decisiones tomadas hasta ahora

- Se creo `ROADMAP.md` como plan ejecutable por fases.
- Se creo `MEMORY.md` como memoria persistente para proximas IAs.
- Fases 1, 2, 3, 4 y 5 completadas.
- Se uso scaffold manual para no borrar los documentos existentes en una carpeta no vacia.
- Se usa `npm.cmd` en vez de `npm` porque PowerShell bloquea `npm.ps1`.
- `npm install` requirio ejecucion fuera del sandbox por red.
- `npm run build` requirio ejecucion fuera del sandbox porque Next necesitaba crear procesos worker y el sandbox devolvia `spawn EPERM`.
- Se actualizo NextAuth a `5.0.0-beta.31`.
- Se actualizo Next dentro de la rama 14 a `14.2.35`.
- Se implemento rate limiting basico en memoria por email: maximo 5 intentos en una ventana de 15 minutos.
- El middleware protege `/dashboard`, `/employees`, `/attendance`, `/schedules`, `/holidays`, `/permissions`, `/vacations`, `/payroll` y `/reports`.
- Rutas admin-only: `/employees`, `/schedules`, `/holidays`, `/payroll`.
- Rutas manager/admin: `/reports`.

## Orden de trabajo recomendado

Seguir `ROADMAP.md` en orden. No saltar a UI o modulos de negocio antes de completar:

1. Setup inicial.
2. Prisma/schema/seed.
3. Autenticacion y middleware.
4. Layout base.
5. Dashboard.
6. Modulos funcionales.
7. Verificacion final.

## Criterios de implementacion

- Mantener una UI corporativa sobria: blanco/gris claro, primario `#1a1a2e`, acento `#4361ee`.
- Mobile first; comprobar 375px.
- Sidebar fija en desktop y drawer mobile.
- Tablas con paginacion de 20 items.
- Loading states, toasts, empty states y errores inline.
- No usar `any`.
- No dejar `console.log`.
- No hardcodear URLs.
- Usar variables de entorno.
- Usar transacciones Prisma al tocar multiples tablas.
- Sanitizar inputs.

## Modelo de datos

El schema Prisma debe copiarse desde `INSTRUCCIONES.txt` exactamente. Incluye:

- `User`
- `Schedule`
- `WorkDay`
- `Attendance`
- `Holiday`
- `Permission`
- `Vacation`
- `Payroll`

Enums:

- `Role`
- `AttendanceStatus`
- `RequestStatus`
- `PermissionType`
- `DayOfWeek`

Atencion especial:

- `Attendance` tiene `@@unique([userId, date])`; normalizar `date` a inicio de dia.
- `WorkDay` tiene `@@unique([scheduleId, dayOfWeek])`; solo soporta un tramo por dia.
- `User.password` nunca debe serializarse en respuestas.

## Credenciales seed requeridas

Crear estas cuentas en `prisma/seed.ts`:

- `admin@empresa.com` / `Admin1234!` / SUPER_ADMIN / EMP-001
- `rrhh@empresa.com` / `Rrhh1234!` / ADMIN / EMP-002
- `manager@empresa.com` / `Manager1234!` / MANAGER / EMP-003
- `juan.perez@empresa.com` / `Empleado1!` / EMPLOYEE / EMP-004
- `ana.martin@empresa.com` / `Empleado1!` / EMPLOYEE / EMP-005
- `luis.gomez@empresa.com` / `Empleado1!` / EMPLOYEE / EMP-006
- `sara.ruiz@empresa.com` / `Empleado1!` / EMPLOYEE / EMP-007
- `pedro.diaz@empresa.com` / `Empleado1!` / EMPLOYEE / EMP-008

## Bloqueos externos

- Supabase ya esta configurado localmente y la migracion/seed inicial ya se ejecutaron. Si se clona el proyecto en otro equipo, volveran a hacer falta `.env` y `.env.local` reales.
- `.env.local` no debe subirse a git.
- `.env` tampoco debe subirse a git. Se usa porque Prisma CLI v5 carga `.env` por defecto, mientras Next.js usa `.env.local`.
- `NEXTAUTH_SECRET` debe generarse con un valor seguro.
- `npm audit --omit=dev` conserva avisos en Next 14 y PostCSS interno. npm propone `next@16.2.6`, pero eso rompe la restriccion de stack. No actualizar de major sin permiso explicito del usuario.
- El usuario aporto `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; quedaron guardadas en `.env` y `.env.local`.
- El usuario aporto la password de la DB y se configuraron `DATABASE_URL` y `DIRECT_URL` en `.env` y `.env.local`. No guardar la password en memorias ni archivos versionados.
- La direct connection IPv6 `db.<project>.supabase.co:5432` no fue alcanzable desde este entorno (`P1001`). Se cambio `DIRECT_URL` local al pooler session mode `aws-0-eu-west-1.pooler.supabase.com:5432` para intentar migraciones Prisma desde una red IPv4.

## Proxima accion sugerida

Continuar con Fase 6: verificar creacion real de empleado con un caso controlado o de negocio, implementar cambio de password propio desde perfil/seguridad y cerrar la verificacion final de empleados.

## Estado de continuidad

- La sesion actual conserva suficiente contexto para continuar trabajando.
- Aunque se compacte la conversacion, el estado importante esta persistido en `ROADMAP.md`, `MEMORY.md` y `C:\Users\user\.codex\memories\proy_marcaciones_handoff.md`.
- No depender de recordar la password de Supabase desde la conversacion: esta solo en `.env` y `.env.local`, ambos ignorados por git.
- Antes de seguir, asumir como punto de partida: Fases 1, 2, 3, 4 y 5 completadas; Fase 6 esta avanzada pero pendiente de cambio de password propio y prueba real de creacion.
