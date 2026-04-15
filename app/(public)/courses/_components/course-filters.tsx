"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { courseLevels } from "@/lib/zodSchema";

export default function CourseFilters({
  categories,
}: {
  categories: string[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentLevel = searchParams.get("level") ?? "";
  const currentCategory = searchParams.get("category") ?? "";
  const hasActiveFilters = currentLevel || currentCategory;

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value && value !== "all") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page"); // reset pagination on filter change

    const queryString = params.toString();
    router.replace(queryString ? `/courses?${queryString}` : "/courses");
  }

  function clearFilters() {
    const params = new URLSearchParams();
    const search = searchParams.get("search");
    if (search) params.set("search", search);
    const queryString = params.toString();
    router.replace(queryString ? `/courses?${queryString}` : "/courses");
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Level Filter */}
      <Select
        value={currentLevel || "all"}
        onValueChange={(val) => updateFilter("level", val ?? "")}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="All Levels" />
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
      {categories.length > 0 && (
        <Select
          value={currentCategory || "all"}
          onValueChange={(val) => updateFilter("category", val ?? "")}
        >
          <SelectTrigger className="w-45">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <X className="size-3.5" />
          Clear Filters
        </Button>
      )}
    </div>
  );
}



