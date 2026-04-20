"use client";

import { useTransition, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ShieldCheck,
  ShieldOff,
  Ban,
  MoreHorizontal,
  Eye,
} from "lucide-react";
import { banUser, unbanUser, changeUserRole } from "../_actions/user-actions";
import Link from "next/link";

type UserActionsProps = {
  userId: string;
  userName: string;
  isBanned: boolean;
  currentRole: string | null;
  isSelf: boolean;
};

export default function UserActions({
  userId,
  userName,
  isBanned,
  currentRole,
  isSelf,
}: UserActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [banReason, setBanReason] = useState("");
  const [selectedRole, setSelectedRole] = useState(
    currentRole === "admin" ? "admin" : "user",
  );
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);

  function handleBan() {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("userId", userId);
      if (banReason) formData.set("banReason", banReason);

      const result = await banUser(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`${userName} has been banned`);
        setBanReason("");
      }
      setBanDialogOpen(false);
    });
  }

  function handleUnban() {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("userId", userId);

      const result = await unbanUser(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`${userName} has been unbanned`);
      }
    });
  }

  function handleRoleChange() {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("userId", userId);
      formData.set("role", selectedRole);

      const result = await changeUserRole(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(
          `${userName}'s role changed to ${selectedRole}`,
        );
      }
      setRoleDialogOpen(false);
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="ghost" size="sm" disabled={isPending}>
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Actions</span>
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            render={<Link href={`/admin/users/${userId}`} />}
          >
            <Eye className="mr-2 h-4 w-4" />
            View Profile
          </DropdownMenuItem>

          {!isSelf && (
            <>
              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => {
                  setSelectedRole(
                    currentRole === "admin" ? "admin" : "user",
                  );
                  setRoleDialogOpen(true);
                }}
              >
                <ShieldCheck className="mr-2 h-4 w-4" />
                Change Role
              </DropdownMenuItem>

              {isBanned ? (
                <DropdownMenuItem onClick={handleUnban} disabled={isPending}>
                  <ShieldOff className="mr-2 h-4 w-4" />
                  Unban User
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem
                  onClick={() => setBanDialogOpen(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Ban className="mr-2 h-4 w-4" />
                  Ban User
                </DropdownMenuItem>
              )}
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Ban Dialog */}
      <AlertDialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ban {userName}?</AlertDialogTitle>
            <AlertDialogDescription>
              This user will be immediately logged out and unable to access the
              platform. You can unban them later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="px-0 py-2">
            <Input
              placeholder="Ban reason (optional)"
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              maxLength={500}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBan}
              disabled={isPending}
              variant="destructive"
            >
              {isPending ? "Banning..." : "Ban User"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Role Change Dialog */}
      <AlertDialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Change Role for {userName}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedRole === "admin"
                ? "Admins have full access to the admin dashboard and can manage all content and users."
                : "Users can browse courses, enroll, and track their learning progress."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="px-0 py-2">
            <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v ?? "user")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRoleChange} disabled={isPending}>
              {isPending ? "Saving..." : "Save Role"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}



