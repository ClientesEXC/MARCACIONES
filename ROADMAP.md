# Roadmap - Sistema de Control de Asistencia Laboral

Estado actual: Fases 1-5 completadas. Scaffold Next.js 14 creado, Supabase migrado, seed cargado, autenticacion real con NextAuth v5 verificada, layout base operativo y dashboard con datos reales desde Prisma. Siguiente fase: Fase 6 - Empleados.

Este roadmap convierte las instrucciones en una secuencia de trabajo verificable. El orden sigue el mandato del prompt maestro y evita avanzar a modulos de negocio antes de tener base, autenticacion y layout estables.

## Principios no negociables

- Construir una aplicacion real y funcional, no una demo ni mocks.
- Stack fijo: Next.js 14 App Router, TypeScript, Tailwind, shadcn/ui, Prisma 5, Supabase PostgreSQL, NextAuth.js v5 con Credentials, Zod, Lucide, Recharts y `@react-pdf/renderer`.
- No usar Supabase Auth.
- No crear registro publico. Solo ADMIN y SUPER_ADMIN crean usuarios.
- No devolver nunca `password` desde APIs.
- Validar entradas con Zod en endpoints y formularios.
- Aplicar RBAC tanto en middleware como en endpoints sensibles.
- Mantener UI profesional, minimalista, responsive desde 375px.
- Todas las listas deben tener paginacion de 20 items por pagina.

## Fase 0 - Preparacion y saneamiento

- [x] Revisar si `INSTRUCCIONES.txt` debe mantenerse como fuente maestra.
- [x] Corregir o preservar el encoding del archivo si se necesita editarlo. Actualmente se visualiza con caracteres mojibake en palabras acentuadas.
- [x] Crear repositorio git si no existe.
- [x] Confirmar version de Node.js 18+.

Salida esperada:
- Workspace preparado para scaffolding.
- `ROADMAP.md` y `MEMORY.md` como documentos vivos.

## Fase 1 - Setup inicial

- [x] Inicializar Next.js 14 con App Router, TypeScript y Tailwind.
- [x] Instalar dependencias principales:
  - `next`, `react`, `react-dom`, `typescript`
  - `prisma`, `@prisma/client`, `tsx`
  - `next-auth@beta` o version v5 estable disponible
  - `bcryptjs` o `bcrypt`, `zod`
  - `lucide-react`, `recharts`, `@react-pdf/renderer`
  - shadcn/ui y utilidades necesarias (`class-variance-authority`, `clsx`, `tailwind-merge`, etc.)
- [x] Crear `vercel.json` con `prisma generate && next build`.
- [x] Crear `.env.example` sin secretos.
- [x] Crear `.env.local` solo con plantilla local si el usuario aporta credenciales de Supabase.
- [x] Configurar scripts requeridos en `package.json`.
- [x] Crear `README.md` con instalacion local, Supabase, Vercel y credenciales seed.

Verificacion:
- [x] `npm install` completa.
- [x] `npm run build` completa.
- [x] `npm run lint` completa.
- [x] `npx tsc --noEmit` completa.
- [x] `npx prisma validate` completa.

## Fase 2 - Prisma y base de datos

- [x] Crear `prisma/schema.prisma` exactamente con el schema indicado.
- [x] Configurar `DATABASE_URL` para Supabase pooler y `DIRECT_URL` para migraciones.
- [x] Ejecutar migracion cuando existan credenciales reales de Supabase.
- [x] Crear `prisma/seed.ts` con:
  - SUPER_ADMIN, ADMIN, MANAGER y 5 EMPLOYEE.
  - Horarios "Turno General" y "Turno Manana".
  - Festivos nacionales de Espana 2024 y 2025.
  - Asistencia realista de los ultimos 30 dias.
- [x] Hashear passwords con bcrypt 12 rounds.

Verificacion:
- [x] `npm run db:migrate` funciona contra Supabase.
- [x] `npm run db:seed` es idempotente o al menos puede ejecutarse limpiamente en base vacia.
- [ ] `npx prisma studio` permite revisar datos.

## Fase 3 - Autenticacion y autorizacion

- [x] Crear `auth.ts` en raiz con NextAuth v5 Credentials provider.
- [x] Implementar login por email/password.
- [x] Enriquecer JWT y session con `id`, `name`, `email`, `role`, `employeeId`, `dni`.
- [x] Crear ruta `/api/auth/[...nextauth]/route.ts`.
- [x] Crear pagina `/login` sin registro, sin recuperacion de contrasena y sin enlaces publicos de alta.
- [x] Implementar middleware para proteger dashboard y aplicar RBAC por ruta.
- [x] Implementar rate limit basico en login: maximo 5 intentos.

Verificacion:
- [x] Login funciona con usuarios del seed.
- [x] Rutas privadas redirigen a `/login` sin sesion.
- [x] EMPLOYEE no puede entrar a rutas admin.
- [x] No existe ruta ni enlace de registro publico.

## Fase 4 - Layout base y UI compartida

- [x] Crear layout dashboard con sidebar fija desktop y drawer mobile.
- [x] Crear header con titulo, fecha/hora y usuario.
- [x] Implementar menu por rol.
- [x] Crear componentes compartidos:
  - `DataTable`
  - `StatusBadge`
  - `ConfirmDialog`
  - `PageHeader`
- [x] Configurar Sonner/toasts y estados de carga.

Verificacion:
- [x] Navegacion por rol correcta.
- [x] Mobile preparado para 375px sin solapes evidentes en layout base.

## Fase 5 - Dashboard

- [x] KPIs reales: activos, presentes hoy, ausentes hoy, tardanzas.
- [x] Tabla de asistencia de hoy.
- [x] Grafica semanal con Recharts.
- [x] Lista de proximos festivos.
- [x] Solicitudes pendientes para ADMIN/MANAGER.

Verificacion:
- [x] Datos salen de Prisma, no de mocks.
- [x] Empty/loading/error states presentes.

## Fase 6 - Empleados

- [x] API CRUD `/api/employees`.
- [x] Validaciones Zod para DNI/NIE espanol, email, password inicial y datos laborales.
- [x] Lista con busqueda, filtros y paginacion.
- [x] Crear empleado con password hasheada.
- [x] Mostrar credenciales iniciales solo al crear.
- [x] Detalle/edicion de empleado.
- [x] Activar/desactivar empleado.
- [x] Reset de password por admin.
- [ ] Cambio de password propio desde perfil/seguridad.

Verificacion:
- [ ] ADMIN/SUPER_ADMIN pueden crear usuarios.
- [ ] Password nunca se expone despues del resumen de creacion.
- [x] EMPLOYEE no puede leer otros empleados.

## Fase 7 - Marcacion de asistencia

- [ ] Utilidades de fecha y calculo de asistencia.
- [ ] API `/api/attendance/mark`:
  - Crear check-in si no hay registro del dia.
  - Crear check-out si ya hay entrada.
  - Bloquear doble cierre.
  - Validar festivo y dia laborable.
  - Calcular horas y tardanza.
- [ ] Vista empleado `/attendance/mark`.
- [ ] Vista admin `/attendance` con filtros, paginacion y CSV.
- [ ] Edicion manual por admin con `isManualEdit` y `editedBy`.

Verificacion:
- [ ] Empleado marca entrada y salida.
- [ ] Total de horas y lateMinutes se calculan correctamente.
- [ ] Admin corrige registros y queda trazabilidad.

## Fase 8 - Horarios y festivos

- [ ] CRUD de horarios con WorkDay por dia.
- [ ] Validar formato HH:mm y unicidad por dia.
- [ ] CRUD de festivos.
- [ ] Filtro por ano en festivos.
- [ ] Soportar festivos recurrentes.

Verificacion:
- [ ] Horarios se asignan a empleados.
- [ ] Marcacion respeta horario y festivos.

## Fase 9 - Permisos y vacaciones

- [ ] CRUD/lista de permisos con tabs por estado.
- [ ] Nueva solicitud de permiso por empleado.
- [ ] Aprobar/rechazar permiso por ADMIN/MANAGER.
- [ ] Al aprobar permiso, crear/actualizar Attendance con `ON_LEAVE`.
- [ ] Flujo equivalente para vacaciones.
- [ ] Calcular dias laborables excluyendo fines de semana y festivos.
- [ ] Validar saldo de vacaciones.
- [ ] Descontar `vacationDays` solo al aprobar.

Verificacion:
- [ ] EMPLOYEE solo ve sus solicitudes.
- [ ] ADMIN/MANAGER aprueban y rechazan.
- [ ] Asistencia refleja permisos/vacaciones aprobados.

## Fase 10 - Nominas

- [ ] API `/api/payroll`.
- [ ] Selector de periodo.
- [ ] Calculo mensual para empleados activos.
- [ ] Deducciones por ausencias y tardanzas segun reglas simplificadas.
- [ ] Tabla visual.
- [ ] Detalle de nomina.
- [ ] Exportacion PDF con `@react-pdf/renderer`.

Verificacion:
- [ ] Nominas se generan para el mes actual.
- [ ] `@@unique([userId, period])` evita duplicados.
- [ ] Export PDF abre correctamente.

## Fase 11 - Reportes

- [ ] Reporte mensual de asistencia.
- [ ] Reporte de horas por empleado.
- [ ] Reporte de ausentismo.
- [ ] Filtros por fecha y empleado.
- [ ] Exportacion CSV.

Verificacion:
- [ ] Todos los reportes usan datos reales.
- [ ] Tablas son responsivas con scroll horizontal.

## Fase 12 - Pulido y cierre

- [ ] Revisar responsive en 375px y desktop.
- [ ] Revisar que no haya `console.log`.
- [ ] Revisar que no haya `any`.
- [ ] Revisar sanitizacion de inputs.
- [ ] Ejecutar `npm run build`.
- [ ] Ejecutar checklist final de `INSTRUCCIONES.txt`.
- [ ] Actualizar `MEMORY.md` con decisiones y estado real.
- [ ] Actualizar este roadmap marcando lo completado.

## Riesgos conocidos

- Las credenciales reales de Supabase no estan disponibles en el repo. Las migraciones y seed dependeran de que el usuario las aporte en `.env.local`.
- Prisma CLI v5 carga `.env` por defecto; por eso existe `.env` local ignorado por git ademas de `.env.local`.
- Vercel carga la pagina de login. Se configuraron variables Production, se redeployo `https://marcaciones-one.vercel.app` con estado Ready y el usuario confirmo que el login funciona correctamente en navegador.
- `npm audit --omit=dev` mantiene avisos en Next 14 y PostCSS interno. npm propone Next 16, pero el stack fijado exige Next.js 14. Decision pendiente: aceptar riesgo temporal, revisar parche de Next 14 si aparece, o pedir autorizacion para subir de major en el futuro.
- NextAuth v5 puede tener cambios de API segun la version disponible al instalar. Usar documentacion oficial si hay dudas.
- El prompt exige Prisma conectado a Supabase pooler para runtime y direct connection para migraciones; configurar mal estas URLs rompera deploy o migrate.
- El schema solo permite un tramo horario por dia. "Turno Partido" debe simplificarse porque el modelo `WorkDay` no soporta dos tramos.
- `DateTime` para `date` en Attendance debe normalizarse a inicio de dia para evitar duplicados por hora.
