import { AppShell } from "@/components/layout/app-shell";
import { AuthGate } from "@/components/providers/auth-gate";
import { SettingsProvider } from "@/components/settings/settings-provider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <SettingsProvider>
        <AppShell>{children}</AppShell>
      </SettingsProvider>
    </AuthGate>
  );
}
