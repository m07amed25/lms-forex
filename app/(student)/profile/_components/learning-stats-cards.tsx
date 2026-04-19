import { Card, CardContent } from "@/components/ui/card";
import {
  BookOpen,
  GraduationCap,
  PlayCircle,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";

interface LearningStatsCardsProps {
  stats: {
    totalEnrolled: number;
    completedCourses: number;
    inProgressCourses: number;
    totalLessonsCompleted: number;
    memberSince: Date;
  };
}

const statConfig = [
  {
    key: "totalEnrolled" as const,
    label: "Enrolled Courses",
    icon: BookOpen,
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-100 dark:bg-blue-500/15",
    borderColor: "border-blue-200 dark:border-blue-500/20",
  },
  {
    key: "completedCourses" as const,
    label: "Completed",
    icon: GraduationCap,
    color: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-emerald-100 dark:bg-emerald-500/15",
    borderColor: "border-emerald-200 dark:border-emerald-500/20",
  },
  {
    key: "inProgressCourses" as const,
    label: "In Progress",
    icon: PlayCircle,
    color: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-amber-100 dark:bg-amber-500/15",
    borderColor: "border-amber-200 dark:border-amber-500/20",
  },
  {
    key: "totalLessonsCompleted" as const,
    label: "Lessons Done",
    icon: CheckCircle2,
    color: "text-violet-600 dark:text-violet-400",
    bgColor: "bg-violet-100 dark:bg-violet-500/15",
    borderColor: "border-violet-200 dark:border-violet-500/20",
  },
];

export default function LearningStatsCards({ stats }: LearningStatsCardsProps) {
  const allZero =
    stats.totalEnrolled === 0 &&
    stats.completedCourses === 0 &&
    stats.inProgressCourses === 0 &&
    stats.totalLessonsCompleted === 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <TrendingUp className="size-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Learning Overview
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statConfig.map(
          ({ key, label, icon: Icon, color, bgColor, borderColor }) => (
            <Card
              key={key}
              className={`border ${borderColor} transition-shadow hover:shadow-md`}
            >
              <CardContent className="flex items-center gap-4 p-4">
                <div className={`rounded-xl p-2.5 ${bgColor}`}>
                  <Icon className={`size-5 ${color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-2xl font-bold tabular-nums tracking-tight">
                    {stats[key]}
                  </p>
                  <p className="truncate text-xs font-medium text-muted-foreground">
                    {label}
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        )}
      </div>
      {allZero && (
        <Card className="border-dashed bg-muted/30">
          <CardContent className="flex items-center justify-center gap-2 p-4 text-center">
            <span className="text-lg">🚀</span>
            <p className="text-sm text-muted-foreground">
              Start learning! Enroll in a course to track your progress.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
