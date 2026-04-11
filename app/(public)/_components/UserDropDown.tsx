"use client";

import {
  BookOpen,
  ChevronDown,
  Home,
  LayoutDashboard,
  LogOut,
  Mail,
  Settings,
  ShieldCheck,
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
import { useSignOut } from "@/hooks/use-signout";
import { getGradientFromString } from "@/lib/utils";

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

  const handleSignOut = useSignOut();

  const isEmailUser = !user.image;

  const initials = user.email?.charAt(0).toUpperCase() || "U";

  const menuItems: MenuItem[] = [
    { label: "Home", icon: Home, href: "/" },
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { label: "Courses", icon: BookOpen, href: "/courses" },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className="group flex h-10 items-center gap-2 rounded-full border border-border/50 bg-background/50 pl-1 pr-2.5 py-1 transition-all duration-300 hover:bg-accent hover:ring-2 hover:ring-primary/20 active:scale-95"
          >
            {isEmailUser ? (
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold text-white shadow-sm ring-1 ring-white/20 transition-transform duration-500 group-hover:scale-105"
                style={{ background: getGradientFromString(user.email) }}
              >
                {initials}
              </div>
            ) : (
              <Avatar className="h-8 w-8 ring-1 ring-border/50 transition-transform duration-500 group-hover:scale-105">
                <AvatarImage
                  src={user.image ?? `https://avatar.vercel.sh/${user.email}`}
                  alt={user.name || "User"}
                />
                <AvatarFallback className="bg-primary/5 text-[10px] font-bold text-primary/80">
                  {initials}
                </AvatarFallback>
              </Avatar>
            )}
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
          <DropdownMenuLabel className="p-3 font-normal">
            <div className="flex items-start gap-3">
              {/* Inline avatar in the dropdown header */}
              {isEmailUser ? (
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm"
                  style={{ background: getGradientFromString(user.email) }}
                >
                  {initials}
                </div>
              ) : (
                <Avatar className="h-10 w-10 shrink-0 ring-1 ring-border/50">
                  <AvatarImage
                    src={user.image || ""}
                    alt={user.name || "User"}
                  />
                  <AvatarFallback className="bg-primary/5 text-xs font-bold text-primary/80">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className="flex flex-col gap-1 overflow-hidden">
                <p className="text-sm font-semibold leading-none tracking-tight">
                  {user.name}
                </p>
                <p className="truncate text-xs leading-none text-muted-foreground">
                  {user.email}
                </p>
                {/* Auth method badge */}
                {isEmailUser ? (
                  <span className="mt-1 inline-flex w-fit items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                    <Mail className="h-2.5 w-2.5" />
                    Email Login
                  </span>
                ) : (
                  <span className="mt-1 inline-flex w-fit items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    <svg
                      className="h-2.5 w-2.5"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                    GitHub
                  </span>
                )}
              </div>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="mx-1 my-1" />

        {/* Email verification status for email users */}
        {isEmailUser && (
          <>
            <div className="mx-3 my-2 flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                Email verified
              </span>
            </div>
            <DropdownMenuSeparator className="mx-1 my-1" />
          </>
        )}

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
