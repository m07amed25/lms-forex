"use client";

import {
  BookOpen,
  ChevronDown,
  Home,
  LayoutDashboard,
  LogOut,
  Settings,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

interface MenuItem {
  label: string;
  icon: React.ElementType;
  href?: string;
  variant?: "default" | "destructive";
  onClick?: () => void;
}

interface SessionUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
}

export function UserMenu({ user }: { user: SessionUser }) {
  const router = useRouter();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
          router.refresh();
          toast.success("Logged out successfully");
        },
        onError: () => {
          toast.error("Failed to log out");
        },
      },
    });
  };

  const initials =
    user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  const menuItems: MenuItem[] = [
    { label: "Home", icon: Home, href: "/" },
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Profile", icon: User, href: "/profile" },
    { label: "Courses", icon: BookOpen, href: "/courses" },
    { label: "Settings", icon: Settings, href: "/settings" },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className="group flex h-10 items-center gap-2 rounded-full border border-border/50 bg-background/50 pl-1 pr-2.5 py-1 transition-all duration-300 hover:bg-accent hover:ring-2 hover:ring-primary/20 active:scale-95"
          >
            <Avatar className="h-8 w-8 ring-1 ring-border/50 transition-transform duration-500 group-hover:scale-105">
              <AvatarImage src={user.image || ""} alt={user.name || "User"} />
              <AvatarFallback className="bg-primary/5 text-[10px] font-bold text-primary/80">
                {initials}
              </AvatarFallback>
            </Avatar>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform duration-300 group-aria-expanded:rotate-180" />
          </Button>
        }
      />

      <DropdownMenuContent
        className="w-64 animate-in fade-in-0 zoom-in-95 data-[side=bottom]:slide-in-from-top-2"
        align="end"
        sideOffset={8}
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="p-2 font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-semibold leading-none tracking-tight">
                {user.name}
              </p>
              <p className="truncate text-xs leading-none text-muted-foreground">
                {user.email}
              </p>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="mx-1 my-1" />

        <DropdownMenuGroup className="space-y-0.5 p-1">
          {menuItems.map((item) => (
            <DropdownMenuItem
              key={item.label}
              onClick={() => item.href && router.push(item.href)}
              className="group flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-accent focus:bg-accent"
            >
              <item.icon className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary group-focus:text-primary" />
              <span className="text-sm font-medium">{item.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="mx-1 my-1" />

        <DropdownMenuItem
          onClick={handleSignOut}
          className="group flex cursor-pointer items-center gap-3 rounded-md px-3 py-2 text-destructive transition-colors hover:bg-destructive/5 focus:bg-destructive/5"
        >
          <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          <span className="text-sm font-semibold">Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
