import { redirect } from "next/navigation";
import { getCurrentPractice } from "@/lib/practice";
import { DashboardShell } from "@/components/dashboard-shell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const ctx = await getCurrentPractice();
  if (!ctx) {
    redirect("/auth/login");
  }

  return (
    <DashboardShell practiceName={ctx.practiceName}>{children}</DashboardShell>
  );
}
