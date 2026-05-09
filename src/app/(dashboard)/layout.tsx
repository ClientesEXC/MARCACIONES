import { redirect } from "next/navigation";

import { auth } from "@/../auth";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";

export default async function DashboardLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar user={session.user} />
      <div className="lg:pl-60">
        <Header user={session.user} />
        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

export async function generateMetadata() {
  const session = await auth();

  return {
    title: session?.user
      ? `Control de Asistencia - ${session.user.name}`
      : "Control de Asistencia"
  };
}
