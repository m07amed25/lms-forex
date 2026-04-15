"use server";

import publicGetLessonPreview from "@/app/data/public-get-lesson-preview";

export async function getPreviewAction(lessonId: string) {
  return publicGetLessonPreview(lessonId);
}

