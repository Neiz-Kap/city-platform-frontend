import { BadgeCheck, LogOut } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function UserMenu() {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Avatar>
					<AvatarImage src={undefined} alt="shadcn ui kit" />
					<AvatarFallback className="rounded-lg">ИИ</AvatarFallback>
				</Avatar>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				className="w-(--radix-dropdown-menu-trigger-width) min-w-60"
				align="end"
			>
				<DropdownMenuLabel className="p-0">
					<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
						<Avatar>
							<AvatarImage src={undefined} alt="shadcn ui kit" />
							<AvatarFallback className="rounded-lg">ИИ</AvatarFallback>
						</Avatar>
						<div className="grid flex-1 text-left text-sm leading-tight">
							<span className="truncate font-semibold">Иван Иванов</span>
							<span className="text-muted-foreground truncate text-xs">
								ivan.ivanov@example.com
							</span>
						</div>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem>
						<BadgeCheck />
						Профиль
					</DropdownMenuItem>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem>
					<LogOut />
					Выйти
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
