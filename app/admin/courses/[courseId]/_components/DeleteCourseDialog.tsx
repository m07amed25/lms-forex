"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { tryCatch } from "@/hooks/try-catch";
import { deleteCourse } from "../actions";
import { Button } from "@/components/ui/button";
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
import { Loader2, Trash2 } from "lucide-react";
type DeleteCourseDialogProps = {
  courseId: string;
  courseTitle: string;
};
const DeleteCourseDialog = ({
  courseId,
  courseTitle,
}: DeleteCourseDialogProps) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  function handleDelete() {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(deleteCourse(courseId));
      if (error) {
        toast.error(error.message);
        return;
      }
      if (result?.status === "success") {
        toast.success(result.message);
        router.push("/admin/courses");
      } else if (result?.status === "error") {
        toast.error(result.message);
      }
    });
  }
  return (
    <AlertDialog>
      <AlertDialogTrigger render={
        <Button variant="destructive" className="flex-1 sm:flex-initial">
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      } />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Course</AlertDialogTitle>
          <AlertDialogDescription>
            This action is permanent and cannot be undone. This will delete the
            course &quot;{courseTitle}&quot; and its thumbnail image from
            storage.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Course"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
export default DeleteCourseDialog;
