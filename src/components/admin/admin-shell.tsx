"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <SidebarInset className="p-4 md:p-6 flex flex-col h-screen overflow-hidden">
        <AdminHeader />
        <div className="flex flex-1 flex-col overflow-y-auto pr-1">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
