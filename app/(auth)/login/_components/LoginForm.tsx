"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { Loader, Send } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { LuGithub } from "react-icons/lu";
import { toast } from "sonner";

const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [githubPending, startGithubTranstion] = useTransition();
  const [emailPending, startEmailTranstion] = useTransition();
  const [email, setEmail] = useState("");

  useEffect(() => {
    const verified = searchParams.get("verified");
    if (verified === "true") {
      toast.success("Email verified successfully!", {
        description: "You can now sign in to your account.",
      });
    }
  }, [searchParams]);

  async function SignInWithGithub() {
    startGithubTranstion(async () => {
      await authClient.signIn.social({
        provider: "github",
        callbackURL: "/",
        fetchOptions: {
          onSuccess: () => {
            toast.success("Signed in with Github, you will be redirected...");
          },
          onError: () => {
            toast.error("Failed to sign in with Github");
          },
        },
      });
    });
  }

  async function SignInWithEmail(e?: React.FormEvent) {
    if (e) e.preventDefault();

    startEmailTranstion(async () => {
      await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "sign-in",
        fetchOptions: {
          onSuccess: () => {
            toast.success("Email sent successfully");
            router.push(`/verify-request?email=${encodeURIComponent(email)}`);
          },
          onError: () => {
            toast.error("Failed to send email");
          },
        },
      });
    });
  }

  return (
    <Card className="overflow-hidden border-border/40 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] ring-1 ring-black/5 dark:ring-white/5 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-border/80">
      <CardHeader className="space-y-1.5 text-center px-8 pt-8">
        <CardTitle className="bg-linear-to-br from-foreground to-foreground/70 bg-clip-text text-2xl font-bold tracking-tight text-transparent">
          Welcome back
        </CardTitle>
        <CardDescription>
          Sign in to your account with Github or Email
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <Button
          type="button"
          className="w-full active:scale-[0.98] transition-all duration-200 group relative"
          variant={"outline"}
          disabled={githubPending || emailPending}
          onClick={SignInWithGithub}
        >
          {githubPending ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Signing in with Github...
            </>
          ) : (
            <>
              <LuGithub className="mr-2 h-4 w-4" />
              Sign in with Github
            </>
          )}
        </Button>

        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
          <span className="relative z-10 bg-card px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>

        <form onSubmit={SignInWithEmail} className="grid gap-4">
          <div className="grid gap-2 text-left">
            <Label htmlFor="email" className="text-sm font-medium">
              Email address
            </Label>
            <Input
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="m@example.com"
              required
              disabled={emailPending || githubPending}
              className="transition-all duration-200 focus-visible:ring-primary/20 focus-visible:border-primary bg-background/50 hover:bg-background"
            />
          </div>
          <Button
            type="submit"
            disabled={emailPending || githubPending}
            className="mt-1 active:scale-[0.98] transition-all duration-200 shadow-sm hover:shadow"
          >
            {emailPending ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Sending Email...
              </>
            ) : (
              <>
                <Send className="size-4" />
                <span>Continue with Email</span>
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
