import { AppShell } from "@/components/layout/app-shell";
import { AuthGate } from "@/components/providers/auth-gate";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <AppShell>{children}</AppShell>
    </AuthGate>
  );
}
