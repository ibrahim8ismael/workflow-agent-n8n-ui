"use client";

import { N8nConnectionManager } from "@/components/integrations/n8n-connection-manager";

export function IntegrationsPage() {
  return (
    <div className="p-10">
      <N8nConnectionManager />
    </div>
  );
}
