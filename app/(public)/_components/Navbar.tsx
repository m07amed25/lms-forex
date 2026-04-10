"use client";

import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { authClient } from "@/lib/auth-client";
import Image from "next/image";
import Link from "next/link";
import { UserMenu } from "./UserDropDown";

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
      </div>
    </header>
  );
};

export default Navbar;
