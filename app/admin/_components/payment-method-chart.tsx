"use client";

import { Pie, PieChart } from "recharts";
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
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatCurrency } from "@/lib/format-currency";
import type { PaymentMethodDistribution } from "@/lib/types/analytics";

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

type Props = {
  data: PaymentMethodDistribution[];
};

export function PaymentMethodChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>No payment data available yet.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const totalAmount = data.reduce((sum, d) => sum + d.amountCents, 0);

  const chartData = data.map((d, i) => ({
    name: d.method,
    value: d.amountCents,
    count: d.count,
    percentage:
      totalAmount > 0 ? ((d.amountCents / totalAmount) * 100).toFixed(1) : "0",
    fill: COLORS[i % COLORS.length],
  }));

  const chartConfig = Object.fromEntries(
    chartData.map((d) => [
      d.name,
      { label: d.name, color: d.fill },
    ])
  ) satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Methods</CardTitle>
        <CardDescription>
          Distribution of payment methods by revenue
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-[300px]"
        >
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => {
                    const item = chartData.find((d) => d.name === name);
                    return `${formatCurrency(Number(value))} (${item?.percentage}%) · ${item?.count} orders`;
                  }}
                  indicator="dot"
                />
              }
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
            />
            <ChartLegend content={<ChartLegendContent nameKey="name" />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}



