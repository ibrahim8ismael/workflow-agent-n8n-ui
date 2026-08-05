"use client";

import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import {
	BookOpenIcon,
	ChevronsUpDown,
	CreditCardIcon,
	LifeBuoyIcon,
	LogOutIcon,
	SettingsIcon,
	UserIcon,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { logout } from "@/lib/api/auth";
import { useRouter } from "next/navigation";
import { useSettings } from "@/components/settings/settings-provider";
import { useTranslation } from "react-i18next";

export function NavUser() {
	const router = useRouter();
	const user = useAuthStore((s) => s.user);
	const clearSession = useAuthStore((s) => s.clearSession);
	const { openSettings } = useSettings();
	const { t } = useTranslation("sidebar");

	const handleLogout = async () => {
		try {
			await logout();
		} catch {
			// Proceed with local sign-out even if the API call fails.
		}
		clearSession();
		router.replace("/signin");
	};

	const name = user?.name || user?.email?.split("@")[0] || "Woops user";
	const email = user?.email || "";

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				nativeButton={false}
				render={
					<SidebarMenuButton
						size="lg"
						className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
						render={<div />}
					/>
				}
			>
				<Avatar className="h-8 w-8 rounded-lg">
					{user?.avatarUrl && <AvatarImage src={user.avatarUrl} alt={name} />}
					<AvatarFallback className="rounded-lg">
						{name.charAt(0).toUpperCase()}
					</AvatarFallback>
				</Avatar>
				<div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden rtl:text-right">
					<span className="truncate font-semibold">{name}</span>
					<span className="truncate text-xs text-muted-foreground">{email}</span>
				</div>
				<ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden rtl:ml-0 rtl:mr-auto" />
			</DropdownMenuTrigger>

			<DropdownMenuContent
				align="end"
				className="w-64 rounded-xl border-border/70 bg-popover/95 p-2 shadow-xl ring-1 ring-foreground/5 backdrop-blur-md"
			>
				<DropdownMenuGroup>
					<DropdownMenuLabel className="p-1 font-normal">
						<div className="flex items-center gap-3 text-left text-sm rtl:text-right">
							<Avatar className="size-10 rounded-xl">
								{user?.avatarUrl && <AvatarImage src={user.avatarUrl} alt={name} />}
								<AvatarFallback className="rounded-xl bg-accent text-accent-foreground">
									{name.charAt(0).toUpperCase()}
								</AvatarFallback>
							</Avatar>
							<div className="min-w-0">
								<div className="truncate font-semibold text-foreground">{name}</div>
								<div className="truncate text-xs text-muted-foreground">{email}</div>
								<div className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80">
									Workspace owner
								</div>
							</div>
						</div>
					</DropdownMenuLabel>
				</DropdownMenuGroup>

				<DropdownMenuSeparator />

				<DropdownMenuGroup>
					<DropdownMenuItem
						className="h-9 rounded-lg px-2.5 font-medium"
						onClick={() => openSettings("profile")}
					>
						<UserIcon className="text-muted-foreground" />
						{t("profile")}
					</DropdownMenuItem>
					<DropdownMenuItem className="h-9 rounded-lg px-2.5 font-medium">
						<LifeBuoyIcon className="text-muted-foreground" />
						{t("support")}
					</DropdownMenuItem>
					<DropdownMenuItem className="h-9 rounded-lg px-2.5 font-medium">
						<BookOpenIcon className="text-muted-foreground" />
						{t("docs")}
					</DropdownMenuItem>
					<DropdownMenuItem
						className="h-9 rounded-lg px-2.5 font-medium"
						onClick={() => openSettings("billing")}
					>
						<CreditCardIcon className="text-muted-foreground" />
						{t("billing")}
					</DropdownMenuItem>
					<DropdownMenuItem
						className="h-9 rounded-lg px-2.5 font-medium"
						onClick={() => openSettings("general")}
					>
						<SettingsIcon className="text-muted-foreground" />
						{t("settings")}
					</DropdownMenuItem>
				</DropdownMenuGroup>

				<DropdownMenuSeparator />

				<DropdownMenuGroup>
					<DropdownMenuItem
						className="h-9 rounded-lg px-2.5 font-medium"
						variant="destructive"
						onClick={handleLogout}
					>
						<LogOutIcon />
						{t("logout")}
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

