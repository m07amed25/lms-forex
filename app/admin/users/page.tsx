import { Suspense } from "react";
import { adminGetUsers } from "@/app/data/admin/admin-get-users";
import { requireAdmin } from "@/app/data/admin/require-admin";
import { Users, SearchX } from "lucide-react";
import UsersTable from "./_components/users-table";
import UserFilters from "./_components/user-filters";
import UsersPagination from "./_components/users-pagination";

type UsersPageProps = {
  searchParams: Promise<{
    search?: string;
    role?: string;
    status?: string;
    page?: string;
  }>;
};

export default async function AdminUsersPage({
  searchParams,
}: UsersPageProps) {
  const admin = await requireAdmin();
  const params = await searchParams;

  const { users, totalCount, totalPages, currentPage } = await adminGetUsers({
    search: params.search,
    role: params.role,
    status: params.status,
    page: params.page ? parseInt(params.page, 10) : undefined,
  });

  const hasActiveFilters = params.search || params.role || params.status;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-3xl font-bold tracking-tight">
          Users
        </h1>
        <p className="mt-1 text-muted-foreground">
          Manage platform users, roles, and access
        </p>
      </div>

      {/* Filters */}
      <Suspense fallback={null}>
        <UserFilters />
      </Suspense>

      {/* Users Table or Empty State */}
      {users.length === 0 ? (
        hasActiveFilters ? (
          <div className="flex min-h-[400px] animate-in fade-in zoom-in flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/50 bg-muted/30 p-8 text-center duration-500">
            <div className="mb-4 rounded-full bg-muted p-6">
              <SearchX className="h-12 w-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold">No matching users</h2>
            <p className="mt-2 max-w-sm text-muted-foreground">
              No users match your current search and filter criteria. Try
              adjusting your filters.
            </p>
          </div>
        ) : (
          <div className="flex min-h-[400px] animate-in fade-in zoom-in flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/50 bg-muted/30 p-8 text-center duration-500">
            <div className="mb-4 rounded-full bg-primary/10 p-6">
              <Users className="h-12 w-12 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">No users yet</h2>
            <p className="mt-2 max-w-sm text-muted-foreground">
              Users will appear here once they register on the platform.
            </p>
          </div>
        )
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Showing {users.length} of {totalCount} user
            {totalCount !== 1 ? "s" : ""}
          </p>

          <div className="rounded-lg border">
            <UsersTable users={users} currentAdminId={admin.id} />
          </div>

          <UsersPagination
            currentPage={currentPage}
            totalPages={totalPages}
            searchParams={{
              search: params.search,
              role: params.role,
              status: params.status,
            }}
          />
        </>
      )}
    </div>
  );
}

