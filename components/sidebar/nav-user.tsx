"use client";

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
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useSignOut } from "@/hooks/use-signout";
import { authClient } from "@/lib/auth-client";
import {
  EllipsisVerticalIcon,
  CircleUserRoundIcon,
  LogOutIcon,
  LayoutDashboardIcon,
  Tv2,
} from "lucide-react";
import Link from "next/link";

export function NavUser() {
  const { isMobile } = useSidebar();
  const { data: session, isPending } = authClient.useSession();
  const handleSignOut = useSignOut();

  if (isPending) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton size="lg" className="aria-expanded:bg-muted" />
            }
          >
            <Avatar className="size-8 rounded-lg">
              <AvatarImage
                src={
                  session?.user.image ??
                  `https://avatar.vercel.sh/${session?.user.email}`
                }
                alt={
                  session?.user.name && session?.user.name.length > 0
                    ? session?.user.name
                    : session?.user.email.split("@")[0]
                }
              />
              <AvatarFallback className="rounded-lg">
                {session?.user.name && session?.user.name.length > 0
                  ? session?.user.name.charAt(0).toUpperCase()
                  : session?.user.email.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">
                {session?.user.name && session?.user.name.length > 0
                  ? session?.user.name
                  : session?.user.email.split("@")[0]}
              </span>
              <span className="truncate text-xs text-foreground/70">
                {session?.user.email}
              </span>
            </div>
            <EllipsisVerticalIcon className="ml-auto size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="size-8">
                    <AvatarImage
                      src={
                        session?.user.image ??
                        `https://avatar.vercel.sh/${session?.user.email}`
                      }
                      alt={session?.user.name}
                    />
                    <AvatarFallback className="rounded-lg">
                      {session?.user.name && session?.user.name.length > 0
                        ? session?.user.name.charAt(0).toUpperCase()
                        : session?.user.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">
                      {session?.user.name && session?.user.name.length > 0
                        ? session?.user.name
                        : session?.user.email.split("@")[0]}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {session?.user.email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                render={<Link href="/" />}
                className="flex items-center gap-1.5"
              >
                <CircleUserRoundIcon />
                <span>Home Page</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                render={<Link href="/admin" />}
                className="flex items-center gap-1.5"
              >
                <LayoutDashboardIcon />
                Dashboard
              </DropdownMenuItem>
              <DropdownMenuItem
                render={<Link href="/admin/courses" />}
                className="flex items-center gap-1.5"
              >
                <Tv2 />
                Courses
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOutIcon />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
