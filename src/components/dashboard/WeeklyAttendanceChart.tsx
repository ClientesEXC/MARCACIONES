"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

export type WeeklyAttendancePoint = {
  day: string;
  presentes: number;
  ausentes: number;
  tardanzas: number;
};

type WeeklyAttendanceChartProps = {
  data: WeeklyAttendancePoint[];
};

export function WeeklyAttendanceChart({ data }: WeeklyAttendanceChartProps) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: -16, right: 8, top: 8 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="day" tickLine={false} axisLine={false} />
          <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
          <Tooltip
            cursor={{ fill: "rgba(148, 163, 184, 0.14)" }}
            contentStyle={{
              borderRadius: 8,
              borderColor: "#e2e8f0",
              boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)"
            }}
          />
          <Legend />
          <Bar dataKey="presentes" name="Presentes" fill="#16a34a" radius={[4, 4, 0, 0]} />
          <Bar dataKey="ausentes" name="Ausentes" fill="#dc2626" radius={[4, 4, 0, 0]} />
          <Bar dataKey="tardanzas" name="Tardanzas" fill="#d97706" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
