"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import CustomButton from "@/components/shared/Button";
import { Separator } from "@/components/ui/separator";
import { CreditsRadial } from "@/components/layout/credits-radial";
import { WorkersRadial } from "@/components/layout/workers-radial";
import { BellIcon, ZapIcon } from "lucide-react";

export function AppHeader() {
	return (
		<header className={cn("pxx-4 mb-6 flex items-center justify-between gap-2 md:px-2")}>
			<div className="flex items-center gap-3">
				{/* Header left area empty or reserved for future content */}
			</div>

			<div className="flex items-center gap-3">
				{/* Workers radial */}
				<WorkersRadial />
				<Separator orientation="vertical" className="h-6 hidden sm:block" />

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
