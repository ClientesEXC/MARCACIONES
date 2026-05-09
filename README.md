# Sistema de Control de Asistencia Laboral

Aplicacion profesional de control de asistencia, marcacion laboral, permisos, vacaciones, nominas visuales y reportes.

## Requisitos

- Node.js 18+
- Cuenta en Supabase
- Cuenta en Vercel

## Configuracion de Supabase

1. Crear un proyecto en Supabase.
2. Ir a Project Settings -> Database -> Connection string.
3. Copiar la URL "Transaction" del pooler, puerto 6543, para `DATABASE_URL`.
4. Copiar la URL "Direct connection", puerto 5432, para `DIRECT_URL`.
5. Sustituir la contrasena y project ref en `.env.local`.

## Instalacion local

```bash
npm install
cp .env.example .env.local
cp .env.example .env
npm run setup
npm run dev
```

Abrir `http://localhost:3000`.

Nota: Next.js usa `.env.local` durante el desarrollo. Prisma CLI v5 carga `.env` por defecto para `prisma migrate`, por eso ambos archivos locales deben tener los mismos valores y ambos estan ignorados por git.

## Variables de entorno

```env
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
AUTH_SECRET="replace-with-openssl-rand-base64-32"
AUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="replace-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
```

Si la direct connection IPv6 no responde desde tu red, usa el pooler en modo session para `DIRECT_URL`:

```env
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
```

## Despliegue en Vercel

1. Conectar el repositorio a Vercel.
2. En Settings -> Environment Variables, anadir:
   - `DATABASE_URL`: Supabase transaction pooler, puerto 6543, con `?pgbouncer=true`.
   - `DIRECT_URL`: Supabase direct connection o pooler session mode para migraciones.
   - `AUTH_SECRET`: secreto seguro generado con `openssl rand -base64 32`.
   - `AUTH_URL`: URL publica exacta de Vercel, por ejemplo `https://marcaciones.vercel.app`.
   - `NEXTAUTH_SECRET`: mismo valor que `AUTH_SECRET`, por compatibilidad.
   - `NEXTAUTH_URL`: mismo valor que `AUTH_URL`, por compatibilidad.
3. Vercel ejecutara `prisma generate && next build`.
4. Ejecutar el seed una sola vez desde local apuntando a Supabase:

```bash
npm run db:seed
```

Si el login muestra `Server error - There is a problem with the server configuration`,
revisar los logs de Vercel en el deployment. Las causas mas comunes son:

- Falta `AUTH_SECRET`/`NEXTAUTH_SECRET` en Production.
- `AUTH_URL`/`NEXTAUTH_URL` no coincide exactamente con la URL publica `https://...` del deployment.
- `DATABASE_URL` no apunta al pooler transaction de Supabase o la password no esta URL-encoded.
- Las variables se agregaron en Vercel pero no se hizo redeploy.

## Credenciales seed

| Rol | Email | Contrasena | DNI |
| --- | --- | --- | --- |
| Super Admin | admin@empresa.com | Admin1234! | 00000001A |
| RRHH Admin | rrhh@empresa.com | Rrhh1234! | 12345678B |
| Manager | manager@empresa.com | Manager1234! | 23456789C |
| Empleado | juan.perez@empresa.com | Empleado1! | 34567890D |

El login solo funciona con email y contrasena. No existe registro publico; solo administradores crean usuarios.

## Estado actual

El scaffold base, Prisma schema y seed inicial existen. La autenticacion real y los modulos de negocio se implementaran en las siguientes fases del roadmap.
