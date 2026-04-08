import { buttonVariants } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center">
      <Link
        href={"/"}
        className={buttonVariants({
          variant: "outline",
          className: "absolute top-4 left-4",
        })}
      >
        <ArrowLeft className="size-4" /> Back
      </Link>
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          className="group flex items-center gap-2.5 self-center hover:opacity-90 transition-opacity"
          href={"/"}
        >
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 shadow-sm ring-1 ring-primary/20 transition-all group-hover:bg-primary/20 group-hover:ring-primary/30">
            <Image
              src={"/logo.png"}
              alt="logo"
              width={32}
              height={32}
              className="object-contain drop-shadow-sm"
            />
          </div>
          <span className="text-2xl font-bold tracking-tight text-foreground/90">
            Forex<span className="text-foreground">With</span>
            <span className="mx-[2px] text-primary">.</span>
            <span className="bg-linear-to-tr from-primary to-primary/60 bg-clip-text font-extrabold text-transparent">
              Salma
            </span>
          </span>
        </Link>
        {children}
        <div className="mt-6 flex flex-col items-center justify-center gap-5 text-center text-muted-foreground">
          <p className="px-8 text-balance text-[13px] leading-relaxed">
            By continuing, you agree to our{" "}
            <Link
              href="/terms"
              className="font-medium text-foreground/80 underline decoration-primary/30 underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="font-medium text-foreground/80 underline decoration-primary/30 underline-offset-4 transition-colors hover:text-primary hover:decoration-primary"
            >
              Privacy Policy
            </Link>
            .
          </p>
          <p className="text-xs opacity-60">
            © {new Date().getFullYear()} ForexWith.Salma. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
