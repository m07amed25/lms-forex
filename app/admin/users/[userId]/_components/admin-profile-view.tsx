import ProfileHeader from "@/app/(student)/profile/_components/profile-header";
import LearningStatsCards from "@/app/(student)/profile/_components/learning-stats-cards";
import EnrolledCoursesGrid from "@/app/(student)/profile/_components/enrolled-courses-grid";
import type { CourseLevel } from "@prisma/client";

interface AdminProfileViewProps {
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    role: string | null;
    createdAt: Date;
  };
  stats: {
    totalEnrolled: number;
    completedCourses: number;
    inProgressCourses: number;
    totalLessonsCompleted: number;
    memberSince: Date;
  };
  enrolledCourses: {
    courseId: string;
    title: string;
    slug: string;
    fileKey: string;
    level: CourseLevel;
    category: string;
    enrolledAt: Date;
    progress: { completed: number; total: number; percentage: number };
    firstLessonId: string | null;
  }[];
}

export default function AdminProfileView({
  user,
  stats,
  enrolledCourses,
}: AdminProfileViewProps) {
  return (
    <div className="space-y-8">
      <ProfileHeader user={user} isEditable={false} />
      <LearningStatsCards stats={stats} />
      <EnrolledCoursesGrid courses={enrolledCourses} showCTA={false} />
    </div>
  );
}

