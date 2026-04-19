"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserPen, BookOpenCheck, ShieldCheck } from "lucide-react";

interface ProfileTabsProps {
  profileContent: React.ReactNode;
  coursesContent: React.ReactNode;
  sessionsContent: React.ReactNode;
}

export default function ProfileTabs({
  profileContent,
  coursesContent,
  sessionsContent,
}: ProfileTabsProps) {
  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList variant="line" className="w-full justify-start border-b pb-0">
        <TabsTrigger value="profile" className="gap-1.5">
          <UserPen className="size-4" />
          Profile
        </TabsTrigger>
        <TabsTrigger value="courses" className="gap-1.5">
          <BookOpenCheck className="size-4" />
          My Courses
        </TabsTrigger>
        <TabsTrigger value="sessions" className="gap-1.5">
          <ShieldCheck className="size-4" />
          Sessions
        </TabsTrigger>
      </TabsList>
      <TabsContent value="profile" className="mt-6">
        {profileContent}
      </TabsContent>
      <TabsContent value="courses" className="mt-6">
        {coursesContent}
      </TabsContent>
      <TabsContent value="sessions" className="mt-6">
        {sessionsContent}
      </TabsContent>
    </Tabs>
  );
}
