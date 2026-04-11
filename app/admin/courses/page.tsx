import { buttonVariants } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

const CoursesPage = () => {
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Courses</h1>
          <p className="text-muted-foreground">
            Manage your courses and lessons
          </p>
        </div>
        <Link
          href={"/admin/courses/create"}
          className={`${buttonVariants({ variant: "default" })} flex items-center gap-1.5 text-white`}
        >
          <Plus className="h-4 w-4" />
          Create Course
        </Link>
      </div>

      <div>
        <h1>Here you will see all of the courses</h1>
      </div>
    </>
  );
};

export default CoursesPage;
