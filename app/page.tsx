"use client";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function Home() {
  const { data: session } = authClient.useSession();
  const router = useRouter();

  async function SignOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
          toast.success("Signed out Successfully");
        },
      },
    });
  }

  return (
    <div className="p-24">
      <h1 className="text-2xl font-bold text-red-500">Hello</h1>
      <ThemeToggle />
      {session ? (
        <div>
          <p>{session.user?.name}</p>
          <Button onClick={SignOut}>Logout</Button>
        </div>
      ) : (
        <Button onClick={() => router.push("/login")}>Log in</Button>
      )}
    </div>
  );
}
