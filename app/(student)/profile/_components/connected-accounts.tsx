import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Github, Link2 } from "lucide-react";

interface ConnectedAccountsProps {
  accounts: { providerId: string; createdAt: Date }[];
}

const providerConfig: Record<
  string,
  { label: string; icon: React.ElementType; color: string }
> = {
  github: { label: "GitHub", icon: Github, color: "text-foreground" },
};

export default function ConnectedAccounts({
  accounts,
}: ConnectedAccountsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Link2 className="size-5 text-primary" />
          Connected Accounts
        </CardTitle>
        <CardDescription>
          OAuth providers linked to your account.
        </CardDescription>
      </CardHeader>
      <Separator />
      <CardContent className="pt-6">
        {accounts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 py-8">
            <Link2 className="mb-2 size-8 text-muted-foreground/50" />
            <p className="text-sm font-medium text-muted-foreground">
              No connected accounts
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Connect an OAuth provider to enable social login.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {accounts.map((account) => {
              const provider = providerConfig[account.providerId] ?? {
                label: account.providerId,
                icon: Github,
                color: "text-muted-foreground",
              };
              const Icon = provider.icon;
              const connectedDate = new Date(
                account.createdAt,
              ).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              });

              return (
                <div
                  key={account.providerId}
                  className="flex items-center justify-between rounded-lg border bg-card p-4 transition-colors hover:bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                      <Icon className={`size-5 ${provider.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{provider.label}</p>
                      <p className="text-xs text-muted-foreground">
                        Connected on {connectedDate}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className="gap-1 border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400"
                  >
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    Connected
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
