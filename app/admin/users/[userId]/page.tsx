import { notFound } from "next/navigation";
import { requireAdmin } from "@/app/data/admin/require-admin";
import { getUserProfile } from "@/app/data/get-user-profile";
import { getUserLearningStats } from "@/app/data/get-user-learning-stats";
import { getUserEnrolledCourses } from "@/app/data/get-user-enrolled-courses";
import AdminProfileView from "./_components/admin-profile-view";

interface AdminUserProfilePageProps {
  params: Promise<{ userId: string }>;
}

export default async function AdminUserProfilePage({
  params,
}: AdminUserProfilePageProps) {
  await requireAdmin();

  const { userId } = await params;

  const [profile, stats, enrolledCourses] = await Promise.all([
    getUserProfile(userId),
    getUserLearningStats(userId),
    getUserEnrolledCourses(userId),
  ]);

  if (!profile) {
    notFound();
  }

  return (
    <div className="container max-w-5xl space-y-8 px-4 py-8">
      <h1 className="text-lg font-semibold text-muted-foreground">
        Admin View — User Profile
      </h1>
      <AdminProfileView
        user={profile}
        stats={stats}
        enrolledCourses={enrolledCourses}
      />
    </div>
  );
}


