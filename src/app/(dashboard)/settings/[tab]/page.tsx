import { SettingsView } from "@/components/settings/settings-view";
import { type SettingsPageId } from "@/components/settings/settings-data";

export default async function SettingsTabRoute({
  params,
}: {
  params: Promise<{ tab: string }>;
}) {
  const resolvedParams = await params;
  return <SettingsView defaultTab={(resolvedParams.tab as SettingsPageId) || "general"} />;
}
