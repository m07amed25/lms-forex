import { adminGetEnrollments } from "@/app/data/admin/admin-get-enrollments";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Props = {
  params: Promise<{ courseId: string }>;
};

export default async function AdminEnrollmentsPage({ params }: Props) {
  const { courseId } = await params;

  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { title: true },
  });

  if (!course) notFound();

  const enrollments = await adminGetEnrollments(courseId);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Enrollments</h1>
      <p className="text-muted-foreground mb-6">{course.title}</p>

      {enrollments.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No enrollments yet for this course.
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Learner</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Enrolled</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrollments.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium">{e.userName}</TableCell>
                  <TableCell>{e.userEmail}</TableCell>
                  <TableCell>
                    <Badge
                      variant={e.status === "Active" ? "default" : "secondary"}
                    >
                      {e.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(e.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{e.paymentMethod ?? "Free"}</TableCell>
                  <TableCell className="text-right">
                    {e.amountCents
                      ? `${(e.amountCents / 100).toFixed(2)} EGP`
                      : "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

