"use server";

import publicGetLessonPreview from "@/app/data/public-get-lesson-preview";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function getPreviewAction(lessonId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  return publicGetLessonPreview(lessonId, session?.user?.id ?? null);
}

