# Quickstart: Course Management — Admin CRUD

**Feature**: 007-course-management | **Branch**: `display-courses` | **Date**: 2026-04-15

## Prerequisites

- Node.js 20+ with `pnpm` package manager
- PostgreSQL database (Neon) — connection string in `.env`
- S3-compatible storage (R2/MinIO) — credentials in `.env`
- All environment variables from `lib/env.ts` configured

## Setup

```bash
# 1. Switch to feature branch
git checkout display-courses

# 2. Install dependencies
pnpm install

# 3. Generate Prisma client (no migration needed — schema unchanged)
pnpm prisma generate

# 4. Start dev server
pnpm dev
```

## Key Files to Understand Before Implementation

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Course model definition — no changes needed |
| `lib/zodSchema.ts` | Existing `createCourseSchema` — will be extended with `updateCourseSchema` |
| `lib/types.ts` | `ApiResponse` type used by all Server Actions |
| `app/data/admin/require-admin.ts` | `requireAdmin()` and `getAdmin()` auth guards |
| `app/data/admin/admin-get-courses.ts` | Existing course list fetcher — will be enhanced |
| `app/admin/courses/create/actions.ts` | Reference pattern for Server Actions (Arcjet + Zod + Prisma) |
| `app/admin/courses/create/page.tsx` | Reference pattern for form pages (react-hook-form + useTransition) |
| `app/admin/courses/_components/adminCourseCard.tsx` | Existing card — will be enhanced with badges |
| `app/api/s3/delete/route.ts` | Existing S3 delete route — reused for thumbnail cleanup |
| `lib/S3Client.ts` | S3 client config (server-only) |
| `lib/arcjet.ts` | Shared Arcjet base instance |

## Implementation Order (recommended)

1. **Zod schema** — Add `updateCourseSchema` to `lib/zodSchema.ts`
2. **Data helpers** — Create `admin-get-course.ts`, enhance `admin-get-courses.ts`
3. **Server Actions** — Create `[courseId]/actions.ts` with update, delete, togglePublish
4. **Course detail page** — `[courseId]/page.tsx` + `_components/`
5. **Edit course page** — `[courseId]/edit/page.tsx` (mirrors create form)
6. **Delete dialog** — `DeleteCourseDialog.tsx` client component
7. **Publish toggle** — `PublishToggle.tsx` client component
8. **Enhanced course card** — Update `adminCourseCard.tsx` with badges
9. **Courses list page** — Update `page.tsx` with filters, search, pagination
10. **Course filters** — `CourseFilters.tsx` client component
11. **Pagination** — `CoursePagination.tsx` component

## Verification Checklist

```bash
# Static checks (must pass)
pnpm lint
pnpm build

# Manual verification flows
# 1. Course detail: Navigate to /admin/courses/[id] → see all metadata
# 2. Edit: Click Edit → modify fields → submit → verify changes on detail page
# 3. Edit validation: Submit empty title → see inline error
# 4. Edit slug conflict: Change slug to existing one → see error
# 5. Edit thumbnail: Upload new image → verify old S3 object removed
# 6. Delete: Click Delete → confirm → verify course removed from list
# 7. Delete cancel: Click Delete → cancel → verify course unchanged
# 8. Publish: Toggle publish on draft → verify Published status
# 9. Unpublish: Toggle unpublish on published → verify Draft status
# 10. Search: Type in search bar → verify 300ms debounce → results filter
# 11. Filters: Select status/level/category → verify list updates
# 12. Combined: Search + filter → verify AND logic
# 13. Pagination: With 13+ courses → verify pagination controls
# 14. URL sharing: Copy filtered URL → open in new tab → same view
# 15. Clear filters: Click clear → verify reset
# 16. Empty state: Filter to no results → see empty state message
# 17. Not found: Navigate to /admin/courses/invalid-id → see not-found
# 18. Unauthorized: Access /admin/courses/[id] without admin → redirect
```

## Key Patterns to Follow

### Server Action Pattern (from `createCourse`)

```typescript
"use server";
// 1. requireAdmin()
// 2. Arcjet protect (fingerprint: admin.id)
// 3. Zod safeParse
// 4. Prisma operation
// 5. revalidatePath
// 6. Return ApiResponse
```

### Form Page Pattern (from create/page.tsx)

```typescript
"use client";
// 1. useForm with zodResolver
// 2. useTransition for pending state
// 3. useRouter for redirect after success
// 4. tryCatch wrapper around Server Action call
// 5. toast.success/error for notifications
```

### Data Helper Pattern (from admin-get-courses.ts)

```typescript
// 1. requireAdmin() at top
// 2. Prisma query with select
// 3. S3 signed URL generation
// 4. Return typed result
```

## Environment Variables Required

No new environment variables. All required vars are already defined in `lib/env.ts`:
- `DATABASE_URL` — PostgreSQL connection
- `BETTER_AUTH_*` — Authentication
- `ARCJET_KEY` — Rate limiting
- `AWS_*` + `NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES` — S3 storage

