"use client";

import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { authClient } from "@/lib/auth-client";
import Image from "next/image";
import Link from "next/link";
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

const navItems = [
  {
    name: "Home",
    href: "/",
  },
  {
    name: "Courses",
    href: "/courses",
  },
  {
    name: "Dashboard",
    href: "/dashboard",
  },
];

const Navbar = () => {
  const { data: session } = authClient.useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex min-h-16 gap-10 items-center px-4 md:px-6 lg:px-8">
        <Link
          className="group flex items-center gap-2.5 transition-all hover:opacity-90"
          href="/"
        >
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 shadow-sm ring-1 ring-primary/20 transition-all group-hover:bg-primary/20 group-hover:ring-primary/30 group-hover:scale-105">
            <Image
              src="/logo.png"
              alt="logo"
              width={24}
              height={24}
              className="object-contain drop-shadow-sm"
              priority
            />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground/90">
            Forex<span className="text-foreground">With</span>
            <span className="mx-[2px] text-primary">.</span>
            <span className="bg-linear-to-tr from-primary to-primary/60 bg-clip-text font-extrabold text-transparent">
              Salma
            </span>
          </span>
        </Link>

        {/* Desktop */}
        <nav className="hidden md:flex md:flex-1 md:items-center md:justify-between">
          <div className="flex items-center space-x-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium transition-colors hover:text-primary"
              >
                {item.name}
              </Link>
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

        <div className="flex md:hidden flex-1 items-center justify-end gap-3">
          <ThemeToggle />
          <Sheet>
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
                    <Link className="flex items-center gap-2.5" href="/">
                      <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 shadow-sm ring-1 ring-primary/20">
                        <Image
                          src="/logo.png"
                          alt="logo"
                          width={24}
                          height={24}
                          className="object-contain"
                        />
                      </div>
                      <span className="text-xl font-bold tracking-tight text-foreground/90">
                        Forex<span className="text-foreground">With</span>
                        <span className="mx-[2px] text-primary">.</span>
                        <span className="bg-linear-to-tr from-primary to-primary/60 bg-clip-text font-extrabold text-transparent">
                          Salma
                        </span>
                      </span>
                    </Link>
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col p-6 space-y-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="group flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium transition-all hover:bg-primary/5 hover:text-primary active:scale-[0.98]"
                    >
                      <span className="flex-1">{item.name}</span>
                      <div className="size-1.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
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
                          {session.user.name}
                        </span>
                        <span className="text-xs text-muted-foreground truncate">
                          {session.user.email}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link
                      href={"/login"}
                      className={buttonVariants({
                        variant: "outline",
                        className: "w-full justify-center text-base py-6 rounded-xl",
                      })}
                    >
                      Log in
                    </Link>
                    <Link
                      href={"/login"}
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
