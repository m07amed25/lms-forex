import { adminGetAnalyticsSummary } from "@/app/data/admin/admin-get-analytics-summary";
import { adminGetRevenueTimeseries } from "@/app/data/admin/admin-get-revenue-timeseries";
import { adminGetEnrollmentTimeseries } from "@/app/data/admin/admin-get-enrollment-timeseries";
import { adminGetCoursePerformance } from "@/app/data/admin/admin-get-course-performance";
import { adminGetRevenueByCourse } from "@/app/data/admin/admin-get-revenue-by-course";
import { adminGetPaymentMethods } from "@/app/data/admin/admin-get-payment-methods";
import { AnalyticsCards } from "./_components/analytics-cards";
import { RevenueChart } from "./_components/revenue-chart";
import { EnrollmentChart } from "./_components/enrollment-chart";
import { CoursePerformanceTable } from "./_components/course-performance-table";
import { RevenueByCourseChart } from "./_components/revenue-by-course-chart";
import { PaymentMethodChart } from "./_components/payment-method-chart";

export default async function AdminIndexPage() {
  const [
    summary,
    revenueTimeseries,
    enrollmentTimeseries,
    coursePerformance,
    revenueByCourse,
    paymentMethods,
  ] = await Promise.all([
    adminGetAnalyticsSummary(),
    adminGetRevenueTimeseries(),
    adminGetEnrollmentTimeseries(),
    adminGetCoursePerformance(),
    adminGetRevenueByCourse(),
    adminGetPaymentMethods(),
  ]);

  return (
    <>
      <AnalyticsCards data={summary} />
      <div className="px-4 lg:px-6">
        <RevenueChart data={revenueTimeseries} />
      </div>
      <div className="px-4 lg:px-6">
        <EnrollmentChart data={enrollmentTimeseries} />
      </div>
      <div className="px-4 lg:px-6">
        <CoursePerformanceTable data={coursePerformance} />
      </div>
      <div className="grid grid-cols-1 gap-4 px-4 lg:grid-cols-2 lg:px-6">
        <RevenueByCourseChart data={revenueByCourse} />
        <PaymentMethodChart data={paymentMethods} />
      </div>
    </>
  );
}
