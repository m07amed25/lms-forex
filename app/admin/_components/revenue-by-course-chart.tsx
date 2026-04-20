"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatCurrency } from "@/lib/format-currency";
import type { RevenueByCourse } from "@/lib/types/analytics";

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "var(--primary)",
  },
} satisfies ChartConfig;

type Props = {
  data: RevenueByCourse[];
};

export function RevenueByCourseChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Revenue by Course</CardTitle>
          <CardDescription>No revenue data available yet.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const chartData = data.map((d) => ({
    name:
      d.courseTitle.length > 20
        ? d.courseTitle.slice(0, 20) + "…"
        : d.courseTitle,
    fullName: d.courseTitle,
    revenue: d.revenueCents,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue by Course</CardTitle>
        <CardDescription>
          Total revenue per course, ranked by highest
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[300px] w-full"
        >
          <BarChart data={chartData} layout="vertical" margin={{ left: 10 }}>
            <CartesianGrid horizontal={false} />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) =>
                formatCurrency(value).replace("EGP", "").trim()
              }
            />
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              axisLine={false}
              width={150}
              tickMargin={4}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(_value, payload) => {
                    const item = payload?.[0]?.payload;
                    return item?.fullName ?? _value;
                  }}
                  formatter={(value) => formatCurrency(Number(value))}
                  indicator="dot"
                />
              }
            />
            <Bar
              dataKey="revenue"
              fill="var(--color-revenue)"
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

