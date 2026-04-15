"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { tryCatch } from "@/hooks/try-catch";
import { createChapter } from "../_actions/chapter-actions";
import {
  createChapterSchema,
  type CreateChapterInput,
} from "@/lib/zodSchema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, Plus } from "lucide-react";

type CreateChapterDialogProps = {
  courseId: string;
};

const CreateChapterDialog = ({ courseId }: CreateChapterDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<CreateChapterInput>({
    resolver: zodResolver(createChapterSchema),
    defaultValues: {
      title: "",
      courseId,
    },
  });

  function onSubmit(values: CreateChapterInput) {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(createChapter(values));

      if (error) {
        toast.error(error.message);
        return;
      }

      if (result?.status === "success") {
        toast.success(result.message);
        form.reset();
        setOpen(false);
      } else if (result?.status === "error") {
        toast.error(result.message);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button size="sm">
          <Plus className="h-4 w-4" />
          Add Chapter
        </Button>
      } />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Chapter</DialogTitle>
          <DialogDescription>
            Add a new chapter to this course. Chapters organize your course
            content into logical sections.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chapter Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Introduction to Forex"
                      disabled={isPending}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose render={
                <Button type="button" variant="outline" disabled={isPending}>
                  Cancel
                </Button>
              } />
              <Button type="submit" disabled={isPending}>
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Chapter"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateChapterDialog;

