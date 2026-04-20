export type AnalyticsSummary = {
  totalRevenueCents: number;
  totalStudents: number;
  activeStudents: number;
  completionRate: number;
  trends: {
    revenue: number;
    students: number;
    activeStudents: number;
    completionRate: number;
  };
};

export type TimeSeriesDataPoint = {
  date: string; // YYYY-MM-DD
  value: number;
};

export type CoursePerformanceRow = {
  id: string;
  title: string;
  enrollments: number;
  revenueCents: number;
  completionRate: number; // 0-100
  status: "Draft" | "Published" | "Archived";
};

export type RevenueByCourse = {
  courseId: string;
  courseTitle: string;
  revenueCents: number;
};

export type PaymentMethodDistribution = {
  method: string;
  count: number;
  amountCents: number;
};

