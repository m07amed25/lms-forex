"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { courseCategories, courseLevels, courseStatus } from "@/lib/zodSchema";

const CourseFilters = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize local state from URL search params
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") ?? "",
  );

  // Create a new URLSearchParams from the current ones
  const createQueryString = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }

      // Reset to page 1 when filters change
      params.delete("page");

      return params.toString();
    },
    [searchParams],
  );

  // Debounced search: 300ms delay (research R-06)
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentSearch = searchParams.get("search") ?? "";
      if (searchTerm !== currentSearch) {
        const queryString = createQueryString({ search: searchTerm || null });
        router.replace(
          queryString ? `${pathname}?${queryString}` : pathname,
        );
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, searchParams, createQueryString, pathname, router]);

  function handleFilterChange(key: string, value: string) {
    const queryString = createQueryString({
      [key]: value === "all" ? null : value,
    });
    router.replace(queryString ? `${pathname}?${queryString}` : pathname);
  }

  function handleClearFilters() {
    setSearchTerm("");
    router.replace(pathname);
  }

  const hasActiveFilters =
    searchParams.get("search") ||
    searchParams.get("status") ||
    searchParams.get("level") ||
    searchParams.get("category");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses by title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Status Filter */}
        <Select
          value={searchParams.get("status") ?? "all"}
          onValueChange={(value) => handleFilterChange("status", value || "all")}
        >
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {courseStatus.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Level Filter */}
        <Select
          value={searchParams.get("level") ?? "all"}
          onValueChange={(value) => handleFilterChange("level", value || "all")}
        >
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            {courseLevels.map((level) => (
              <SelectItem key={level} value={level}>
                {level}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Category Filter */}
        <Select
          value={searchParams.get("category") ?? "all"}
          onValueChange={(value) => handleFilterChange("category", value || "all")}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {courseCategories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default CourseFilters;



