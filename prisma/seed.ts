import bcrypt from "bcryptjs";
import {
  AttendanceStatus,
  DayOfWeek,
  PermissionType,
  PrismaClient,
  RequestStatus,
  Role
} from "@prisma/client";

const prisma = new PrismaClient();

const workWeek: DayOfWeek[] = [
  DayOfWeek.MONDAY,
  DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY,
  DayOfWeek.THURSDAY,
  DayOfWeek.FRIDAY
];

const weekend: DayOfWeek[] = [DayOfWeek.SATURDAY, DayOfWeek.SUNDAY];

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function isWeekend(date: Date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function withTime(date: Date, hour: number, minute: number) {
  const value = startOfDay(date);
  value.setHours(hour, minute, 0, 0);
  return value;
}

async function seedSchedules() {
  const general = await prisma.schedule.upsert({
    where: { id: "seed-schedule-general" },
    update: {},
    create: {
      id: "seed-schedule-general",
      name: "Turno General",
      description: "Lunes a viernes de 09:00 a 17:00",
      workDays: {
        create: [
          ...workWeek.map((dayOfWeek) => ({
            dayOfWeek,
            startTime: "09:00",
            endTime: "17:00",
            isWorkDay: true
          })),
          ...weekend.map((dayOfWeek) => ({
            dayOfWeek,
            startTime: "09:00",
            endTime: "17:00",
            isWorkDay: false
          }))
        ]
      }
    }
  });

  const morning = await prisma.schedule.upsert({
    where: { id: "seed-schedule-morning" },
    update: {},
    create: {
      id: "seed-schedule-morning",
      name: "Turno Manana",
      description: "Lunes a viernes de 07:00 a 15:00",
      workDays: {
        create: [
          ...workWeek.map((dayOfWeek) => ({
            dayOfWeek,
            startTime: "07:00",
            endTime: "15:00",
            isWorkDay: true
          })),
          ...weekend.map((dayOfWeek) => ({
            dayOfWeek,
            startTime: "07:00",
            endTime: "15:00",
            isWorkDay: false
          }))
        ]
      }
    }
  });

  return { general, morning };
}

async function seedUsers(scheduleIds: { generalId: string; morningId: string }) {
  const users = [
    {
      employeeId: "EMP-001",
      dni: "00000001A",
      name: "Admin Sistema",
      email: "admin@empresa.com",
      password: "Admin1234!",
      role: Role.SUPER_ADMIN,
      department: "Direccion",
      position: "Administrador del sistema",
      baseSalary: 42000,
      scheduleId: scheduleIds.generalId
    },
    {
      employeeId: "EMP-002",
      dni: "12345678B",
      name: "Maria Garcia",
      email: "rrhh@empresa.com",
      password: "Rrhh1234!",
      role: Role.ADMIN,
      department: "Recursos Humanos",
      position: "Responsable RRHH",
      baseSalary: 36000,
      scheduleId: scheduleIds.generalId
    },
    {
      employeeId: "EMP-003",
      dni: "23456789C",
      name: "Carlos Lopez",
      email: "manager@empresa.com",
      password: "Manager1234!",
      role: Role.MANAGER,
      department: "Operaciones",
      position: "Manager de operaciones",
      baseSalary: 34000,
      scheduleId: scheduleIds.generalId
    },
    {
      employeeId: "EMP-004",
      dni: "34567890D",
      name: "Juan Perez",
      email: "juan.perez@empresa.com",
      password: "Empleado1!",
      role: Role.EMPLOYEE,
      department: "Operaciones",
      position: "Tecnico PRL",
      baseSalary: 26000,
      scheduleId: scheduleIds.generalId
    },
    {
      employeeId: "EMP-005",
      dni: "45678901E",
      name: "Ana Martin",
      email: "ana.martin@empresa.com",
      password: "Empleado1!",
      role: Role.EMPLOYEE,
      department: "Operaciones",
      position: "Tecnica PRL",
      baseSalary: 26500,
      scheduleId: scheduleIds.generalId
    },
    {
      employeeId: "EMP-006",
      dni: "56789012F",
      name: "Luis Gomez",
      email: "luis.gomez@empresa.com",
      password: "Empleado1!",
      role: Role.EMPLOYEE,
      department: "Administracion",
      position: "Administrativo",
      baseSalary: 24000,
      scheduleId: scheduleIds.generalId
    },
    {
      employeeId: "EMP-007",
      dni: "67890123G",
      name: "Sara Ruiz",
      email: "sara.ruiz@empresa.com",
      password: "Empleado1!",
      role: Role.EMPLOYEE,
      department: "Administracion",
      position: "Administrativa",
      baseSalary: 24500,
      scheduleId: scheduleIds.generalId
    },
    {
      employeeId: "EMP-008",
      dni: "78901234H",
      name: "Pedro Diaz",
      email: "pedro.diaz@empresa.com",
      password: "Empleado1!",
      role: Role.EMPLOYEE,
      department: "Operaciones",
      position: "Tecnico PRL",
      baseSalary: 25500,
      scheduleId: scheduleIds.morningId
    }
  ];

  for (const user of users) {
    const password = await bcrypt.hash(user.password, 12);
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        dni: user.dni,
        name: user.name,
        employeeId: user.employeeId,
        role: user.role,
        department: user.department,
        position: user.position,
        baseSalary: user.baseSalary,
        scheduleId: user.scheduleId
      },
      create: {
        ...user,
        password
      }
    });
  }
}

async function seedHolidays() {
  const holidays = [
    ["Ano Nuevo", "2024-01-01"],
    ["Viernes Santo", "2024-03-29"],
    ["Fiesta del Trabajo", "2024-05-01"],
    ["Asuncion de la Virgen", "2024-08-15"],
    ["Fiesta Nacional de Espana", "2024-10-12"],
    ["Todos los Santos", "2024-11-01"],
    ["Dia de la Constitucion", "2024-12-06"],
    ["Inmaculada Concepcion", "2024-12-08"],
    ["Navidad", "2024-12-25"],
    ["Ano Nuevo", "2025-01-01"],
    ["Viernes Santo", "2025-04-18"],
    ["Fiesta del Trabajo", "2025-05-01"],
    ["Asuncion de la Virgen", "2025-08-15"],
    ["Fiesta Nacional de Espana", "2025-10-12"],
    ["Todos los Santos", "2025-11-01"],
    ["Dia de la Constitucion", "2025-12-06"],
    ["Inmaculada Concepcion", "2025-12-08"],
    ["Navidad", "2025-12-25"]
  ] as const;

  for (const [name, date] of holidays) {
    await prisma.holiday.upsert({
      where: { id: `seed-holiday-${date}` },
      update: {},
      create: {
        id: `seed-holiday-${date}`,
        name,
        date: startOfDay(new Date(`${date}T00:00:00`)),
        isNational: true,
        country: "ES"
      }
    });
  }
}

async function seedAttendance() {
  const employees = await prisma.user.findMany({
    where: { role: Role.EMPLOYEE },
    include: { schedule: true }
  });
  const today = startOfDay(new Date());

  for (const employee of employees) {
    for (let offset = 30; offset >= 1; offset -= 1) {
      const date = startOfDay(addDays(today, -offset));
      if (isWeekend(date)) {
        continue;
      }

      const pattern = (offset + Number(employee.employeeId.slice(-1))) % 20;
      const isMorning = employee.employeeId === "EMP-008";
      const startHour = isMorning ? 7 : 9;
      const endHour = isMorning ? 15 : 17;

      if (pattern === 0) {
        await prisma.attendance.upsert({
          where: { userId_date: { userId: employee.id, date } },
          update: {},
          create: {
            userId: employee.id,
            date,
            status: AttendanceStatus.ABSENT,
            notes: "Ausencia generada por seed"
          }
        });
        continue;
      }

      if (pattern === 1) {
        const permission = await prisma.permission.create({
          data: {
            userId: employee.id,
            type: PermissionType.PERSONAL,
            startDate: date,
            endDate: date,
            reason: "Permiso personal generado por seed",
            status: RequestStatus.APPROVED,
            approvedAt: new Date()
          }
        });

        await prisma.attendance.upsert({
          where: { userId_date: { userId: employee.id, date } },
          update: {},
          create: {
            userId: employee.id,
            date,
            status: AttendanceStatus.ON_LEAVE,
            notes: `Permiso aprobado ${permission.id}`
          }
        });
        continue;
      }

      const lateMinutes = pattern === 2 ? 18 : 0;
      const checkIn = withTime(date, startHour, lateMinutes);
      const checkOut = withTime(date, endHour, pattern === 3 ? -15 : 0);
      const totalHours =
        Math.round(
          ((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60)) * 100
        ) / 100;

      await prisma.attendance.upsert({
        where: { userId_date: { userId: employee.id, date } },
        update: {},
        create: {
          userId: employee.id,
          date,
          checkIn,
          checkOut,
          status:
            lateMinutes > 15 ? AttendanceStatus.LATE : AttendanceStatus.PRESENT,
          totalHours,
          lateMinutes
        }
      });
    }
  }
}

async function main() {
  const schedules = await seedSchedules();
  await seedUsers({
    generalId: schedules.general.id,
    morningId: schedules.morning.id
  });
  await seedHolidays();
  await seedAttendance();
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
