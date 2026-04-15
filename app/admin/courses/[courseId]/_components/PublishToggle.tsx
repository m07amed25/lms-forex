"use client";
import { useTransition } from "react";
import { toast } from "sonner";
import { tryCatch } from "@/hooks/try-catch";
import { togglePublish } from "../actions";
import { Button } from "@/components/ui/button";
import { Loader2, Globe, GlobeLock } from "lucide-react";
type PublishToggleProps = {
  courseId: string;
  status: string;
};
const PublishToggle = ({
  courseId,
  status,
}: PublishToggleProps) => {
  const [isPending, startTransition] = useTransition();
  function handleToggle() {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(
        togglePublish(courseId),
      );
      if (error) {
        toast.error(error.message);
        return;
      }
      if (result?.status === "success") {
        toast.success(result.message);
      } else if (result?.status === "error") {
        toast.error(result.message);
      }
    });
  }
  const isCurrentlyPublished = status === "Published";
  return (
    <Button
      onClick={handleToggle}
      disabled={isPending}
      variant={isCurrentlyPublished ? "outline" : "default"}
      className={`flex-1 sm:flex-initial ${!isCurrentlyPublished ? "text-white" : ""}`}
    >
      {isPending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          {isCurrentlyPublished ? "Unpublishing..." : "Publishing..."}
        </>
      ) : isCurrentlyPublished ? (
        <>
          <GlobeLock className="h-4 w-4" />
          Unpublish
        </>
      ) : (
        <>
          <Globe className="h-4 w-4" />
          Publish
        </>
      )}
    </Button>
  );
};
export default PublishToggle;
