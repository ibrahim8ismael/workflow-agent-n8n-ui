"use client";

import { usePathname } from "next/navigation";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { AppSidebar } from "@/components/layout/app-sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const isSettings = pathname?.startsWith("/settings");

	if (isSettings) {
		return (
			<div className="h-screen w-screen overflow-hidden bg-background">
				{children}
			</div>
		);
	}

	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset className="p-4 md:p-6 flex flex-col h-screen overflow-hidden">
				<AppHeader />
				<div className="flex flex-1 flex-col overflow-hidden">{children}</div>
			</SidebarInset>
		</SidebarProvider>
	);
}
