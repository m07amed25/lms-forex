"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { tryCatch } from "@/hooks/try-catch";
import { updateLesson } from "@/app/admin/courses/[courseId]/_actions/lesson-actions";
import {
  updateLessonSchema,
  type UpdateLessonInput,
} from "@/lib/zodSchema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { RichTextEditor } from "@/components/rich-text-editor/editor";
import Uploader from "@/components/file-uploader/Uploader";
import { Loader2, Save, X } from "lucide-react";
import type { AdminLessonDetailType } from "@/app/data/admin/admin-get-lesson";

type LessonEditorFormProps = {
  lesson: AdminLessonDetailType;
  courseId: string;
};

const LessonEditorForm = ({ lesson, courseId }: LessonEditorFormProps) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<UpdateLessonInput>({
    resolver: zodResolver(updateLessonSchema),
    defaultValues: {
      lessonId: lesson.id,
      title: lesson.title,
      content: lesson.content,
      isFreePreview: lesson.isFreePreview,
      videoFileKey: lesson.videoFileKey,
    },
  });

  function onSubmit(values: UpdateLessonInput) {
    startTransition(async () => {
      const { data: result, error } = await tryCatch(updateLesson(values));

      if (error) {
        toast.error(error.message);
        return;
      }

      if (result?.status === "success") {
        toast.success(result.message);
        router.refresh();
      } else if (result?.status === "error") {
        toast.error(result.message);
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Title */}
        <Card>
          <CardHeader>
            <CardTitle>Lesson Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
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

            <FormField
              control={form.control}
              name="isFreePreview"
              render={({ field }) => (
                <FormItem className="flex items-start gap-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isPending}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Free Preview</FormLabel>
                    <FormDescription>
                      Allow non-enrolled users to preview this lesson for free.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Content Editor */}
        <Card>
          <CardHeader>
            <CardTitle>Lesson Content</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RichTextEditor
                      content={field.value}
                      placeholder="Write your lesson content here..."
                      onChange={(value) => field.onChange(value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Video Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Video</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="videoFileKey"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Uploader
                      value={field.value ?? undefined}
                      onChange={(key) => field.onChange(key || null)}
                      accept={{
                        "video/mp4": [".mp4"],
                        "video/webm": [".webm"],
                        "video/quicktime": [".mov"],
                      }}
                      maxSize={500 * 1024 * 1024}
                    />
                  </FormControl>
                  <FormDescription>
                    Supported formats: MP4, WebM, MOV. Maximum file size: 500 MB.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.watch("videoFileKey") && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => form.setValue("videoFileKey", null, { shouldDirty: true })}
                disabled={isPending}
                className="text-destructive hover:text-destructive"
              >
                <X className="h-4 w-4" />
                Remove Video
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(`/admin/courses/${courseId}`)}
            disabled={isPending}
          >
            Back to Course
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Lesson
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default LessonEditorForm;




