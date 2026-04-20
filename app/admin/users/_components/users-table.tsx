import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { AdminUserItem } from "@/app/data/admin/admin-get-users";
import UserActions from "./user-actions";

type UsersTableProps = {
  users: AdminUserItem[];
  currentAdminId: string;
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export default function UsersTable({ users, currentAdminId }: UsersTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="hidden sm:table-cell">Enrollments</TableHead>
          <TableHead className="hidden md:table-cell">Joined</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            {/* User info */}
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar size="default">
                  {user.image && <AvatarImage src={user.image} alt={user.name} />}
                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate font-medium">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </div>
            </TableCell>

            {/* Role */}
            <TableCell>
              <Badge
                variant={user.role === "admin" ? "default" : "secondary"}
              >
                {user.role === "admin" ? "Admin" : "User"}
              </Badge>
            </TableCell>

            {/* Status */}
            <TableCell>
              {user.banned ? (
                <div className="flex flex-col gap-0.5">
                  <Badge variant="destructive">Banned</Badge>
                  {user.banReason && (
                    <span
                      className="max-w-[150px] truncate text-xs text-muted-foreground"
                      title={user.banReason}
                    >
                      {user.banReason}
                    </span>
                  )}
                </div>
              ) : (
                <Badge variant="outline">Active</Badge>
              )}
            </TableCell>

            {/* Enrollments */}
            <TableCell className="hidden sm:table-cell">
              {user.enrollmentCount}
            </TableCell>

            {/* Joined */}
            <TableCell className="hidden md:table-cell">
              {formatDate(user.createdAt)}
            </TableCell>

            {/* Actions */}
            <TableCell className="text-right">
              <UserActions
                userId={user.id}
                userName={user.name}
                isBanned={user.banned}
                currentRole={user.role}
                isSelf={user.id === currentAdminId}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

