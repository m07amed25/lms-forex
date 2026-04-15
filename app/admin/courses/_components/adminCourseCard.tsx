import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { AdminCourseType } from "@/app/data/admin/admin-get-courses";
import Link from "next/link";
import { DollarSign, Clock } from "lucide-react";

function getStatusVariant(
  status: string,
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "Published":
      return "default";
    case "Draft":
      return "secondary";
    case "Archived":
      return "outline";
    default:
      return "secondary";
  }
}

const AdminCourseCard = ({ course }: { course: AdminCourseType }) => {
  return (
    <Card className="group relative overflow-hidden">
      <div>
        <div className="relative">
          <Image
            src={course.imageUrl}
            alt={course.title}
            width={600}
            height={400}
            unoptimized
            className="w-full rounded-t-lg aspect-video h-full object-cover"
          />
          {/* Status badge overlay on thumbnail */}
          <div className="absolute top-2 right-2 flex gap-1">
            <Badge variant={getStatusVariant(course.status)} className="text-xs">
              {course.status}
            </Badge>
            {course.isPublished && (
              <Badge variant="default" className="text-xs">
                Live
              </Badge>
            )}
          </div>
        </div>
        <CardContent className="pt-4">
          <Link
            href={`/admin/courses/${course.id}`}
            className="font-medium text-lg line-clamp-2 hover:underline group-hover:text-primary transition-colors"
          >
            {course.title}
          </Link>
          <p className="line-clamp-2 text-sm text-muted-foreground leading-tight mt-2">
            {course.smallDescription}
          </p>
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <Badge variant="secondary" className="text-xs">
              {course.level}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {course.category}
            </Badge>
            <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
              <DollarSign className="h-3 w-3" />
              <span className="font-medium">{course.price.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>{course.duration}h</span>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

export default AdminCourseCard;
