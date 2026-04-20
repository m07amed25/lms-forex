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

export default function UserFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") ?? "",
  );

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

  // Debounced search
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
    searchParams.get("role") ||
    searchParams.get("status");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Role Filter */}
        <Select
          value={searchParams.get("role") ?? "all"}
          onValueChange={(value) => handleFilterChange("role", value || "all")}
        >
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select
          value={searchParams.get("status") ?? "all"}
          onValueChange={(value) =>
            handleFilterChange("status", value || "all")
          }
        >
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="banned">Banned</SelectItem>
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
}

