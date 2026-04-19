import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getUserProfile } from "@/app/data/get-user-profile";
import { getUserLearningStats } from "@/app/data/get-user-learning-stats";
import { getUserEnrolledCourses } from "@/app/data/get-user-enrolled-courses";
import { getUserAccounts } from "@/app/data/get-user-accounts";
import ProfileHeader from "./_components/profile-header";
import ProfileTabs from "./_components/profile-tabs";
import ProfileEditForm from "./_components/profile-edit-form";
import AvatarUploadDialog from "./_components/avatar-upload-dialog";
import LearningStatsCards from "./_components/learning-stats-cards";
import EnrolledCoursesGrid from "./_components/enrolled-courses-grid";
import ConnectedAccounts from "./_components/connected-accounts";
import SessionsManager from "./_components/sessions-manager";

export default async function ProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect("/login");
  }

  const [profile, stats, enrolledCourses, accounts] = await Promise.all([
    getUserProfile(session.user.id),
    getUserLearningStats(session.user.id),
    getUserEnrolledCourses(session.user.id),
    getUserAccounts(session.user.id),
  ]);

  if (!profile) {
    redirect("/login");
  }

  // Fetch sessions via Better Auth API
  const sessionsResult = await auth.api.listSessions({
    headers: await headers(),
  });

  const sessions = (sessionsResult ?? []).map((s: any) => ({
    id: s.id,
    token: s.token,
    createdAt: s.createdAt,
    ipAddress: s.ipAddress ?? null,
    userAgent: s.userAgent ?? null,
  }));

  return (
    <div className="container space-y-8 px-4 py-8">
      <ProfileHeader
        user={profile}
        isEditable
        avatarUploadDialog={
          <AvatarUploadDialog
            currentImage={profile.image}
            userName={profile.name}
          />
        }
      />

      <LearningStatsCards stats={stats} />

      <ProfileTabs
        profileContent={
          <div className="grid gap-6 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <ProfileEditForm user={profile} />
            </div>
            <div className="lg:col-span-2">
              <ConnectedAccounts accounts={accounts} />
            </div>
          </div>
        }
        coursesContent={
          <EnrolledCoursesGrid courses={enrolledCourses} showCTA />
        }
        sessionsContent={
          <SessionsManager
            sessions={sessions}
            currentSessionToken={session.session.token}
          />
        }
      />
    </div>
  );
}

