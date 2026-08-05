"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import CustomButton from "@/components/shared/Button";
import { Separator } from "@/components/ui/separator";
import { CreditsRadial } from "@/components/layout/credits-radial";
import { WorkersRadial } from "@/components/layout/workers-radial";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { BellIcon, ZapIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

export function AppHeader() {
	const { t } = useTranslation("common");

	return (
		<header className={cn("px-4 mb-6 flex items-center justify-between gap-2 md:px-2")}>
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
					{t("upgrade")}
				</CustomButton>

				<Separator
					className="h-4 data-[orientation=vertical]:self-center hidden sm:block"
					orientation="vertical"
				/>

				<LanguageSwitcher variant="ghost" size="sm" />

				<Button aria-label={t("notifications")} size="icon" variant="ghost">
					<BellIcon />
				</Button>
			</div>
		</header>
	);
}

