import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCoursePlayerData } from "@/app/data/get-course-player-data";
import { getSignedVideoUrl } from "@/lib/s3-signed-url";
import { LessonContent } from "@/app/(student)/courses/[slug]/_components/lesson-content";
import { VideoPlayer } from "@/app/(student)/courses/[slug]/_components/video-player";
import { MarkCompleteButton } from "@/app/(student)/courses/[slug]/_components/mark-complete-button";
import { AutoAdvance } from "@/app/(student)/courses/[slug]/_components/auto-advance";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const { slug, lessonId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login");
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: {
      id: true,
      title: true,
      content: true,
      videoFileKey: true,
      position: true,
      chapter: {
        select: {
          id: true,
          position: true,
          courseId: true,
          course: { select: { slug: true } },
        },
      },
    },
  });

  if (!lesson || lesson.chapter.course.slug !== slug) {
    notFound();
  }

  const courseId = lesson.chapter.courseId;

  const courseData = await getCoursePlayerData(courseId, session.user.id);
  if (!courseData) notFound();

  // Find current lesson's completion status
  let isCompleted = false;
  for (const ch of courseData.chapters) {
    for (const l of ch.lessons) {
      if (l.id === lessonId) {
        isCompleted = l.isCompleted;
      }
    }
  }

  // Compute next lesson URL
  let nextLessonUrl: string | null = null;
  let nextLessonTitle: string | null = null;
  let isLastLesson = true;

  const allLessons = courseData.chapters.flatMap((ch) =>
    ch.lessons.map((l) => ({ ...l, chapterId: ch.id })),
  );
  const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
  if (currentIndex >= 0 && currentIndex < allLessons.length - 1) {
    const next = allLessons[currentIndex + 1];
    nextLessonUrl = `/courses/${slug}/lessons/${next.id}`;
    nextLessonTitle = next.title;
    isLastLesson = false;
  }

  // Generate signed video URL if lesson has video
  let signedVideoUrl: string | null = null;
  if (lesson.videoFileKey) {
    try {
      signedVideoUrl = await getSignedVideoUrl(lesson.videoFileKey);
    } catch {
      signedVideoUrl = null;
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold">{lesson.title}</h1>

      {signedVideoUrl && (
        <VideoPlayer
          signedUrl={signedVideoUrl}
          lessonId={lessonId}
          courseId={courseId}
          isCompleted={isCompleted}
        />
      )}

      <LessonContent content={lesson.content} />

      <div className="flex items-center gap-4 pt-4 border-t">
        <MarkCompleteButton
          lessonId={lessonId}
          courseId={courseId}
          isCompleted={isCompleted}
          nextLessonUrl={nextLessonUrl}
          nextLessonTitle={nextLessonTitle}
          isLastLesson={isLastLesson}
        />
      </div>

      <AutoAdvance
        nextLessonUrl={nextLessonUrl}
        nextLessonTitle={nextLessonTitle}
        isLastLesson={isLastLesson}
      />
    </div>
  );
}


