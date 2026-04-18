"use client";

import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { UserMenu } from "./UserDropDown";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

type NavItem = {
  name: string;
  href: string;
  match?: "exact" | "prefix";
  requiresAuth?: boolean;
  requiresAdmin?: boolean;
};

const navItems: NavItem[] = [
  {
    name: "Home",
    href: "/",
    match: "exact",
  },
  {
    name: "Courses",
    href: "/courses",
    match: "prefix",
  },
  {
    name: "My Courses",
    href: "/my-courses",
    match: "prefix",
    requiresAuth: true,
  },
  {
    name: "Admin",
    href: "/admin",
    match: "prefix",
    requiresAuth: true,
    requiresAdmin: true,
  },
];

function Brand({
  compact = false,
  onClick,
}: {
  compact?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      className="group flex items-center gap-2.5 transition-all hover:opacity-90"
      href="/"
      onClick={onClick}
    >
      <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 shadow-sm ring-1 ring-primary/20 transition-all group-hover:scale-105 group-hover:bg-primary/20 group-hover:ring-primary/30">
        <Image
          src="/logo.png"
          alt="logo"
          width={24}
          height={24}
          className="object-contain drop-shadow-sm"
          priority
        />
      </div>
      <span
        className={cn(
          "font-bold tracking-tight text-foreground/90",
          compact ? "text-lg" : "text-xl"
        )}
      >
        Forex<span className="text-foreground">With</span>
        <span className="mx-0.5 text-primary">.</span>
        <span className="bg-linear-to-tr from-primary to-primary/60 bg-clip-text font-extrabold text-transparent">
          Salma
        </span>
      </span>
    </Link>
  );
}

function DesktopNavLink({
  item,
  active,
}: {
  item: NavItem;
  active: boolean;
}) {
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative px-1 py-1 text-sm font-medium transition-colors hover:text-primary",
        active ? "text-primary" : "text-foreground/80"
      )}
    >
      {item.name}
      <span
        className={cn(
          "absolute -bottom-0.5 left-0 h-0.5 w-full origin-left rounded-full bg-primary transition-transform duration-200",
          active ? "scale-x-100" : "scale-x-0"
        )}
      />
    </Link>
  );
}

function MobileNavLink({
  item,
  active,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      onClick={onClick}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium transition-all active:scale-[0.98]",
        active
          ? "bg-primary/10 text-primary"
          : "hover:bg-primary/5 hover:text-primary"
      )}
    >
      <span className="flex-1">{item.name}</span>
      <div
        className={cn(
          "size-1.5 rounded-full bg-primary transition-opacity",
          active ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )}
      />
    </Link>
  );
}

const Navbar = () => {
  const { data: session } = authClient.useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = (session?.user as { role?: string })?.role === "admin";

  const visibleNavItems = useMemo(
    () =>
      navItems.filter(
        (item) =>
          (!item.requiresAuth || Boolean(session)) &&
          (!item.requiresAdmin || isAdmin)
      ),
    [session, isAdmin]
  );

  const isActiveLink = (item: NavItem) => {
    if (!pathname) return false;
    if (item.match === "exact") return pathname === item.href;

    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex min-h-16 gap-10 items-center px-4 md:px-6 lg:px-8">
        <Brand />

        {/* Desktop */}
        <nav className="hidden md:flex md:flex-1 md:items-center md:justify-between">
          <div className="flex items-center space-x-6">
            {visibleNavItems.map((item) => (
              <DesktopNavLink
                key={item.name}
                item={item}
                active={isActiveLink(item)}
              />
            ))}
          </div>

          <div className="flex items-center justify-center space-x-4">
            <ThemeToggle />

            {session ? (
              <UserMenu user={session.user} />
            ) : (
              <>
                <Link
                  href={"/login"}
                  className={buttonVariants({
                    variant: "secondary",
                  })}
                >
                  Log in
                </Link>
                <Link
                  href={"/login"}
                  className={buttonVariants({
                    variant: "default",
                  })}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </nav>

        <div className="flex flex-1 items-center justify-end gap-3 md:hidden">
          <ThemeToggle />
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger
              render={
                <Button variant="outline" size="icon" className="shrink-0">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              }
            />
            <SheetContent
              side="right"
              className="flex w-80 flex-col justify-between p-0"
            >
              <div className="flex flex-col gap-0">
                <SheetHeader className="p-6 border-b bg-muted/30">
                  <SheetTitle>
                    <Brand compact onClick={() => setMobileMenuOpen(false)} />
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col p-6 space-y-1">
                  {visibleNavItems.map((item) => (
                    <MobileNavLink
                      key={item.name}
                      item={item}
                      active={isActiveLink(item)}
                      onClick={() => setMobileMenuOpen(false)}
                    />
                  ))}
                </nav>
              </div>

              <div className="p-6 border-t bg-muted/10 mt-auto">
                {session ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4 rounded-xl border bg-card p-3 shadow-sm">
                      <UserMenu user={session.user} />
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-semibold truncate">
                          {session.user.name || "User"}
                        </span>
                        <span className="text-xs text-muted-foreground truncate">
                          {session.user.email || "No email"}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link
                      href={"/login"}
                      onClick={() => setMobileMenuOpen(false)}
                      className={buttonVariants({
                        variant: "outline",
                        className:
                          "w-full justify-center text-base py-6 rounded-xl",
                      })}
                    >
                      Log in
                    </Link>
                    <Link
                      href={"/login"}
                      onClick={() => setMobileMenuOpen(false)}
                      className={buttonVariants({
                        variant: "default",
                        className:
                          "w-full justify-center text-base py-6 rounded-xl shadow-lg shadow-primary/20",
                      })}
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
