import { AdminGate } from "@/components/admin/admin-guard";
import { AdminShell } from "@/components/admin/admin-shell";
import { SettingsProvider } from "@/components/settings/settings-provider";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGate>
      <SettingsProvider>
        <AdminShell>{children}</AdminShell>
      </SettingsProvider>
    </AdminGate>
  );
}
