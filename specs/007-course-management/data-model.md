# Data Model: Course Management — Admin CRUD

**Feature**: 007-course-management | **Date**: 2026-04-15 | **Phase**: 1 — Design & Contracts

## Entities

### Course (existing — no schema migration required)

The `Course` model already exists in `prisma/schema.prisma` and contains all fields needed for this feature. No new fields, relations, or migrations are required.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| `id` | `String` | `@id @default(uuid())` | Primary key, used in URL routes |
| `title` | `String` | Required | Min 5, max 100 chars (Zod) |
| `description` | `String` | Required | Rich text HTML from Tiptap. Min 10, max 10,000 chars (Zod) |
| `smallDescription` | `String` | Required | Plain text. Min 3, max 500 chars (Zod) |
| `fileKey` | `String` | Required | S3 object key for thumbnail image |
| `price` | `Float` | Required | Min 1 (Zod) |
| `duration` | `Float` | Required | Hours. Min 1, max 500 (Zod) |
| `level` | `CourseLevel` enum | `@default(Beginner)` | Beginner, Intermediate, Advanced |
| `category` | `String` | Required | One of `courseCategories` values (Zod enum) |
| `slug` | `String` | `@unique` | URL-safe identifier. Min 3 chars (Zod). Uniqueness enforced at DB level |
| `isPublished` | `Boolean` | `@default(false)` | Derived from status: true when Published, false otherwise |
| `status` | `CourseStatus` enum | `@default(Draft)` | Draft, Published, Archived |
| `createdAt` | `DateTime` | `@default(now())` | Auto-set on creation |
| `updatedAt` | `DateTime` | `@updatedAt` | Auto-updated on every write |
| `userId` | `String` | Required, FK → User.id | Admin who created the course |

**Indexes**: `@@index([userId])`, `@@map("course")`
**Relation**: `User` (many-to-one via `userId`, cascade delete)

### User (existing — read-only for this feature)

Only the `id`, `name`, and `role` fields are relevant. Admin identity is obtained via `requireAdmin()` / `getAdmin()` from Better Auth sessions. No modifications to the User model.

## Enums (existing)

```prisma
enum CourseLevel {
  Beginner
  Intermediate
  Advanced
}

enum CourseStatus {
  Draft
  Published
  Archived
}
```

## Validation Schemas

### createCourseSchema (existing — `lib/zodSchema.ts`)

Used for the create form. All fields required. Already in production.

### updateCourseSchema (new — `lib/zodSchema.ts`)

Extends `createCourseSchema` with a required `courseId` field for identifying the record to update.

```typescript
export const updateCourseSchema = createCourseSchema.extend({
  courseId: z.string().uuid({ message: "Valid course ID is required" }),
});

export type UpdateCourseSchema = z.infer<typeof updateCourseSchema>;
export type UpdateCourseInput = z.input<typeof updateCourseSchema>;
```

**Rationale**: Full replacement semantics — all fields required on every submit, matching the create form pattern. The spec clarification explicitly chose this over partial updates.

## State Transitions

### Course Publication State Machine

```
┌─────────┐   Publish Toggle    ┌───────────┐
│  Draft   │ ──────────────────► │ Published │
│          │ ◄────────────────── │           │
└─────────┘   Unpublish Toggle  └───────────┘
     ▲                                │
     │                                │
     │ Edit form (status dropdown)    │ Edit form (status dropdown)
     │                                │
     ▼                                ▼
┌──────────┐                    ┌──────────┐
│ Archived │ ───────────────────│ Archived │
│          │  Publish Toggle    │          │
│          │ ──────────────────►│→Published│
└──────────┘                    └──────────┘
```

**Rules**:
1. **Publish toggle** (detail page): Draft → Published (`isPublished: true`, `status: "Published"`) or Published → Draft (`isPublished: false`, `status: "Draft"`). Archived → Published when toggled.
2. **Edit form status dropdown**: Can set any of Draft, Published, Archived. `isPublished` is derived: `true` only when `status === "Published"`, `false` otherwise.
3. **No direct Archived toggle**: Archived is only reachable via the edit form's status dropdown.

### isPublished Derivation Rule

`isPublished` is always derived from `status` during writes:
- `status === "Published"` → `isPublished = true`
- `status === "Draft"` or `status === "Archived"` → `isPublished = false`

This ensures the two fields are never out of sync. The derivation happens in Server Actions before the Prisma write.

## Query Patterns

### List Query (enhanced `adminGetCourses`)

```
Input: { search?, status?, level?, category?, page? }
Where:
  - title CONTAINS search (case-insensitive) — if search provided
  - status EQUALS status — if status filter provided
  - level EQUALS level — if level filter provided
  - category EQUALS category — if category filter provided
Order: createdAt DESC
Pagination: skip = (page - 1) * 12, take = 12
Returns: { courses: Course[], totalCount: number, totalPages: number }
```

### Detail Query (new `adminGetCourse`)

```
Input: courseId (string)
Where: id EQUALS courseId
Select: all fields
Returns: Course with signed S3 thumbnail URL, or null if not found
```

## Cache / Revalidation Strategy

| Mutation | Revalidation |
|----------|-------------|
| `updateCourse` | `revalidatePath("/admin/courses")` + `revalidatePath("/admin/courses/[courseId]")` |
| `deleteCourse` | `revalidatePath("/admin/courses")` |
| `togglePublish` | `revalidatePath("/admin/courses")` + `revalidatePath("/admin/courses/[courseId]")` |

No tag-based revalidation or ISR changes needed (per spec assumptions).

## Failure Modes

| Scenario | Handling |
|----------|----------|
| Slug uniqueness conflict on update | Catch Prisma `P2002` error → return `"A course with this slug already exists"` |
| Course not found (detail/edit/delete) | Return null from data helper → `notFound()` in page; return error from Server Action |
| S3 delete failure during course deletion | Log error, return success (course record already deleted) |
| S3 delete failure during thumbnail replacement | Log error, proceed with course update (orphaned object logged) |
| Zod validation failure | Return structured error message listing all failing fields |
| Arcjet rate limit exceeded | Return `"Too many requests. Please try again in a minute."` |
| Arcjet bot detection triggered | Return `"Access denied. Security rule triggered."` |
| Concurrent edit (last-write-wins) | No conflict detection; later write overwrites earlier |
| Stale delete (course already deleted) | Prisma returns RecordNotFound → return not-found error |

