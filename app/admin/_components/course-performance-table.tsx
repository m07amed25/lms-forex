"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/format-currency";
import type { CoursePerformanceRow } from "@/lib/types/analytics";
import { ArrowUpDown } from "lucide-react";

type Props = {
  data: CoursePerformanceRow[];
};

type SortKey = keyof CoursePerformanceRow;
type SortDir = "asc" | "desc";

export function CoursePerformanceTable({ data }: Props) {
  const [sortKey, setSortKey] = React.useState<SortKey>("revenueCents");
  const [sortDir, setSortDir] = React.useState<SortDir>("desc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const sorted = React.useMemo(() => {
    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDir === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });
  }, [data, sortKey, sortDir]);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Course Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No published courses found.
          </p>
        </CardContent>
      </Card>
    );
  }

  const columns: { key: SortKey; label: string }[] = [
    { key: "title", label: "Course Title" },
    { key: "enrollments", label: "Enrollments" },
    { key: "revenueCents", label: "Revenue" },
    { key: "completionRate", label: "Completion Rate" },
    { key: "status", label: "Status" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.key}>
                  <button
                    className="inline-flex items-center gap-1 hover:text-foreground"
                    onClick={() => handleSort(col.key)}
                  >
                    {col.label}
                    <ArrowUpDown className="h-3 w-3" />
                  </button>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.title}</TableCell>
                <TableCell>{row.enrollments.toLocaleString()}</TableCell>
                <TableCell>{formatCurrency(row.revenueCents)}</TableCell>
                <TableCell>{row.completionRate}%</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      row.status === "Published"
                        ? "default"
                        : row.status === "Archived"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {row.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

