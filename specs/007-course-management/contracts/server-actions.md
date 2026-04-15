# Server Action Contracts: Course Management — Admin CRUD

**Feature**: 007-course-management | **Date**: 2026-04-15 | **Phase**: 1

All Server Actions are defined in `app/admin/courses/[courseId]/actions.ts` with `"use server"` directive.

---

## updateCourse

**Purpose**: Update all fields of an existing course (full replacement).

**File**: `app/admin/courses/[courseId]/actions.ts`

### Signature

```typescript
export async function updateCourse(data: UpdateCourseSchema): Promise<ApiResponse>
```

### Input

| Field | Type | Validation | Required |
|-------|------|-----------|----------|
| `courseId` | `string` | UUID format | Yes |
| `title` | `string` | 5–100 chars | Yes |
| `description` | `string` | 10–10,000 chars (HTML) | Yes |
| `smallDescription` | `string` | 3–500 chars | Yes |
| `fileKey` | `string` | Non-empty | Yes |
| `price` | `number` | ≥ 1 (coerced) | Yes |
| `duration` | `number` | 1–500 (coerced) | Yes |
| `level` | `"Beginner" \| "Intermediate" \| "Advanced"` | Enum | Yes |
| `category` | `string` | One of `courseCategories` | Yes |
| `slug` | `string` | ≥ 3 chars | Yes |
| `status` | `"Draft" \| "Published" \| "Archived"` | Enum | Yes |

### Output

```typescript
{ status: "success", message: "Course updated successfully" }
// or
{ status: "error", message: "<specific error>" }
```

### Behavior

1. `requireAdmin()` — redirect if not admin
2. Arcjet `protect()` — rate limit (5/min) + bot detection
3. Zod validate with `updateCourseSchema.safeParse(data)`
4. Fetch existing course to compare `fileKey`
5. `prisma.course.update()` with `isPublished` derived from `status`
6. If `fileKey` changed, call `/api/s3/delete` with old `fileKey` (fire-and-forget, log failure)
7. `revalidatePath("/admin/courses")` + `revalidatePath("/admin/courses/${courseId}")`
8. Return success

### Error Cases

| Condition | Response |
|-----------|----------|
| Not admin | `{ status: "error", message: "Unauthorized" }` |
| Rate limited | `{ status: "error", message: "Too many requests. Please try again in a minute." }` |
| Bot detected | `{ status: "error", message: "Access denied. Security rule triggered." }` |
| Validation failed | `{ status: "error", message: "Validation failed: <field errors>" }` |
| Slug taken (P2002) | `{ status: "error", message: "A course with this slug already exists" }` |
| Course not found | `{ status: "error", message: "Course not found" }` |
| Unexpected error | `{ status: "error", message: "<error.message or generic>" }` |

---

## deleteCourse

**Purpose**: Permanently delete a course record and clean up its S3 thumbnail.

**File**: `app/admin/courses/[courseId]/actions.ts`

### Signature

```typescript
export async function deleteCourse(courseId: string): Promise<ApiResponse>
```

### Input

| Field | Type | Validation | Required |
|-------|------|-----------|----------|
| `courseId` | `string` | UUID format (validated inline) | Yes |

### Output

```typescript
{ status: "success", message: "Course deleted successfully" }
// or
{ status: "error", message: "<specific error>" }
```

### Behavior

1. `requireAdmin()` — redirect if not admin
2. Arcjet `protect()` — rate limit (5/min) + bot detection
3. Validate `courseId` is a valid UUID
4. Fetch course to get `fileKey` (return error if not found)
5. `prisma.course.delete({ where: { id: courseId } })`
6. Call `/api/s3/delete` with `fileKey` to clean up thumbnail (log failure, do not block)
7. `revalidatePath("/admin/courses")`
8. Return success

### Error Cases

| Condition | Response |
|-----------|----------|
| Not admin | `{ status: "error", message: "Unauthorized" }` |
| Rate limited | `{ status: "error", message: "Too many requests. Please try again in a minute." }` |
| Bot detected | `{ status: "error", message: "Access denied. Security rule triggered." }` |
| Invalid courseId | `{ status: "error", message: "Invalid course ID" }` |
| Course not found | `{ status: "error", message: "Course not found" }` |
| Prisma delete error | `{ status: "error", message: "Failed to delete course" }` |

---

## togglePublish

**Purpose**: Toggle a course between Published and Draft states (or Archived → Published).

**File**: `app/admin/courses/[courseId]/actions.ts`

### Signature

```typescript
export async function togglePublish(courseId: string): Promise<ApiResponse>
```

### Input

| Field | Type | Validation | Required |
|-------|------|-----------|----------|
| `courseId` | `string` | UUID format (validated inline) | Yes |

### Output

```typescript
{ status: "success", message: "Course published successfully" }
{ status: "success", message: "Course unpublished successfully" }
// or
{ status: "error", message: "<specific error>" }
```

### Behavior

1. `requireAdmin()` — redirect if not admin
2. Arcjet `protect()` — rate limit (5/min) + bot detection
3. Validate `courseId` is a valid UUID
4. Fetch course to get current `status` and `isPublished`
5. Determine new state:
   - If currently Published → set to Draft (`isPublished: false`, `status: "Draft"`)
   - If currently Draft or Archived → set to Published (`isPublished: true`, `status: "Published"`)
6. `prisma.course.update({ where: { id: courseId }, data: { status, isPublished } })`
7. `revalidatePath("/admin/courses")` + `revalidatePath("/admin/courses/${courseId}")`
8. Return success with contextual message

### Error Cases

| Condition | Response |
|-----------|----------|
| Not admin | `{ status: "error", message: "Unauthorized" }` |
| Rate limited | `{ status: "error", message: "Too many requests. Please try again in a minute." }` |
| Bot detected | `{ status: "error", message: "Access denied. Security rule triggered." }` |
| Invalid courseId | `{ status: "error", message: "Invalid course ID" }` |
| Course not found | `{ status: "error", message: "Course not found" }` |

---

## Shared Infrastructure

### Arcjet Configuration (per action file)

All three Server Actions share the same Arcjet configuration, defined once at the top of `actions.ts`:

```typescript
const aj = arcjet
  .withRule(detectBot({ mode: "LIVE", allow: [] }))
  .withRule(fixedWindow({ mode: "LIVE", window: "1m", max: 5 }));
```

### Authorization Pattern

```typescript
const admin = await requireAdmin();
if (!admin) {
  return { status: "error", message: "Unauthorized" };
}
```

### S3 Cleanup Helper (internal to actions.ts)

```typescript
async function cleanupS3Thumbnail(fileKey: string): Promise<void> {
  try {
    await fetch(`${process.env.BETTER_AUTH_URL}/api/s3/delete`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: fileKey }),
    });
  } catch (error) {
    console.error("[S3 Cleanup Failed]:", fileKey, error);
  }
}
```

> **Note**: The S3 cleanup via fetch to the existing route handler is a pragmatic choice. An alternative is to call the S3 SDK directly within the Server Action to avoid the HTTP round-trip. Both are acceptable. If the direct SDK approach is preferred during implementation, the `DeleteObjectCommand` pattern from `app/api/s3/delete/route.ts` can be extracted into a shared `lib/s3-helpers.ts` utility. This is a task-level implementation decision.

