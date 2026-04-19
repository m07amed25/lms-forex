import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getSignedVideoUrl } from "@/lib/s3-signed-url";
import { CalendarDays, Mail, Shield } from "lucide-react";

interface ProfileHeaderProps {
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    role: string | null;
    createdAt: Date;
  };
  isEditable?: boolean;
  avatarUploadDialog?: React.ReactNode;
}

export default async function ProfileHeader({
  user,
  isEditable = false,
  avatarUploadDialog,
}: ProfileHeaderProps) {
  const initials = user.name?.charAt(0).toUpperCase() || "U";

  let avatarUrl: string | undefined;
  if (user.image) {
    avatarUrl = await getSignedVideoUrl(user.image);
  }

  const memberSince = new Date(user.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Card className="relative overflow-hidden border-0 shadow-lg">
      {/* Gradient Banner */}
      <div className="h-32 bg-linear-to-br from-primary/80 via-primary/60 to-accent/40 sm:h-40" />

      <div className="relative px-6 pb-6">
        {/* Avatar - overlapping the banner */}
        <div className="relative -mt-16 mb-4 flex flex-col items-center gap-5 sm:-mt-18 sm:flex-row sm:items-end">
          <div className="relative shrink-0">
            <Avatar className="size-28 border-4 border-background shadow-xl sm:size-32">
              {avatarUrl ? (
                <AvatarImage src={avatarUrl} alt={user.name} />
              ) : null}
              <AvatarFallback className="bg-primary/10 text-3xl font-bold text-primary sm:text-4xl">
                {initials}
              </AvatarFallback>
            </Avatar>
            {isEditable && avatarUploadDialog}
          </div>

          <div className="flex flex-1 flex-col items-center gap-3 pb-1 sm:items-start">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {user.name}
              </h1>
              {user.role && (
                <Badge
                  variant="secondary"
                  className="gap-1 capitalize"
                >
                  <Shield className="size-3" />
                  {user.role}
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-muted-foreground sm:justify-start">
              <span className="inline-flex items-center gap-1.5">
                <Mail className="size-3.5" />
                {user.email}
              </span>
              <Separator orientation="vertical" className="hidden h-4 sm:block" />
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-3.5" />
                Member since {memberSince}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

