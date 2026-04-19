"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { revokeSession } from "@/app/(student)/profile/_actions/revoke-session";
import { toast } from "sonner";
import {
  Loader2,
  Monitor,
  Smartphone,
  Globe,
  ShieldCheck,
  Fingerprint,
} from "lucide-react";

interface SessionInfo {
  id: string;
  token: string;
  createdAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
}

interface SessionsManagerProps {
  sessions: SessionInfo[];
  currentSessionToken: string;
}

function parseUserAgent(ua: string | null): {
  browser: string;
  os: string;
  isMobile: boolean;
} {
  if (!ua)
    return { browser: "Unknown Browser", os: "Unknown OS", isMobile: false };

  let browser = "Unknown Browser";
  let os = "Unknown OS";
  const isMobile = /mobile|android|iphone|ipad/i.test(ua);

  if (/edg/i.test(ua)) browser = "Edge";
  else if (/chrome/i.test(ua) && !/chromium/i.test(ua)) browser = "Chrome";
  else if (/firefox/i.test(ua)) browser = "Firefox";
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = "Safari";
  else if (/opera|opr/i.test(ua)) browser = "Opera";

  if (/windows/i.test(ua)) os = "Windows";
  else if (/mac os|macos/i.test(ua)) os = "macOS";
  else if (/linux/i.test(ua)) os = "Linux";
  else if (/android/i.test(ua)) os = "Android";
  else if (/iphone|ipad|ios/i.test(ua)) os = "iOS";

  return { browser, os, isMobile };
}

export default function SessionsManager({
  sessions,
  currentSessionToken,
}: SessionsManagerProps) {
  const [isPending, startTransition] = useTransition();

  function handleRevoke(sessionToken: string) {
    startTransition(async () => {
      const result = await revokeSession({ sessionId: sessionToken });
      if (result.status === "success") {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Fingerprint className="size-5 text-primary" />
          Active Sessions
        </CardTitle>
        <CardDescription>
          Manage devices where you&apos;re currently signed in. Revoke access to
          sessions you don&apos;t recognize.
        </CardDescription>
      </CardHeader>
      <Separator />
      <CardContent className="pt-6">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 py-8">
            <ShieldCheck className="mb-2 size-8 text-muted-foreground/50" />
            <p className="text-sm font-medium text-muted-foreground">
              No active sessions found.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => {
              const isCurrent = session.token === currentSessionToken;
              const { browser, os, isMobile } = parseUserAgent(
                session.userAgent,
              );
              const DeviceIcon = isMobile ? Smartphone : Monitor;
              const createdDate = new Date(
                session.createdAt,
              ).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={session.id}
                  className={`flex items-center justify-between rounded-lg border p-4 transition-colors ${
                    isCurrent
                      ? "border-primary/30 bg-primary/5"
                      : "hover:bg-muted/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex size-10 items-center justify-center rounded-lg ${
                        isCurrent ? "bg-primary/10" : "bg-muted"
                      }`}
                    >
                      <DeviceIcon
                        className={`size-5 ${
                          isCurrent ? "text-primary" : "text-muted-foreground"
                        }`}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">
                          {browser} on {os}
                        </p>
                        {isCurrent && (
                          <Badge
                            variant="secondary"
                            className="gap-1 border border-primary/20 bg-primary/10 text-xs text-primary"
                          >
                            <span className="size-1.5 animate-pulse rounded-full bg-primary" />
                            This device
                          </Badge>
                        )}
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                        <Globe className="size-3" />
                        <span>{session.ipAddress ?? "Unknown IP"}</span>
                        <span className="text-border">•</span>
                        <span>{createdDate}</span>
                      </div>
                    </div>
                  </div>

                  {!isCurrent && (
                    <AlertDialog>
                      <AlertDialogTrigger
                        render={
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isPending}
                            className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                          >
                            {isPending ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              "Revoke"
                            )}
                          </Button>
                        }
                      />
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Revoke Session?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will immediately sign out this session. The
                            device will need to log in again.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRevoke(session.token)}
                          >
                            Revoke
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

