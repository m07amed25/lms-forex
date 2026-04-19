"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  updateProfileSchema,
  type UpdateProfileInput,
} from "@/lib/zodSchema";
import { updateProfile } from "@/app/(student)/profile/_actions/update-profile";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, User, Mail, FileText, Save } from "lucide-react";

interface ProfileEditFormProps {
  user: {
    name: string;
    email: string;
    bio: string | null;
  };
}

export default function ProfileEditForm({ user }: ProfileEditFormProps) {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user.name,
      bio: user.bio ?? "",
    },
  });

  const bioValue = watch("bio") ?? "";

  function onSubmit(data: UpdateProfileInput) {
    startTransition(async () => {
      const result = await updateProfile(data);
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
          <User className="size-5 text-primary" />
          Personal Information
        </CardTitle>
        <CardDescription>
          Update your profile details. Your email cannot be changed.
        </CardDescription>
      </CardHeader>
      <Separator />
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email - Read Only */}
          <div className="space-y-2">
            <Label
              htmlFor="email"
              className="flex items-center gap-1.5 text-muted-foreground"
            >
              <Mail className="size-3.5" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={user.email}
              disabled
              className="bg-muted/40 text-muted-foreground"
            />
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-1.5">
              <User className="size-3.5" />
              Display Name
            </Label>
            <Input
              id="name"
              placeholder="Your display name"
              {...register("name")}
              aria-invalid={!!errors.name}
              className="transition-shadow focus:shadow-sm"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio" className="flex items-center gap-1.5">
              <FileText className="size-3.5" />
              Bio
            </Label>
            <Textarea
              id="bio"
              placeholder="Tell us a bit about yourself..."
              rows={4}
              {...register("bio")}
              aria-invalid={!!errors.bio}
              className="resize-none transition-shadow focus:shadow-sm"
            />
            <div className="flex items-center justify-between">
              {errors.bio ? (
                <p className="text-sm text-destructive">
                  {errors.bio.message}
                </p>
              ) : (
                <span />
              )}
              <span
                className={`text-xs tabular-nums ${
                  bioValue.length > 450
                    ? "text-amber-500"
                    : "text-muted-foreground"
                } ${bioValue.length >= 500 ? "!text-destructive font-medium" : ""}`}
              >
                {bioValue.length}/500
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end pt-2">
            <Button
              type="submit"
              disabled={isPending || !isDirty}
              className="gap-2"
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              Save Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
