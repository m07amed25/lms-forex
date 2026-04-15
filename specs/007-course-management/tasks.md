# Tasks: Course Management — Admin CRUD

**Input**: Design documents from `/specs/007-course-management/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests & Verification**: Verification is REQUIRED. Include `pnpm lint`, `pnpm build`, and
feature-specific manual checks per `quickstart.md`. No automated test tasks generated (not requested in spec).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `ID` `P?` `Story` Description

- **`P`**: Can run in parallel (different files, no dependencies)
- **`Story`**: Which user story this task belongs to (e.g., `US1`, `US2`, `US3`)
- Include exact file paths in descriptions

## Path Conventions

- Admin features live in `app/admin/`
- Shared server data helpers live in `app/data/admin/`
- Shared UI lives in `components/ui/`; route-local UI lives in `app/admin/courses/[courseId]/_components/`
- Route-local mutations live in `app/admin/courses/[courseId]/actions.ts`
- Zod schemas live in `lib/zodSchema.ts`
- Types live in `lib/types.ts`
- Prisma schema at `prisma/schema.prisma` (NO changes needed)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Feature setup and directory scaffolding

- [X] T001 Confirm that `Phases.md` shows Phase 7 as active, verify `prisma/schema.prisma` has the `Course` model with all required fields (`id`, `title`, `description`, `smallDescription`, `fileKey`, `price`, `duration`, `level`, `category`, `slug`, `isPublished`, `status`, `createdAt`, `updatedAt`, `userId`), and confirm no migration is needed. Verify the existing `app/admin/layout.tsx` calls `await requireAdmin()` at the top. Run `pnpm prisma generate` to ensure Prisma Client is up to date.

- [X] T002 [P] Create the following empty directory structure (files will be populated in later tasks). Create the directories only — do NOT create placeholder files:
  ```
  app/admin/courses/[courseId]/              ← dynamic route segment
  app/admin/courses/[courseId]/_components/  ← co-located client components
  app/admin/courses/[courseId]/edit/         ← edit page route
  ```
  **How**: Create the folders manually or create a placeholder `.gitkeep` in each. These will be populated by subsequent tasks.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core schemas, data helpers, and server actions that MUST be complete before ANY user story page can be built

**⚠️ CRITICAL**: No user story work (Phases 3–7) can begin until this phase is complete

### T003 — Add `updateCourseSchema` to `lib/zodSchema.ts`

- [X] T003 [P] Add `updateCourseSchema`, its inferred types, and the `COURSES_PAGE_SIZE` constant to `lib/zodSchema.ts`

  **File**: `lib/zodSchema.ts`

  **What to add** (append after the existing `export type CreateCourseInput` line at the bottom of the file):

  ```typescript
  export const updateCourseSchema = createCourseSchema.extend({
    courseId: z.string().uuid({ message: "Valid course ID is required" }),
  });

  export type UpdateCourseSchema = z.infer<typeof updateCourseSchema>;
  export type UpdateCourseInput = z.input<typeof updateCourseSchema>;

  export const COURSES_PAGE_SIZE = 12;
  ```

  **Verification**: The file must still export `createCourseSchema`, `CreateCourseSchema`, `CreateCourseInput`, `courseLevels`, `courseStatus`, `courseCategories` unchanged. The new `updateCourseSchema` must include all fields from `createCourseSchema` PLUS `courseId` (UUID string). Run `pnpm lint` to verify no errors.

---

### T004 — Create `adminGetCourse` data helper

- [X] T004 [P] Create `app/data/admin/admin-get-course.ts` — a server-only data helper to fetch a single course by ID with a signed S3 thumbnail URL

  **File**: `app/data/admin/admin-get-course.ts` (NEW file)

  **Exact content**:

  ```typescript
  import { prisma } from "@/lib/db";
  import { requireAdmin } from "./require-admin";
  import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
  import { GetObjectCommand } from "@aws-sdk/client-s3";
  import { S3 } from "@/lib/S3Client";
  import { env } from "@/lib/env";
  import { CourseLevel, CourseStatus } from "@prisma/client";

  export default async function adminGetCourse(courseId: string) {
    await requireAdmin();

    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) return null;

    let imageUrl = "";
    if (course.fileKey) {
      const command = new GetObjectCommand({
        Bucket: env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES,
        Key: course.fileKey,
      });
      imageUrl = await getSignedUrl(S3, command, { expiresIn: 3600 });
    }

    return { ...course, imageUrl };
  }

  export type AdminCourseDetailType = NonNullable<
    Awaited<ReturnType<typeof adminGetCourse>>
  >;
  ```

  **Key details**:
  - Calls `requireAdmin()` at top — redirects unauthenticated/non-admin users
  - Uses `prisma.course.findUnique` (NOT `findFirst`) for a primary key lookup
  - Returns `null` if course not found (callers handle not-found)
  - Generates a signed S3 URL with 1-hour expiry, exactly matching the pattern in `admin-get-courses.ts`
  - Exports the `AdminCourseDetailType` type for consumers (detail page, edit page)

  **Verification**: `pnpm lint` passes. File compiles without errors.

---

### T005 — Enhance `adminGetCourses` with search, filter, and pagination

- [X] T005 Modify `app/data/admin/admin-get-courses.ts` to accept optional `search`, `status`, `level`, `category`, and `page` parameters, build a dynamic Prisma `where` clause, apply `skip`/`take` pagination, and return `{ courses, totalCount, totalPages, currentPage }`

  **File**: `app/data/admin/admin-get-courses.ts` (MODIFY existing file)

  **Replace the entire file content with**:

  ```typescript
  import { prisma } from "@/lib/db";
  import { requireAdmin } from "./require-admin";
  import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
  import { GetObjectCommand } from "@aws-sdk/client-s3";
  import { S3 } from "@/lib/S3Client";
  import { env } from "@/lib/env";
  import { COURSES_PAGE_SIZE } from "@/lib/zodSchema";
  import { Prisma, CourseLevel, CourseStatus } from "@prisma/client";

  export default async function adminGetCourses(params?: {
    search?: string;
    status?: string;
    level?: string;
    category?: string;
    page?: number;
  }) {
    await requireAdmin();

    const where: Prisma.CourseWhereInput = {};

    if (params?.search) {
      where.title = { contains: params.search, mode: "insensitive" };
    }
    if (params?.status) {
      where.status = params.status as CourseStatus;
    }
    if (params?.level) {
      where.level = params.level as CourseLevel;
    }
    if (params?.category) {
      where.category = params.category;
    }

    const currentPage = Math.max(1, params?.page ?? 1);

    const [courses, totalCount] = await Promise.all([
      prisma.course.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (currentPage - 1) * COURSES_PAGE_SIZE,
        take: COURSES_PAGE_SIZE,
        select: {
          id: true,
          title: true,
          smallDescription: true,
          duration: true,
          level: true,
          status: true,
          price: true,
          fileKey: true,
          category: true,
          slug: true,
          isPublished: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.course.count({ where }),
    ]);

    const data = await Promise.all(
      courses.map(async (course) => {
        let imageUrl = "";
        if (course.fileKey) {
          const command = new GetObjectCommand({
            Bucket: env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES,
            Key: course.fileKey,
          });
          imageUrl = await getSignedUrl(S3, command, { expiresIn: 3600 });
        }

        return {
          ...course,
          imageUrl,
        };
      }),
    );

    const totalPages = Math.ceil(totalCount / COURSES_PAGE_SIZE);

    return { courses: data, totalCount, totalPages, currentPage };
  }

  export type AdminCourseType = Awaited<
    ReturnType<typeof adminGetCourses>
  >["courses"][0];
  ```

  **Critical changes from existing file**:
  1. **New import**: `COURSES_PAGE_SIZE` from `@/lib/zodSchema`, `Prisma`, `CourseLevel`, `CourseStatus` from `@prisma/client`
  2. **New parameter**: `params?` object with `search`, `status`, `level`, `category`, `page`
  3. **Dynamic `where` clause**: Builds conditionally based on provided params. `title.contains` with `mode: "insensitive"` for search.
  4. **Pagination**: `skip` = `(currentPage - 1) * 12`, `take` = `12`. `currentPage` defaults to 1 with `Math.max(1, ...)` safety.
  5. **`isPublished: true`** added to select (was missing before)
  6. **Return shape changed**: Was `data` (flat array) → now `{ courses: data, totalCount, totalPages, currentPage }`
  7. **`AdminCourseType` updated**: Now derives from `["courses"][0]` since return shape is an object

  **Verification**: `pnpm lint` passes. The existing `app/admin/courses/page.tsx` WILL break after this change because it expects a flat array — this is expected and will be fixed in T027 (US5).

---

### T006 — Create all three Server Actions in `[courseId]/actions.ts`

- [X] T006 Create `app/admin/courses/[courseId]/actions.ts` with `updateCourse`, `deleteCourse`, `togglePublish` server actions and the internal `cleanupS3Thumbnail` helper

  **File**: `app/admin/courses/[courseId]/actions.ts` (NEW file)

  **Exact content**:

  ```typescript
  "use server";

  import { prisma } from "@/lib/db";
  import { updateCourseSchema, UpdateCourseSchema } from "@/lib/zodSchema";
  import { ApiResponse } from "@/lib/types";
  import { revalidatePath } from "next/cache";
  import { Prisma } from "@prisma/client";
  import { requireAdmin } from "@/app/data/admin/require-admin";
  import arcjet, { detectBot, fixedWindow } from "@/lib/arcjet";
  import { request } from "@arcjet/next";
  import { z } from "zod";
  import { env } from "@/lib/env";

  const aj = arcjet
    .withRule(
      detectBot({
        mode: "LIVE",
        allow: [],
      }),
    )
    .withRule(
      fixedWindow({
        mode: "LIVE",
        window: "1m",
        max: 5,
      }),
    );

  // ─── Internal Helper: S3 Cleanup ────────────────────────────
  async function cleanupS3Thumbnail(fileKey: string): Promise<void> {
    try {
      await fetch(`${env.BETTER_AUTH_URL}/api/s3/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: fileKey }),
      });
    } catch (error) {
      console.error("[S3 Cleanup Failed]:", fileKey, error);
    }
  }

  // ─── updateCourse ────────────────────────────────────────────
  export async function updateCourse(
    data: UpdateCourseSchema,
  ): Promise<ApiResponse> {
    const admin = await requireAdmin();

    if (!admin) {
      return { status: "error", message: "Unauthorized" };
    }

    try {
      const req = await request();

      const decision = await aj.protect(req, {
        fingerprint: admin.id,
      });

      if (decision.isDenied()) {
        if (decision.reason.isRateLimit()) {
          return {
            status: "error",
            message: "Too many requests. Please try again in a minute.",
          };
        }
        return {
          status: "error",
          message: "Access denied. Security rule triggered.",
        };
      }

      const validation = updateCourseSchema.safeParse(data);
      if (!validation.success) {
        const errorMsg = validation.error.issues
          .map((e) => e.message)
          .join(", ");
        return {
          status: "error",
          message: `Validation failed: ${errorMsg}`,
        };
      }

      const { courseId, status, duration, ...rest } = validation.data;

      // Fetch existing course to compare fileKey for thumbnail replacement
      const existingCourse = await prisma.course.findUnique({
        where: { id: courseId },
        select: { fileKey: true },
      });

      if (!existingCourse) {
        return { status: "error", message: "Course not found" };
      }

      await prisma.course.update({
        where: { id: courseId },
        data: {
          ...rest,
          status: status,
          isPublished: status === "Published",
          duration: Number(duration),
        },
      });

      // If fileKey changed, clean up old S3 thumbnail (fire-and-forget)
      if (existingCourse.fileKey !== rest.fileKey) {
        cleanupS3Thumbnail(existingCourse.fileKey).catch((err) =>
          console.error("[S3 Old Thumbnail Cleanup Error]:", err),
        );
      }

      revalidatePath("/admin/courses");
      revalidatePath(`/admin/courses/${courseId}`);

      return { status: "success", message: "Course updated successfully" };
    } catch (error) {
      console.error("[UpdateCourse Error]:", error);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2002") {
          return {
            status: "error",
            message: "A course with this slug already exists",
          };
        }
        return {
          status: "error",
          message: `Database error (${error.code}): ${error.message}`,
        };
      }

      return {
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while updating the course",
      };
    }
  }

  // ─── deleteCourse ────────────────────────────────────────────
  export async function deleteCourse(courseId: string): Promise<ApiResponse> {
    const admin = await requireAdmin();

    if (!admin) {
      return { status: "error", message: "Unauthorized" };
    }

    try {
      const req = await request();

      const decision = await aj.protect(req, {
        fingerprint: admin.id,
      });

      if (decision.isDenied()) {
        if (decision.reason.isRateLimit()) {
          return {
            status: "error",
            message: "Too many requests. Please try again in a minute.",
          };
        }
        return {
          status: "error",
          message: "Access denied. Security rule triggered.",
        };
      }

      // Validate courseId format
      const uuidResult = z.string().uuid().safeParse(courseId);
      if (!uuidResult.success) {
        return { status: "error", message: "Invalid course ID" };
      }

      // Fetch course to get fileKey for S3 cleanup
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: { fileKey: true },
      });

      if (!course) {
        return { status: "error", message: "Course not found" };
      }

      // Delete course record first
      await prisma.course.delete({
        where: { id: courseId },
      });

      // Clean up S3 thumbnail (fire-and-forget — failure does not block)
      if (course.fileKey) {
        cleanupS3Thumbnail(course.fileKey).catch((err) =>
          console.error("[S3 Delete Cleanup Error]:", err),
        );
      }

      revalidatePath("/admin/courses");

      return { status: "success", message: "Course deleted successfully" };
    } catch (error) {
      console.error("[DeleteCourse Error]:", error);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === "P2025") {
          return { status: "error", message: "Course not found" };
        }
        return {
          status: "error",
          message: "Failed to delete course",
        };
      }

      return {
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while deleting the course",
      };
    }
  }

  // ─── togglePublish ────────────────────────────────────────────
  export async function togglePublish(courseId: string): Promise<ApiResponse> {
    const admin = await requireAdmin();

    if (!admin) {
      return { status: "error", message: "Unauthorized" };
    }

    try {
      const req = await request();

      const decision = await aj.protect(req, {
        fingerprint: admin.id,
      });

      if (decision.isDenied()) {
        if (decision.reason.isRateLimit()) {
          return {
            status: "error",
            message: "Too many requests. Please try again in a minute.",
          };
        }
        return {
          status: "error",
          message: "Access denied. Security rule triggered.",
        };
      }

      // Validate courseId format
      const uuidResult = z.string().uuid().safeParse(courseId);
      if (!uuidResult.success) {
        return { status: "error", message: "Invalid course ID" };
      }

      // Fetch current course state
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: { status: true, isPublished: true },
      });

      if (!course) {
        return { status: "error", message: "Course not found" };
      }

      // Determine new state:
      // Published → Draft (unpublish)
      // Draft or Archived → Published (publish)
      const isCurrentlyPublished = course.status === "Published";
      const newStatus = isCurrentlyPublished ? "Draft" : "Published";
      const newIsPublished = !isCurrentlyPublished;

      await prisma.course.update({
        where: { id: courseId },
        data: {
          status: newStatus,
          isPublished: newIsPublished,
        },
      });

      revalidatePath("/admin/courses");
      revalidatePath(`/admin/courses/${courseId}`);

      return {
        status: "success",
        message: isCurrentlyPublished
          ? "Course unpublished successfully"
          : "Course published successfully",
      };
    } catch (error) {
      console.error("[TogglePublish Error]:", error);

      return {
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while toggling publish state",
      };
    }
  }
  ```

  **Key patterns to verify**:
  1. `"use server"` directive at very top
  2. Arcjet config is identical to `app/admin/courses/create/actions.ts` (5/min, LIVE mode, bot detection)
  3. Every action: `requireAdmin()` → Arcjet `protect()` → validate → Prisma op → `revalidatePath` → return `ApiResponse`
  4. `updateCourse`: Fetches existing course to compare `fileKey`. If changed, cleans up old S3 file after DB update. Catches `P2002` for slug conflict.
  5. `deleteCourse`: Validates UUID format with `z.string().uuid()`. Fetches `fileKey` before delete. Deletes DB record first, then S3. Catches `P2025` for already-deleted course.
  6. `togglePublish`: Published → Draft, Draft/Archived → Published. Uses `course.status === "Published"` to determine direction. Returns contextual success message.
  7. `cleanupS3Thumbnail`: Uses `fetch()` to call existing `/api/s3/delete` route with `{ key: fileKey }` body. Catches and logs errors silently. Uses `env.BETTER_AUTH_URL` as the base URL.

  **Verification**: `pnpm lint` passes. Imports resolve correctly.

**Checkpoint**: Foundation ready — all schemas, data helpers, and server actions are in place. User story implementation can now begin.

---

## Phase 3: User Story 1 — Course Detail View Page (Priority: P1) 🎯 MVP

**Goal**: Admin can navigate from the courses list to `/admin/courses/[courseId]` and see a read-only view of all course metadata, including thumbnail, title, rich text description, short description, price, duration, level, category, slug, status, publication state, and timestamps. Action buttons (Edit, Delete, Publish/Unpublish) are visible but non-functional until US2–US4 are implemented.

**Independent Test**: Create a course via `/admin/courses/create`, then navigate to `/admin/courses/[courseId]`. Verify all metadata renders correctly. Navigate to a non-existent courseId and verify the not-found page appears. Access as a non-admin and verify redirect.

### Implementation for User Story 1

- [X] T007 [P] [US1] Create `app/admin/courses/[courseId]/_components/CourseDetailView.tsx` — server component that renders all course metadata

  **File**: `app/admin/courses/[courseId]/_components/CourseDetailView.tsx` (NEW file)

  **Exact content**:

  ```typescript
  import Image from "next/image";
  import { Badge } from "@/components/ui/badge";
  import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
  import { Separator } from "@/components/ui/separator";
  import { AdminCourseDetailType } from "@/app/data/admin/admin-get-course";
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
              className="prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: course.description }}
            />
          </CardContent>
        </Card>
      </div>
    );
  };

  export default CourseDetailView;
  ```

  **Key details**:
  - This is a SERVER component (no `"use client"` directive). Zero client JS.
  - Rich text rendered via `dangerouslySetInnerHTML` with Tailwind Typography classes `prose prose-sm dark:prose-invert max-w-none` (research R-05).
  - `formatDate` uses `Intl.DateTimeFormat` for locale-safe formatting.
  - `getStatusVariant` maps course status to Badge variants.
  - Uses only `lucide-react` icons already in the project.
  - Accepts `AdminCourseDetailType` from the data helper.

---

- [X] T008 [P] [US1] Create `app/admin/courses/[courseId]/_components/CourseActions.tsx` — client component that renders Edit, Delete, and Publish/Unpublish action buttons

  **File**: `app/admin/courses/[courseId]/_components/CourseActions.tsx` (NEW file)

  **Exact content**:

  ```typescript
  "use client";

  import Link from "next/link";
  import { buttonVariants } from "@/components/ui/button";
  import { Pencil } from "lucide-react";
  import PublishToggle from "./PublishToggle";
  import DeleteCourseDialog from "./DeleteCourseDialog";

  type CourseActionsProps = {
    courseId: string;
    courseTitle: string;
    isPublished: boolean;
    status: string;
  };

  const CourseActions = ({
    courseId,
    courseTitle,
    isPublished,
    status,
  }: CourseActionsProps) => {
    return (
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <PublishToggle
          courseId={courseId}
          isPublished={isPublished}
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
  ```

  **Key details**:
  - `"use client"` because it composes client components (`PublishToggle`, `DeleteCourseDialog`).
  - The Edit button is a simple `Link` — no client state needed.
  - Passes only the minimal props each sub-component needs.
  - `DeleteCourseDialog` and `PublishToggle` are created in US3 (T013) and US4 (T015) respectively.

  **IMPORTANT**: This component imports `PublishToggle` and `DeleteCourseDialog` which don't exist yet. Create placeholder/stub files so TypeScript doesn't error, OR implement this task after T013 and T015 are complete. If implementing now, create these minimal stubs first:

  **Stub** `app/admin/courses/[courseId]/_components/PublishToggle.tsx`:
  ```typescript
  "use client";

  const PublishToggle = ({ courseId, isPublished, status }: { courseId: string; isPublished: boolean; status: string }) => {
    return <button disabled>Toggle</button>;
  };

  export default PublishToggle;
  ```

  **Stub** `app/admin/courses/[courseId]/_components/DeleteCourseDialog.tsx`:
  ```typescript
  "use client";

  const DeleteCourseDialog = ({ courseId, courseTitle }: { courseId: string; courseTitle: string }) => {
    return <button disabled>Delete</button>;
  };

  export default DeleteCourseDialog;
  ```

  These stubs will be replaced by their full implementations in T013 and T015.

---

- [X] T009 [US1] Create `app/admin/courses/[courseId]/page.tsx` — server component that fetches course data and renders the detail view with breadcrumbs and action bar

  **File**: `app/admin/courses/[courseId]/page.tsx` (NEW file)

  **Exact content**:

  ```typescript
  import adminGetCourse from "@/app/data/admin/admin-get-course";
  import { notFound } from "next/navigation";
  import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
  } from "@/components/ui/breadcrumb";
  import { Separator } from "@/components/ui/separator";
  import CourseDetailView from "./_components/CourseDetailView";
  import CourseActions from "./_components/CourseActions";

  type CourseDetailPageProps = {
    params: Promise<{ courseId: string }>;
  };

  const CourseDetailPage = async ({ params }: CourseDetailPageProps) => {
    const { courseId } = await params;
    const course = await adminGetCourse(courseId);

    if (!course) {
      notFound();
    }

    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin/courses">Courses</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{course.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {course.title}
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Manage course details, publish status, and content
              </p>
            </div>
            <CourseActions
              courseId={course.id}
              courseTitle={course.title}
              isPublished={course.isPublished}
              status={course.status}
            />
          </div>
        </div>

        <Separator />

        <CourseDetailView course={course} />
      </div>
    );
  };

  export default CourseDetailPage;
  ```

  **Key details**:
  - `params` is `Promise<{ courseId: string }>` — **must be awaited** in Next.js 16 (research R-01).
  - Calls `adminGetCourse(courseId)` — which internally calls `requireAdmin()`.
  - If course is `null`, calls `notFound()` from `next/navigation` (research R-07) which renders the nearest `not-found.tsx`.
  - `CourseActions` is a client component; passes only serializable primitive props (no objects/dates).
  - Breadcrumb pattern matches existing `create/page.tsx`.

---

- [X] T010 [P] [US1] Create `app/admin/courses/[courseId]/not-found.tsx` — custom not-found page for invalid course IDs

  **File**: `app/admin/courses/[courseId]/not-found.tsx` (NEW file)

  **Exact content**:

  ```typescript
  import Link from "next/link";
  import { buttonVariants } from "@/components/ui/button";
  import { FileQuestion } from "lucide-react";

  const CourseNotFound = () => {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] rounded-xl border-2 border-dashed border-border/50 bg-muted/30 p-8 text-center animate-in fade-in zoom-in duration-500">
        <div className="rounded-full bg-destructive/10 p-6 mb-4">
          <FileQuestion className="h-12 w-12 text-destructive" />
        </div>
        <h2 className="text-xl font-semibold">Course Not Found</h2>
        <p className="text-muted-foreground mt-2 max-w-sm">
          The course you&apos;re looking for doesn&apos;t exist or may have been
          deleted.
        </p>
        <Link
          href="/admin/courses"
          className={`${buttonVariants({ variant: "outline" })} mt-6`}
        >
          Back to Courses
        </Link>
      </div>
    );
  };

  export default CourseNotFound;
  ```

  **Key details**:
  - Matches the empty-state visual pattern from the existing `app/admin/courses/page.tsx`.
  - Provides a clear "Back to Courses" link.
  - Uses `animate-in fade-in zoom-in` matching existing styles.
  - This is a SERVER component (no `"use client"`).

**Checkpoint**: User Story 1 is complete. An admin can navigate to `/admin/courses/[courseId]` and see all course metadata. The not-found page handles invalid IDs. Edit/Delete/Publish buttons are visible (stubs) and will become functional with US2–US4.

---

## Phase 4: User Story 2 — Edit Course (Priority: P2)

**Goal**: Admin can navigate to `/admin/courses/[courseId]/edit`, see a form pre-populated with all current course data, modify fields, upload a new thumbnail (old one cleaned up from S3), and submit. Validation errors show inline. Slug conflicts show a clear error. On success, redirect to the detail page with a toast notification.

**Independent Test**: Create a course, navigate to `/admin/courses/[courseId]/edit`. Verify all fields are pre-populated. Change the title and price, submit. Verify updated values on the detail page. Submit with empty title — verify inline error. Change slug to an existing slug — verify conflict error.

### Implementation for User Story 2

- [X] T011 [US2] Create `app/admin/courses/[courseId]/edit/page.tsx` — client component with pre-populated edit form, mirroring the create form pattern

  **File**: `app/admin/courses/[courseId]/edit/page.tsx` (NEW file)

  **This is the most complex single file in the feature.** The pattern mirrors `app/admin/courses/create/page.tsx` exactly, with these differences:
  1. It's wrapped in a server component that fetches the course data, then passes it to a client form component.
  2. The form uses `updateCourse` action instead of `createCourse`.
  3. `defaultValues` are pre-populated from the fetched course.
  4. On success, redirects to `/admin/courses/[courseId]` (detail page) instead of `/admin/courses` (list).
  5. A hidden `courseId` field is included in the form data.

  **Exact content**:

  ```typescript
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
  ```

  **Note**: This server component page fetches the data and delegates rendering to a client component `EditCourseForm`. This follows the Next.js Server Components-first pattern while allowing `react-hook-form` in the client component.

---

- [X] T012 [US2] Create `app/admin/courses/[courseId]/edit/EditCourseForm.tsx` — the client-side edit form component with pre-populated values, validation, and thumbnail replacement

  **File**: `app/admin/courses/[courseId]/edit/EditCourseForm.tsx` (NEW file)

  **Exact content**:

  ```typescript
  "use client";

  import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
  } from "@/components/ui/breadcrumb";
  import { Button, buttonVariants } from "@/components/ui/button";
  import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card";
  import { Separator } from "@/components/ui/separator";
  import { ArrowLeft, Loader2, Save, SparkleIcon } from "lucide-react";
  import Link from "next/link";

  import { zodResolver } from "@hookform/resolvers/zod";
  import { useForm } from "react-hook-form";
  import {
    courseCategories,
    courseLevels,
    courseStatus,
    UpdateCourseSchema,
    UpdateCourseInput,
    updateCourseSchema,
  } from "@/lib/zodSchema";
  import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from "@/components/ui/form";
  import { Input } from "@/components/ui/input";
  import slugify from "slugify";
  import { Textarea } from "@/components/ui/textarea";
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
  import { RichTextEditor } from "@/components/rich-text-editor/editor";
  import Uploader from "@/components/file-uploader/Uploader";
  import { useTransition } from "react";
  import { updateCourse } from "../actions";
  import { tryCatch } from "@/hooks/try-catch";
  import { toast } from "sonner";
  import { useRouter } from "next/navigation";
  import { AdminCourseDetailType } from "@/app/data/admin/admin-get-course";

  type EditCourseFormProps = {
    course: AdminCourseDetailType;
  };

  const EditCourseForm = ({ course }: EditCourseFormProps) => {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const form = useForm<UpdateCourseInput, unknown, UpdateCourseSchema>({
      resolver: zodResolver(updateCourseSchema),
      defaultValues: {
        courseId: course.id,
        title: course.title,
        description: course.description,
        fileKey: course.fileKey,
        price: course.price,
        duration: course.duration,
        level: course.level,
        category: course.category,
        smallDescription: course.smallDescription,
        slug: course.slug,
        status: course.status,
      },
    });

    function onSubmit(values: UpdateCourseSchema) {
      startTransition(async () => {
        const { data: result, error } = await tryCatch(updateCourse(values));

        if (error) {
          toast.error(error.message);
          return;
        }

        if (result?.status === "success") {
          toast.success(result.message);
          router.push(`/admin/courses/${course.id}`);
        } else if (result?.status === "error") {
          toast.error(result.message);
        }
      });
    }

    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin/courses">Courses</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/admin/courses/${course.id}`}>
                  {course.title}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Edit</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Edit Course
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Update the details of &quot;{course.title}&quot;
              </p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Link
                href={`/admin/courses/${course.id}`}
                className={buttonVariants({
                  variant: "outline",
                  className: "flex-1 sm:flex-initial",
                })}
              >
                <ArrowLeft className="h-4 w-4" />
                Cancel
              </Link>
              <Button
                type="submit"
                form="course-edit-form"
                className="text-white flex-1 sm:flex-initial"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <Separator />

        <Card>
          <CardHeader>
            <CardTitle>Course Information</CardTitle>
            <CardDescription>
              Update the course details below. All fields are required.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                id="course-edit-form"
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Hidden courseId field */}
                <input type="hidden" {...form.register("courseId")} />

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter course title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-4 items-end">
                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>Slug</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter course slug" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    className="w-fit"
                    onClick={() => {
                      const title = form.getValues("title");
                      const slug = slugify(title, {
                        lower: true,
                        strict: true,
                      });
                      form.setValue("slug", slug, { shouldValidate: true });
                    }}
                  >
                    Generate Slug <SparkleIcon className="ml-1" size={16} />
                  </Button>
                </div>

                <FormField
                  control={form.control}
                  name="smallDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Small Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter course small description"
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <RichTextEditor
                          content={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fileKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thumbnail Image</FormLabel>
                      <FormControl>
                        <Uploader
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className={"w-full"}>
                              <SelectValue placeholder="Select Category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {courseCategories.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Level</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className={"w-full"}>
                              <SelectValue placeholder="Select Level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {courseLevels.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (hours)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter course duration"
                            type="number"
                            {...field}
                            value={Number(field.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price ($)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter course price"
                            type="number"
                            {...field}
                            value={Number(field.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className={"w-full"}>
                            <SelectValue placeholder="Select Status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {courseStatus.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    );
  };

  export default EditCourseForm;
  ```

  **Critical differences from create page** (`app/admin/courses/create/page.tsx`):
  1. **Imports**: `updateCourseSchema`, `UpdateCourseSchema`, `UpdateCourseInput` instead of create variants. `updateCourse` from `../actions` instead of `./actions`.
  2. **`useForm` generic**: `useForm<UpdateCourseInput, unknown, UpdateCourseSchema>` with `zodResolver(updateCourseSchema)`.
  3. **`defaultValues`**: Pre-populated from `course` prop. Includes `courseId: course.id`.
  4. **`onSubmit`**: Calls `updateCourse(values)` and redirects to `/admin/courses/${course.id}` (detail page), NOT `/admin/courses` (list).
  5. **`form.reset()` is NOT called** after success — the user navigates away.
  6. **Breadcrumbs**: 4 levels (Dashboard → Courses → [course title] → Edit).
  7. **Cancel link**: Goes to `/admin/courses/${course.id}` (detail page), not `/admin/courses`.
  8. **Form id**: `"course-edit-form"` instead of `"course-create-form"`.
  9. **Hidden `courseId` input**: `<input type="hidden" {...form.register("courseId")} />`.
  10. **Status dropdown includes "Archived"**: Already covered by `courseStatus` array.

  **Verification**: `pnpm lint` passes. Form renders with all fields pre-populated. Submitting with invalid data shows inline errors. Submitting valid data calls `updateCourse` and redirects.

**Checkpoint**: User Story 2 is complete. An admin can edit any course field and see changes reflected on the detail page.

---

## Phase 5: User Story 3 — Delete Course (Priority: P3)

**Goal**: Admin can delete a course from the detail page via a confirmation dialog. On confirmation, the course record is removed from the database, the S3 thumbnail is cleaned up, and the admin is redirected to the courses list with a success toast.

**Independent Test**: Create a course, navigate to its detail page, click Delete, confirm in the dialog, verify the course no longer appears in the list. Cancel the dialog and verify the course remains.

### Implementation for User Story 3

- [X] T013 [US3] Replace the stub `app/admin/courses/[courseId]/_components/DeleteCourseDialog.tsx` with the full implementation — client component with AlertDialog confirmation and `deleteCourse` server action call

  **File**: `app/admin/courses/[courseId]/_components/DeleteCourseDialog.tsx` (REPLACE stub)

  **Exact content**:

  ```typescript
  "use client";

  import { useTransition } from "react";
  import { useRouter } from "next/navigation";
  import { toast } from "sonner";
  import { tryCatch } from "@/hooks/try-catch";
  import { deleteCourse } from "../actions";
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
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog";
  import { Loader2, Trash2 } from "lucide-react";

  type DeleteCourseDialogProps = {
    courseId: string;
    courseTitle: string;
  };

  const DeleteCourseDialog = ({
    courseId,
    courseTitle,
  }: DeleteCourseDialogProps) => {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    function handleDelete() {
      startTransition(async () => {
        const { data: result, error } = await tryCatch(deleteCourse(courseId));

        if (error) {
          toast.error(error.message);
          return;
        }

        if (result?.status === "success") {
          toast.success(result.message);
          router.push("/admin/courses");
        } else if (result?.status === "error") {
          toast.error(result.message);
        }
      });
    }

    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" className="flex-1 sm:flex-initial">
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Course</AlertDialogTitle>
            <AlertDialogDescription>
              This action is permanent and cannot be undone. This will delete the
              course &quot;{courseTitle}&quot; and its thumbnail image from
              storage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Course"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };

  export default DeleteCourseDialog;
  ```

  **Key details**:
  - Uses shadcn `AlertDialog` (already in `components/ui/alert-dialog.tsx`).
  - `handleDelete` calls `deleteCourse(courseId)` via `useTransition` for pending state.
  - On success, redirects to `/admin/courses` (list page) with `router.push`.
  - Dialog description clearly warns: action is permanent, course data AND thumbnail will be deleted (per FR-007).
  - `AlertDialogAction` has destructive styling.
  - Both Cancel and Confirm buttons are disabled during `isPending`.

**Checkpoint**: User Story 3 is complete. Delete confirmation dialog works with S3 cleanup.

---

## Phase 6: User Story 4 — Publish / Unpublish Toggle (Priority: P4)

**Goal**: Admin can toggle a course between Published and Draft states from the detail page. A pending state indicator shows during the server round-trip. The toggle uses server-confirmed updates (not optimistic).

**Independent Test**: Create a Draft course, navigate to detail page, click Publish, verify status changes to "Published". Click Unpublish, verify status reverts to "Draft". Create an Archived course (via edit form), click Publish, verify it becomes "Published".

### Implementation for User Story 4

- [X] T014 [US4] Replace the stub `app/admin/courses/[courseId]/_components/PublishToggle.tsx` with the full implementation — client component with `useTransition` pending state and `togglePublish` server action call

  **File**: `app/admin/courses/[courseId]/_components/PublishToggle.tsx` (REPLACE stub)

  **Exact content**:

  ```typescript
  "use client";

  import { useTransition } from "react";
  import { toast } from "sonner";
  import { tryCatch } from "@/hooks/try-catch";
  import { togglePublish } from "../actions";
  import { Button } from "@/components/ui/button";
  import { Loader2, Globe, GlobeLock } from "lucide-react";

  type PublishToggleProps = {
    courseId: string;
    isPublished: boolean;
    status: string;
  };

  const PublishToggle = ({
    courseId,
    isPublished,
    status,
  }: PublishToggleProps) => {
    const [isPending, startTransition] = useTransition();

    function handleToggle() {
      startTransition(async () => {
        const { data: result, error } = await tryCatch(
          togglePublish(courseId),
        );

        if (error) {
          toast.error(error.message);
          return;
        }

        if (result?.status === "success") {
          toast.success(result.message);
        } else if (result?.status === "error") {
          toast.error(result.message);
        }
      });
    }

    const isCurrentlyPublished = status === "Published";

    return (
      <Button
        onClick={handleToggle}
        disabled={isPending}
        variant={isCurrentlyPublished ? "outline" : "default"}
        className={`flex-1 sm:flex-initial ${!isCurrentlyPublished ? "text-white" : ""}`}
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {isCurrentlyPublished ? "Unpublishing..." : "Publishing..."}
          </>
        ) : isCurrentlyPublished ? (
          <>
            <GlobeLock className="h-4 w-4" />
            Unpublish
          </>
        ) : (
          <>
            <Globe className="h-4 w-4" />
            Publish
          </>
        )}
      </Button>
    );
  };

  export default PublishToggle;
  ```

  **Key details**:
  - Uses `useTransition` for server-confirmed update with pending state (research R-04). NOT optimistic.
  - `isCurrentlyPublished` derived from `status === "Published"` (not from `isPublished` prop — they should be in sync but status is the source of truth).
  - While `isPending`: shows spinner + "Publishing..." or "Unpublishing..." text.
  - Published → shows "Unpublish" button with `outline` variant.
  - Draft/Archived → shows "Publish" button with `default` variant + white text.
  - No `router.push` needed — `revalidatePath` in the server action triggers a re-render of the detail page automatically.

**Checkpoint**: User Story 4 is complete. Publish/unpublish toggle works with pending state and server confirmation.

---

## Phase 7: User Story 5 — Courses List Refinement (Priority: P5)

**Goal**: The courses list page supports text search (title, 300ms debounce), filters (status, level, category), pagination (12 per page), and enhanced course cards with status/level/price badges. Filters are reflected in URL search params for shareability. A "Clear filters" action resets all criteria.

**Independent Test**: Create multiple courses with different statuses, levels, and categories. Use search to filter by title. Use dropdown filters. Combine search and filters. Share the URL — verify same filtered view. Create 13+ courses — verify pagination. Click "Clear filters" — verify reset. Filter to no results — verify empty state.

### Implementation for User Story 5

- [X] T015 [P] [US5] Modify `app/admin/courses/_components/adminCourseCard.tsx` to display status badge, level badge, price, and publication indicator

  **File**: `app/admin/courses/_components/adminCourseCard.tsx` (MODIFY existing file)

  **Replace the entire file content with**:

  ```typescript
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
  ```

  **Changes from existing card**:
  1. **New imports**: `Badge` from `@/components/ui/badge`, `DollarSign` and `Clock` from `lucide-react`.
  2. **Status badge overlay**: Positioned `absolute top-2 right-2` on the thumbnail. Uses `getStatusVariant()` for color.
  3. **"Live" badge**: Only shown when `course.isPublished` is true.
  4. **Metadata row**: Below the description. Shows level badge, category badge, price, and duration.
  5. **`overflow-hidden`** added to Card className for clean badge overlay positioning.
  6. **`pt-4`** added to `CardContent` for spacing after thumbnail.
  7. The `AdminCourseType` now includes `isPublished` (added in T005).

---

- [X] T016 [P] [US5] Create `app/admin/courses/_components/CourseFilters.tsx` — client component with debounced search input and status/level/category filter dropdowns that update URL search params

  **File**: `app/admin/courses/_components/CourseFilters.tsx` (NEW file)

  **Exact content**:

  ```typescript
  "use client";

  import { useState, useEffect, useCallback } from "react";
  import { useRouter, useSearchParams, usePathname } from "next/navigation";
  import { Input } from "@/components/ui/input";
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
  import { Button } from "@/components/ui/button";
  import { Search, X } from "lucide-react";
  import { courseCategories, courseLevels, courseStatus } from "@/lib/zodSchema";

  const CourseFilters = () => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Initialize local state from URL search params
    const [searchTerm, setSearchTerm] = useState(
      searchParams.get("search") ?? "",
    );

    // Create a new URLSearchParams from the current ones
    const createQueryString = useCallback(
      (updates: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString());

        for (const [key, value] of Object.entries(updates)) {
          if (value === null || value === "") {
            params.delete(key);
          } else {
            params.set(key, value);
          }
        }

        // Reset to page 1 when filters change
        params.delete("page");

        return params.toString();
      },
      [searchParams],
    );

    // Debounced search: 300ms delay (research R-06)
    useEffect(() => {
      const timer = setTimeout(() => {
        const currentSearch = searchParams.get("search") ?? "";
        if (searchTerm !== currentSearch) {
          const queryString = createQueryString({ search: searchTerm || null });
          router.replace(
            queryString ? `${pathname}?${queryString}` : pathname,
          );
        }
      }, 300);

      return () => clearTimeout(timer);
    }, [searchTerm, searchParams, createQueryString, pathname, router]);

    function handleFilterChange(key: string, value: string) {
      const queryString = createQueryString({
        [key]: value === "all" ? null : value,
      });
      router.replace(queryString ? `${pathname}?${queryString}` : pathname);
    }

    function handleClearFilters() {
      setSearchTerm("");
      router.replace(pathname);
    }

    const hasActiveFilters =
      searchParams.get("search") ||
      searchParams.get("status") ||
      searchParams.get("level") ||
      searchParams.get("category");

    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search courses by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Status Filter */}
          <Select
            value={searchParams.get("status") ?? "all"}
            onValueChange={(value) => handleFilterChange("status", value)}
          >
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {courseStatus.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Level Filter */}
          <Select
            value={searchParams.get("level") ?? "all"}
            onValueChange={(value) => handleFilterChange("level", value)}
          >
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              {courseLevels.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Category Filter */}
          <Select
            value={searchParams.get("category") ?? "all"}
            onValueChange={(value) => handleFilterChange("category", value)}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {courseCategories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
              Clear filters
            </Button>
          </div>
        )}
      </div>
    );
  };

  export default CourseFilters;
  ```

  **Key details**:
  - `"use client"` — requires `useState`, `useEffect`, `useRouter`, `useSearchParams`, `usePathname`.
  - **Debounced search**: Local `searchTerm` state + `useEffect` with 300ms `setTimeout` + cleanup via `clearTimeout` (research R-06).
  - **`router.replace`**: NOT `router.push` — avoids cluttering browser history.
  - **Resets `page` to 1**: `params.delete("page")` whenever any filter changes.
  - **"all" sentinel value**: Dropdowns use `"all"` to represent "no filter". When `"all"` is selected, the param is deleted from the URL.
  - **`hasActiveFilters`**: Shows "Clear filters" button only when at least one filter is active.
  - **`handleClearFilters`**: Resets `searchTerm` to `""` and replaces URL with just the pathname (no params).

---

- [X] T017 [P] [US5] Create `app/admin/courses/_components/CoursePagination.tsx` — server component with pagination controls that link to pages via URL search params

  **File**: `app/admin/courses/_components/CoursePagination.tsx` (NEW file)

  **Exact content**:

  ```typescript
  import Link from "next/link";
  import { buttonVariants } from "@/components/ui/button";
  import { ChevronLeft, ChevronRight } from "lucide-react";

  type CoursePaginationProps = {
    currentPage: number;
    totalPages: number;
    searchParams: Record<string, string | undefined>;
  };

  function buildPageUrl(
    page: number,
    searchParams: Record<string, string | undefined>,
  ): string {
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(searchParams)) {
      if (value && key !== "page") {
        params.set(key, value);
      }
    }

    if (page > 1) {
      params.set("page", String(page));
    }

    const queryString = params.toString();
    return queryString ? `/admin/courses?${queryString}` : "/admin/courses";
  }

  const CoursePagination = ({
    currentPage,
    totalPages,
    searchParams,
  }: CoursePaginationProps) => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center gap-2">
        {/* Previous Page */}
        {currentPage > 1 ? (
          <Link
            href={buildPageUrl(currentPage - 1, searchParams)}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Link>
        ) : (
          <span
            className={`${buttonVariants({ variant: "outline", size: "sm" })} pointer-events-none opacity-50`}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </span>
        )}

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <Link
              key={page}
              href={buildPageUrl(page, searchParams)}
              className={buttonVariants({
                variant: page === currentPage ? "default" : "outline",
                size: "sm",
                className:
                  page === currentPage ? "text-white pointer-events-none" : "",
              })}
            >
              {page}
            </Link>
          ))}
        </div>

        {/* Next Page */}
        {currentPage < totalPages ? (
          <Link
            href={buildPageUrl(currentPage + 1, searchParams)}
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <span
            className={`${buttonVariants({ variant: "outline", size: "sm" })} pointer-events-none opacity-50`}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </span>
        )}
      </div>
    );
  };

  export default CoursePagination;
  ```

  **Key details**:
  - This is a SERVER component (no `"use client"`). Pagination links are plain `<Link>` components (no client JS).
  - `buildPageUrl` preserves existing search/filter params while changing the `page` param.
  - If `page` is 1, the `page` param is omitted from the URL (cleaner URLs).
  - Returns `null` when `totalPages <= 1` (no pagination needed).
  - Previous/Next buttons are disabled (via `pointer-events-none opacity-50`) when at the boundary.
  - Current page number is highlighted with `variant: "default"` and `pointer-events-none`.

---

- [X] T018 [US5] Rewrite `app/admin/courses/page.tsx` to accept `searchParams`, pass them to `adminGetCourses`, render `CourseFilters`, the course grid (or appropriate empty states), and `CoursePagination`

  **File**: `app/admin/courses/page.tsx` (REPLACE entire file)

  **Exact content**:

  ```typescript
  import adminGetCourses from "@/app/data/admin/admin-get-courses";
  import { buttonVariants } from "@/components/ui/button";
  import { Plus, GraduationCap, SearchX } from "lucide-react";
  import Link from "next/link";
  import AdminCourseCard from "./_components/adminCourseCard";
  import CourseFilters from "./_components/CourseFilters";
  import CoursePagination from "./_components/CoursePagination";

  type CoursesPageProps = {
    searchParams: Promise<{
      search?: string;
      status?: string;
      level?: string;
      category?: string;
      page?: string;
    }>;
  };

  const CoursesPage = async ({ searchParams }: CoursesPageProps) => {
    const params = await searchParams;

    const { courses, totalCount, totalPages, currentPage } =
      await adminGetCourses({
        search: params.search,
        status: params.status,
        level: params.level,
        category: params.category,
        page: params.page ? parseInt(params.page, 10) : undefined,
      });

    const hasActiveFilters =
      params.search || params.status || params.level || params.category;

    return (
      <div className="flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              Courses
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your educational content and student learning paths
            </p>
          </div>
          <Link
            href={"/admin/courses/create"}
            className={`${buttonVariants({
              variant: "default",
              size: "lg",
            })} flex items-center gap-2 text-white shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all`}
          >
            <Plus className="h-5 w-5" />
            Create New Course
          </Link>
        </div>

        {/* Filters */}
        <CourseFilters />

        {/* Course Grid or Empty State */}
        {courses.length === 0 ? (
          hasActiveFilters ? (
            /* Filtered empty state — no courses match criteria */
            <div className="flex flex-col items-center justify-center min-h-[400px] rounded-xl border-2 border-dashed border-border/50 bg-muted/30 p-8 text-center animate-in fade-in zoom-in duration-500">
              <div className="rounded-full bg-muted p-6 mb-4">
                <SearchX className="h-12 w-12 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold">No matching courses</h2>
              <p className="text-muted-foreground mt-2 max-w-sm">
                No courses match your current search and filter criteria. Try
                adjusting your filters or clearing them.
              </p>
            </div>
          ) : (
            /* Generic empty state — no courses exist at all */
            <div className="flex flex-col items-center justify-center min-h-[400px] rounded-xl border-2 border-dashed border-border/50 bg-muted/30 p-8 text-center animate-in fade-in zoom-in duration-500">
              <div className="rounded-full bg-primary/10 p-6 mb-4">
                <GraduationCap className="h-12 w-12 text-primary" />
              </div>
              <h2 className="text-xl font-semibold">No courses found</h2>
              <p className="text-muted-foreground mt-2 max-w-sm">
                You haven&apos;t created any courses yet. Start by building your
                first curriculum to share with your students.
              </p>
              <Link
                href="/admin/courses/create"
                className={`${buttonVariants({ variant: "outline" })} mt-6`}
              >
                Create Your First Course
              </Link>
            </div>
          )
        ) : (
          <>
            {/* Results count */}
            <p className="text-sm text-muted-foreground">
              Showing {courses.length} of {totalCount} course
              {totalCount !== 1 ? "s" : ""}
            </p>

            {/* Course Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {courses.map((course) => (
                <AdminCourseCard key={course.id} course={course} />
              ))}
            </div>

            {/* Pagination */}
            <CoursePagination
              currentPage={currentPage}
              totalPages={totalPages}
              searchParams={{
                search: params.search,
                status: params.status,
                level: params.level,
                category: params.category,
              }}
            />
          </>
        )}
      </div>
    );
  };

  export default CoursesPage;
  ```

  **Critical changes from existing file**:
  1. **`searchParams` prop**: `Promise<{...}>` — must be awaited (Next.js 16). Type includes `search`, `status`, `level`, `category`, `page`.
  2. **Data call changed**: `adminGetCourses(params)` instead of `adminGetCourses()`. Passes the URL params. `page` is parsed from string to number with `parseInt`.
  3. **Destructured return**: `{ courses, totalCount, totalPages, currentPage }` instead of flat array.
  4. **`CourseFilters` component**: Rendered between the header and the grid.
  5. **Two empty states**: `hasActiveFilters` determines which empty state to show — "No matching courses" (with `SearchX` icon) for filtered results vs. "No courses found" (with `GraduationCap` icon) for zero courses.
  6. **Results count**: `Showing X of Y courses` text above the grid.
  7. **Grid**: Added `xl:grid-cols-3` for wider screens and `gap-4`.
  8. **`CoursePagination`**: Below the grid, receives `currentPage`, `totalPages`, and `searchParams` (without `page`).

  **Verification**: `pnpm lint` and `pnpm build` must pass. Navigate to `/admin/courses` — filters, search, pagination, and empty states all work correctly.

**Checkpoint**: User Story 5 is complete. The courses list now supports search, filters, pagination, and enhanced course cards.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final verification, cleanup, and documentation updates

- [X] T019 [P] Verify that all client components have the `"use client"` directive and all server components do NOT. Verify the exact list:
  - **Client** (`"use client"`): `CourseFilters.tsx`, `CourseActions.tsx`, `DeleteCourseDialog.tsx`, `PublishToggle.tsx`, `EditCourseForm.tsx`
  - **Server** (no directive): `CourseDetailView.tsx`, `CoursePagination.tsx`, `[courseId]/page.tsx`, `[courseId]/edit/page.tsx`, `[courseId]/not-found.tsx`, `courses/page.tsx`

- [X] T020 [P] Remove the stub files for `PublishToggle.tsx` and `DeleteCourseDialog.tsx` if they were created in T008 and have already been replaced by full implementations in T013 and T014. Verify no duplicate component files exist.

- [X] T021 Run `pnpm lint` and fix any linting errors across all new and modified files. Specifically check:
  - `lib/zodSchema.ts`
  - `app/data/admin/admin-get-courses.ts`
  - `app/data/admin/admin-get-course.ts`
  - `app/admin/courses/[courseId]/actions.ts`
  - `app/admin/courses/[courseId]/page.tsx`
  - `app/admin/courses/[courseId]/not-found.tsx`
  - `app/admin/courses/[courseId]/_components/CourseDetailView.tsx`
  - `app/admin/courses/[courseId]/_components/CourseActions.tsx`
  - `app/admin/courses/[courseId]/_components/DeleteCourseDialog.tsx`
  - `app/admin/courses/[courseId]/_components/PublishToggle.tsx`
  - `app/admin/courses/[courseId]/edit/page.tsx`
  - `app/admin/courses/[courseId]/edit/EditCourseForm.tsx`
  - `app/admin/courses/_components/adminCourseCard.tsx`
  - `app/admin/courses/_components/CourseFilters.tsx`
  - `app/admin/courses/_components/CoursePagination.tsx`
  - `app/admin/courses/page.tsx`

- [X] T022 Run `pnpm build` and fix any build errors. Ensure zero TypeScript errors and zero Next.js build warnings related to this feature.

- [X] T023 Execute the full quickstart verification checklist from `specs/007-course-management/quickstart.md`:
  1. Course detail: Navigate to `/admin/courses/[id]` → see all metadata
  2. Edit: Click Edit → modify fields → submit → verify changes on detail page
  3. Edit validation: Submit empty title → see inline error
  4. Edit slug conflict: Change slug to existing one → see error
  5. Edit thumbnail: Upload new image → verify old S3 object removed
  6. Delete: Click Delete → confirm → verify course removed from list
  7. Delete cancel: Click Delete → cancel → verify course unchanged
  8. Publish: Toggle publish on draft → verify Published status
  9. Unpublish: Toggle unpublish on published → verify Draft status
  10. Search: Type in search bar → verify 300ms debounce → results filter
  11. Filters: Select status/level/category → verify list updates
  12. Combined: Search + filter → verify AND logic
  13. Pagination: With 13+ courses → verify pagination controls
  14. URL sharing: Copy filtered URL → open in new tab → same view
  15. Clear filters: Click clear → verify reset
  16. Empty state: Filter to no results → see empty state message
  17. Not found: Navigate to `/admin/courses/invalid-id` → see not-found
  18. Unauthorized: Access `/admin/courses/[id]` without admin → redirect

- [X] T024 [P] Update `Phases.md` to mark Phase 7 as complete (change `▶ Next` to `✅ Done`), and add a summary of what was delivered: course detail view, edit, delete, publish/unpublish toggle, courses list with search/filter/pagination.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phases 3–7)**: All depend on Foundational phase completion
  - US1 (Phase 3) can start after Phase 2 — no dependencies on other stories
  - US2 (Phase 4) can start after Phase 2 — uses detail page link but independently testable
  - US3 (Phase 5) can start after Phase 2 — uses detail page but independently testable
  - US4 (Phase 6) can start after Phase 2 — uses detail page but independently testable
  - US5 (Phase 7) can start after Phase 2 — modifies courses list independently
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (Course Detail View)**: Foundation only. No cross-story dependencies. 🎯 MVP
- **US2 (Edit Course)**: Foundation only. Links from detail page but edit page is independently accessible via URL.
- **US3 (Delete Course)**: Foundation only. Dialog integrated in detail page action bar but the `deleteCourse` server action works independently.
- **US4 (Publish/Unpublish)**: Foundation only. Toggle integrated in detail page action bar but the `togglePublish` server action works independently.
- **US5 (Courses List)**: Foundation only. Modifies the list page and card — does not depend on any detail page components.

### Within Each User Story

- Data helpers (T004, T005) before pages that consume them
- Server actions (T006) before client components that call them
- Server components before client components that compose them
- Page components last (they compose everything)

### Parallel Opportunities

- **Phase 2**: T003, T004 can run in parallel (different files). T005 depends on T003 (`COURSES_PAGE_SIZE` import). T006 depends on T003 (`updateCourseSchema` import).
- **Phase 3 (US1)**: T007 and T010 can run in parallel. T008 depends on stub creation. T009 depends on T007, T008.
- **Phase 4 (US2)**: T011 depends on T004 (data helper). T012 depends on T006 (server action) and T011 (page wrapper).
- **Phase 5 (US3)**: T013 depends on T006 (server action).
- **Phase 6 (US4)**: T014 depends on T006 (server action).
- **Phase 7 (US5)**: T015, T016, T017 can all run in parallel (different files). T018 depends on T005 (data helper), T015, T016, T017.
- **Cross-story**: US2, US3, US4, US5 can all run in parallel with each other after Phase 2.

---

## Parallel Example: Phase 2 (Foundation)

```text
# Run in parallel (different files, no interdependency):
T003: Add updateCourseSchema to lib/zodSchema.ts
T004: Create admin-get-course.ts

# Then sequentially (depends on T003):
T005: Enhance admin-get-courses.ts (imports COURSES_PAGE_SIZE)
T006: Create [courseId]/actions.ts (imports updateCourseSchema)
```

## Parallel Example: User Story 5 (List Refinement)

```text
# Run in parallel (different files):
T015: Modify adminCourseCard.tsx (badges)
T016: Create CourseFilters.tsx (search + filters)
T017: Create CoursePagination.tsx (pagination controls)

# Then (depends on T015, T016, T017):
T018: Rewrite courses/page.tsx (composes all three)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T002)
2. Complete Phase 2: Foundational (T003–T006) — **CRITICAL, blocks all stories**
3. Complete Phase 3: User Story 1 (T007–T010)
4. **STOP and VALIDATE**: Course detail page renders all metadata, not-found works, auth redirects work
5. Deploy/demo if ready — admin can now view course details

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. **US1** → Test detail page independently → **MVP complete!**
3. **US2** → Test edit form independently → Courses are now editable
4. **US3** → Test delete dialog independently → Courses can be removed
5. **US4** → Test publish toggle independently → Content lifecycle management
6. **US5** → Test list refinement → Efficient course management at scale
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers after Phase 2:
- Developer A: US1 (detail view) → US2 (edit — benefits from detail page knowledge)
- Developer B: US3 (delete) + US4 (publish) — both small, same actions.ts file already created
- Developer C: US5 (list refinement) — fully independent of detail page work

---

## Summary

| Metric | Value |
|--------|-------|
| **Total tasks** | 24 |
| **Setup tasks** | 2 (T001–T002) |
| **Foundational tasks** | 4 (T003–T006) |
| **US1 tasks** | 4 (T007–T010) |
| **US2 tasks** | 2 (T011–T012) |
| **US3 tasks** | 1 (T013) |
| **US4 tasks** | 1 (T014) |
| **US5 tasks** | 4 (T015–T018) |
| **Polish tasks** | 6 (T019–T024) |
| **Parallel opportunities** | 12 tasks marked [P] |
| **New files** | 12 |
| **Modified files** | 3 (`zodSchema.ts`, `admin-get-courses.ts`, `adminCourseCard.tsx`, `page.tsx`) |
| **Suggested MVP** | Phases 1–3 (US1: Course Detail View — 10 tasks) |

---

## Notes

- `[P]` tasks = different files, no dependencies on incomplete tasks
- Story label maps task to specific user story for traceability
- Each user story is independently completable and verifiable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- The `CourseActions.tsx` (T008) initially uses stubs for `PublishToggle` and `DeleteCourseDialog` — these are replaced by full implementations in T013 and T014
- No Prisma migration needed — the Course model already has all required fields
- No new environment variables needed
- All three Server Actions share the same Arcjet config (5/min + bot detection) matching the existing `createCourse` pattern

