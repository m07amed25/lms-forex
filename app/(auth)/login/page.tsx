import { auth } from "@/lib/auth";
import { env } from "@/lib/env";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import LoginForm from "./_components/LoginForm";

import { Suspense } from "react";
import { Loader } from "lucide-react";

const LogIn = async () => {
  const hasGithubProvider = Boolean(env.GITHUB_ID && env.GITHUB_SECRET);
  const hasEmailProvider = Boolean(
    env.SMTP_HOST &&
      env.SMTP_PORT &&
      env.SMTP_USER &&
      env.SMTP_PASS &&
      env.SMTP_FROM,
  );

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/");
  }

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-12">
          <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <LoginForm
        allowGithub={hasGithubProvider}
        allowEmailOtp={hasEmailProvider}
      />
    </Suspense>
  );
};

export default LogIn;
