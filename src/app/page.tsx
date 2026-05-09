import { redirect } from "next/navigation";

import { auth } from "@/../auth";
import { getDefaultPathForRole } from "@/lib/navigation";

export default async function HomePage() {
  const session = await auth();

  redirect(session?.user ? getDefaultPathForRole(session.user.role) : "/login");
}
