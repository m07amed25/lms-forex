import { ShieldAlert, ArrowLeft, Home } from "lucide-react";
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

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md shadow-lg border-2">
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="mx-auto bg-destructive/10 w-16 h-16 rounded-full flex items-center justify-center border-2 border-destructive/20 shadow-inner">
            <ShieldAlert className="h-8 w-8 text-destructive" />
          </div>
          <div className="space-y-1">
            <CardTitle className="text-3xl font-bold tracking-tight">
              Access Denied
            </CardTitle>
            <CardDescription className="text-base">
              You don&apos;t have permission to view this page.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-4">
          <p className="text-sm text-muted-foreground text-center">
            This area is restricted to administrators only. If you believe this
            is an error, please try logging in again or visit the home page.
          </p>

          <Separator />

          <div className="flex flex-col gap-3">
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "default" }),
                "h-11 w-full text-white font-semibold",
              )}
            >
              Go to Login
            </Link>
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-11 w-full gap-2",
              )}
            >
              <Home className="h-4 w-4" />
              Return Home
            </Link>
          </div>

          <div className="pt-2 text-center">
            <Link
              href="javascript:history.back()"
              className="text-sm font-medium text-muted-foreground hover:text-primary flex items-center justify-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Go back to previous page
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
