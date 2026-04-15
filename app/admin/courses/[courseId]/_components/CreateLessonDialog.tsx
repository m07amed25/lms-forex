"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { tryCatch } from "@/hooks/try-catch";
import { createLesson } from "../_actions/lesson-actions";
import {
  createLessonSchema,
  type CreateLessonFormInput,
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

type CreateLessonDialogProps = {
  chapterId: string;
  courseId: string;
};

const CreateLessonDialog = ({ chapterId }: CreateLessonDialogProps) => {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const defaultContent = JSON.stringify({
    type: "doc",
    content: [
      { type: "paragraph", content: [{ type: "text", text: "Lesson content goes here..." }] },
    ],
  });

  const form = useForm<CreateLessonFormInput>({
    resolver: zodResolver(createLessonSchema),
    defaultValues: {
      title: "",
      content: defaultContent,
      chapterId,
      isFreePreview: false,
    },
  });

  function onSubmit(values: CreateLessonFormInput) {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(createLesson({
        ...values,
        isFreePreview: values.isFreePreview ?? false,
      }));

      if (error) {
        toast.error(error.message);
        return;
      }

      if (result?.status === "success") {
        toast.success(result.message);
        form.reset({ title: "", content: defaultContent, chapterId, isFreePreview: false });
        setOpen(false);
      } else if (result?.status === "error") {
        toast.error(result.message);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button variant="outline" size="sm" className="w-full">
          <Plus className="h-3.5 w-3.5" />
          Add Lesson
        </Button>
      } />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Lesson</DialogTitle>
          <DialogDescription>
            Add a new lesson to this chapter. You can edit the content and add
            videos after creation.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lesson Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Understanding Currency Pairs"
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
                  "Create Lesson"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateLessonDialog;





