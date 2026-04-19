"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Camera, Trash2, Loader2, ImagePlus } from "lucide-react";
import Uploader from "@/components/file-uploader/Uploader";
import { updateAvatar } from "@/app/(student)/profile/_actions/update-avatar";
import { removeAvatar } from "@/app/(student)/profile/_actions/remove-avatar";
import { toast } from "sonner";

interface AvatarUploadDialogProps {
  currentImage: string | null;
  userName: string;
}

export default function AvatarUploadDialog({
  currentImage,
  userName,
}: AvatarUploadDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleUploadComplete(fileKey: string) {
    if (!fileKey) return;
    startTransition(async () => {
      const result = await updateAvatar({ imageFileKey: fileKey });
      if (result.status === "success") {
        toast.success(result.message);
        setOpen(false);
      } else {
        toast.error(result.message);
      }
    });
  }

  function handleRemoveAvatar() {
    startTransition(async () => {
      const result = await removeAvatar();
      if (result.status === "success") {
        toast.success(result.message);
        setOpen(false);
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            className="absolute -bottom-1 -right-1 size-8 rounded-full"
          >
            <Camera className="size-4" />
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Update Avatar</DialogTitle>
        </DialogHeader>

        <Separator />

        <div className="space-y-4 pt-2">
          <Uploader
            onChange={handleUploadComplete}
            accept={{
              "image/*": [".png", ".jpg", ".jpeg", ".webp"],
            }}
            maxSize={2 * 1024 * 1024}
          />

          {currentImage && (
            <>
              <Separator />
              <AlertDialog>
                <AlertDialogTrigger
                  render={
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      disabled={isPending}
                    >
                      {isPending ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                      Remove Current Avatar
                    </Button>
                  }
                />
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove Avatar?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Your avatar will be removed and replaced with your
                      initials.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleRemoveAvatar}>
                      Remove
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
