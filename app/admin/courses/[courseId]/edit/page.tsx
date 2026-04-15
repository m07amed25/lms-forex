import adminGetCourse from "@/app/data/admin/admin-get-course";
import { notFound } from "next/navigation";
import EditCourseForm from "./EditCourseForm";

type EditCoursePageProps = {
  params: Promise<{ courseId: string }>;
};

const EditCoursePage = async ({ params }: EditCoursePageProps) => {
  const { courseId } = await params;
  const course = await adminGetCourse(courseId);

  if (!course) {
    notFound();
  }

  return <EditCourseForm course={course} />;
};

export default EditCoursePage;
