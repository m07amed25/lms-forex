import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/format-currency";
import type { AnalyticsSummary } from "@/lib/types/analytics";
import {
  TrendingUpIcon,
  TrendingDownIcon,
  DollarSignIcon,
  UsersIcon,
  ActivityIcon,
  GraduationCapIcon,
} from "lucide-react";

type Props = {
  data: AnalyticsSummary;
};

function TrendBadge({ value, suffix = "%" }: { value: number; suffix?: string }) {
  const isPositive = value > 0;
  const isZero = value === 0;
  const Icon = isPositive ? TrendingUpIcon : TrendingDownIcon;

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-medium ${
        isZero
          ? "text-muted-foreground"
          : isPositive
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-red-600 dark:text-red-400"
      }`}
    >
      {!isZero && <Icon className="h-3 w-3" />}
      {isPositive && "+"}
      {value}
      {suffix}
    </span>
  );
}

export function AnalyticsCards({ data }: Props) {
  const cards = [
    {
      title: "Total Revenue",
      value: formatCurrency(data.totalRevenueCents),
      trend: data.trends.revenue,
      suffix: "%",
      icon: DollarSignIcon,
    },
    {
      title: "Total Students",
      value: data.totalStudents.toLocaleString(),
      trend: data.trends.students,
      suffix: "%",
      icon: UsersIcon,
    },
    {
      title: "Active Students",
      value: data.activeStudents.toLocaleString(),
      trend: data.trends.activeStudents,
      suffix: "%",
      icon: ActivityIcon,
    },
    {
      title: "Completion Rate",
      value: `${data.completionRate}%`,
      trend: data.trends.completionRate,
      suffix: "pp",
      icon: GraduationCapIcon,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 lg:grid-cols-4 lg:px-6">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {card.title}
            </CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <div className="mt-1">
              <TrendBadge value={card.trend} suffix={card.suffix} />
              <span className="ml-1 text-xs text-muted-foreground">
                vs last 30 days
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

