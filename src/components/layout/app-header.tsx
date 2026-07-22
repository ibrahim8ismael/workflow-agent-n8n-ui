"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AppBreadcrumbs } from "@/components/layout/app-breadcrumbs";
import { CustomSidebarTrigger } from "@/components/layout/custom-sidebar-trigger";
import { navLinks } from "@/components/shared/app-shared";
import CustomButton from "@/components/shared/Button";
import { CreditsRadial } from "@/components/layout/credits-radial";
import { BellIcon, ZapIcon } from "lucide-react";

const activeItem = navLinks.find((item) => item.isActive);

export function AppHeader() {
	return (
		<header className={cn("pxx-4 mb-6 flex items-center justify-between gap-2 md:px-2")}>
			<div className="flex items-center gap-3">
				<CustomSidebarTrigger />
				<Separator
					className="mr-2 h-4 data-[orientation=vertical]:self-center"
					orientation="vertical"
				/>
				<AppBreadcrumbs page={activeItem} />
			</div>

			<div className="flex items-center gap-3">
				{/* Credits radial */}
				<CreditsRadial />

				<CustomButton size="sm" showArrow={false} className="hidden sm:inline-flex py-1.5 px-4 text-xs gap-1">
					<ZapIcon className="w-3 h-3" />
					Upgrade
				</CustomButton>

				<Separator
					className="h-4 data-[orientation=vertical]:self-center hidden sm:block"
					orientation="vertical"
				/>

				<Button aria-label="Notifications" size="icon" variant="ghost">
					<BellIcon />
				</Button>
			</div>
		</header>
	);
}
