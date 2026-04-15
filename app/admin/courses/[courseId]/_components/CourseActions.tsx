"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import PublishToggle from "./PublishToggle";
import DeleteCourseDialog from "./DeleteCourseDialog";

type CourseActionsProps = {
  courseId: string;
  courseTitle: string;
  status: string;
};

const CourseActions = ({
  courseId,
  courseTitle,
  status,
}: CourseActionsProps) => {
  return (
    <div className="flex items-center gap-3 w-full sm:w-auto">
      <PublishToggle
        courseId={courseId}
        status={status}
      />
      <Link
        href={`/admin/courses/${courseId}/edit`}
        className={buttonVariants({
          variant: "outline",
          className: "flex-1 sm:flex-initial",
        })}
      >
        <Pencil className="h-4 w-4" />
        Edit
      </Link>
      <DeleteCourseDialog courseId={courseId} courseTitle={courseTitle} />
    </div>
  );
};

export default CourseActions;
