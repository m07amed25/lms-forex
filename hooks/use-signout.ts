"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useSignOut() {
  const router = useRouter();
  return async function signOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
          router.refresh();
          toast.success("Logged out successfully");
        },
        onError: () => {
          toast.error("Failed to log out");
        },
      },
    });
  };

  // return handleSignOut;
}
