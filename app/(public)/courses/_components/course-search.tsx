"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function CourseSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("search") ?? "");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentSearch = searchParams.get("search") ?? "";
  useEffect(() => {
    // Sync from URL on external navigation
    setValue(currentSearch);
  }, [currentSearch]);

  function handleChange(newValue: string) {
    // Enforce max 100 chars
    const sanitized = newValue.slice(0, 100);
    setValue(sanitized);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const trimmed = sanitized.trim();

      if (trimmed) {
        params.set("search", trimmed);
      } else {
        params.delete("search");
      }
      params.delete("page"); // reset pagination on new search

      const queryString = params.toString();
      router.replace(queryString ? `/courses?${queryString}` : "/courses");
    }, 300);
  }

  return (
    <div className="relative flex-1 max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search courses..."
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        className="pl-9"
        maxLength={100}
      />
    </div>
  );
}


