"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { ArrowLeft, CheckCircle, Loader } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useTransition } from "react";
import { toast } from "sonner";

function VerifyRequestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState("");
  const [pending, startTransition] = useTransition();
  const [resendPending, startResendTransition] = useTransition();

  function verifyOtp(otpValue: string) {
    if (!email) {
      toast.error("Email is required. Please go back and try again.");
      return;
    }
    if (otpValue.length !== 6) {
      return;
    }

    startTransition(async () => {
      const { error } = await authClient.signIn.emailOtp({
        email,
        otp: otpValue,
      });

      if (error) {
        toast.error(error.message || "Invalid OTP. Please try again.");
      } else {
        toast.success("Email verified successfully!", {
          description: "Login successful! You are now being redirected.",
        });
        router.push("/");
      }
    });
  }

  function onVerify(e: React.FormEvent) {
    e.preventDefault();
    verifyOtp(otp);
  }

  function handleResend() {
    if (!email) return;

    startResendTransition(async () => {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email: email,
        type: "sign-in",
      });

      if (error) {
        toast.error(error.message || "Failed to resend code");
      } else {
        toast.success("Verification code resent successfully!");
      }
    });
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Check your inbox</CardTitle>
        <CardDescription>
          We&apos;ve sent a 6-digit verification code to <br />
          <span className="font-medium text-foreground">
            {email || "your email"}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onVerify} className="grid gap-6">
          <div className="flex flex-col items-center gap-4">
            <Label htmlFor="otp" className="sr-only">
              One-time Password
            </Label>
            <InputOTP
              id="otp"
              maxLength={6}
              value={otp}
              onChange={(value) => setOtp(value)}
              onComplete={verifyOtp}
              disabled={pending}
              autoFocus
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={pending || otp.length !== 6 || !email}
          >
            {pending ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Verify Code
              </>
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            Didn&apos;t receive the code?{" "}
            <Button
              variant="link"
              className="px-0 font-medium"
              disabled={resendPending || pending || !email}
              onClick={(e) => {
                e.preventDefault();
                handleResend();
              }}
            >
              {resendPending ? "Resending..." : "Resend"}
            </Button>
          </p>
        </form>
      </CardContent>
      <CardFooter className="justify-center border-t p-4">
        <Link
          href="/login"
          className={buttonVariants({
            variant: "ghost",
            className: "text-muted-foreground",
          })}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to login
        </Link>
      </CardFooter>
    </Card>
  );
}

const VerifyRequestPage = () => {
  return (
    <Suspense
      fallback={
        <Card className="flex items-center justify-center p-12">
          <Loader className="h-6 w-6 animate-spin text-muted-foreground" />
        </Card>
      }
    >
      <VerifyRequestContent />
    </Suspense>
  );
};

export default VerifyRequestPage;
