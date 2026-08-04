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
import { UserIcon, BellIcon, CommandIcon, LifeBuoyIcon, BookOpenIcon, CreditCardIcon, LogOutIcon, ChevronsUpDown } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { logout } from "@/lib/api/auth";
import { useRouter } from "next/navigation";

export function NavUser() {
	const router = useRouter();
	const user = useAuthStore((s) => s.user);
	const clearSession = useAuthStore((s) => s.clearSession);

	const handleLogout = async () => {
		try {
			await logout();
		} catch {
			// proceed with local sign-out even if the API call fails
		}
		clearSession();
		router.replace("/signin");
	};

	const name = user?.name || user?.email?.split("@")[0] || "Woops user";
	const email = user?.email || "";

	return (
		<DropdownMenu>
			<DropdownMenuTrigger nativeButton={false} render={<SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground" render={<div />} />}>
				<Avatar className="h-8 w-8 rounded-lg">
					{user?.avatarUrl && <AvatarImage src={user.avatarUrl} alt={name} />}
					<AvatarFallback className="rounded-lg">{name.charAt(0).toUpperCase()}</AvatarFallback>
				</Avatar>
				<div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
					<span className="truncate font-semibold">{name}</span>
					<span className="truncate text-xs text-muted-foreground">{email}</span>
				</div>
				<ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-60">
				<DropdownMenuLabel className="p-0 font-normal">
					<div className="flex items-center gap-3 px-2 py-1.5 text-left text-sm">
						<Avatar className="size-10">
							{user?.avatarUrl && <AvatarImage src={user.avatarUrl} />}
							<AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
						</Avatar>
						<div>
							<span className="font-medium text-foreground">{name}</span>{" "}
							<br />
							<div className="max-w-full overflow-hidden overflow-ellipsis whitespace-nowrap text-muted-foreground text-xs">
								{email}
							</div>
							<div className="mt-0.5 text-[10px] text-muted-foreground">
								Workspace owner
							</div>
						</div>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem>
						<UserIcon
						/>
						Profile
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem>
						<BellIcon
						/>
						Notifications
					</DropdownMenuItem>
					<DropdownMenuItem>
						<CommandIcon
						/>
						Keyboard shortcuts
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem>
						<LifeBuoyIcon
						/>
						Seller help
					</DropdownMenuItem>
					<DropdownMenuItem>
						<BookOpenIcon
						/>
						Seller guides
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem>
						<CreditCardIcon
						/>
						Plan & billing
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem
						className="w-full cursor-pointer"
						variant="destructive"
						onClick={handleLogout}
					>
						<LogOutIcon
						/>
						Log out
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
