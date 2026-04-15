import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminCourseDetailType } from "@/app/data/admin/admin-get-course";
import { tiptapJsonToHtml } from "@/lib/tiptap-html";
import {
  Clock,
  DollarSign,
  BarChart3,
  Tag,
  Link as LinkIcon,
  Calendar,
  RefreshCw,
} from "lucide-react";

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

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

const CourseDetailView = ({ course }: { course: AdminCourseDetailType }) => {
  return (
    <div className="flex flex-col gap-6">
      {/* Thumbnail */}
      <div className="relative w-full max-w-2xl aspect-video rounded-lg overflow-hidden border">
        <Image
          src={course.imageUrl}
          alt={course.title}
          fill
          unoptimized
          className="object-cover"
        />
      </div>

      {/* Status & Publication Badges */}
      <div className="flex items-center gap-2">
        <Badge variant={getStatusVariant(course.status)}>
          {course.status}
        </Badge>
        <Badge variant={course.isPublished ? "default" : "outline"}>
          {course.isPublished ? "Published" : "Unpublished"}
        </Badge>
        <Badge variant="secondary">{course.level}</Badge>
      </div>

      {/* Metadata Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Course Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Price:</span>
              <span className="font-medium">${course.price.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Duration:</span>
              <span className="font-medium">{course.duration} hours</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Level:</span>
              <span className="font-medium">{course.level}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Category:</span>
              <span className="font-medium">{course.category}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <LinkIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Slug:</span>
              <span className="font-mono text-xs">{course.slug}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Created:</span>
              <span className="font-medium">
                {formatDate(course.createdAt)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm col-span-1 md:col-span-2">
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Last Updated:</span>
              <span className="font-medium">
                {formatDate(course.updatedAt)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Short Description */}
      <Card>
        <CardHeader>
          <CardTitle>Short Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{course.smallDescription}</p>
        </CardContent>
      </Card>

      {/* Full Description (Rich Text) */}
      <Card>
        <CardHeader>
          <CardTitle>Full Description</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="tiptap prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{
              __html: tiptapJsonToHtml(course.description),
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default CourseDetailView;

