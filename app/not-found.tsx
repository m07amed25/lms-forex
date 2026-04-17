"use client";

import { FileQuestion, Home, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md border-2">
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center border-2 border-primary/20">
            <FileQuestion className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-bold tracking-tight">
              404
            </CardTitle>
            <CardDescription className="text-base">
              Page Not Found
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-4">
          <p className="text-sm text-muted-foreground text-center">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved. Please check the URL or navigate back to the home page.
          </p>

          <Separator />

          <div className="flex flex-col gap-3">
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: "default" }),
                "h-11 w-full font-semibold gap-2",
              )}
            >
              <Home className="h-4 w-4" />
              Return Home
            </Link>
            <Link
              href="/courses"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-11 w-full gap-2",
              )}
            >
              Browse Courses
            </Link>
          </div>

          <div className="pt-2 text-center">
            <button
              onClick={() => history.back()}
              className="text-sm font-medium text-muted-foreground hover:text-primary flex items-center justify-center gap-1.5 transition-colors mx-auto cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Go back to previous page
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
