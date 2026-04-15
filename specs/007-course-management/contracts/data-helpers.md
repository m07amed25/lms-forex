# Data Helper Contracts: Course Management — Admin CRUD

**Feature**: 007-course-management | **Date**: 2026-04-15 | **Phase**: 1

All data helpers are server-only functions in `app/data/admin/`.

---

## adminGetCourses (modified)

**Purpose**: Fetch a paginated, searchable, filterable list of courses for the admin courses page.

**File**: `app/data/admin/admin-get-courses.ts`

### Signature

```typescript
export default async function adminGetCourses(params?: {
  search?: string;
  status?: string;
  level?: string;
  category?: string;
  page?: number;
}): Promise<{
  courses: AdminCourseType[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}>
```

### Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `search` | `string?` | `undefined` | Title search term (case-insensitive, partial match) |
| `status` | `string?` | `undefined` | Filter by CourseStatus: "Draft", "Published", "Archived" |
| `level` | `string?` | `undefined` | Filter by CourseLevel: "Beginner", "Intermediate", "Advanced" |
| `category` | `string?` | `undefined` | Filter by category string from `courseCategories` |
| `page` | `number?` | `1` | Page number (1-based) |

### Query Construction

```typescript
const PAGE_SIZE = 12;
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

const [courses, totalCount] = await Promise.all([
  prisma.course.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: ((params?.page ?? 1) - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    select: { /* existing fields + isPublished */ },
  }),
  prisma.course.count({ where }),
]);
```

### Return Type

```typescript
export type AdminCourseType = {
  id: string;
  title: string;
  smallDescription: string;
  duration: number;
  level: CourseLevel;
  status: CourseStatus;
  price: number;
  fileKey: string;
  category: string;
  slug: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  imageUrl: string; // Signed S3 URL
};
```

### Changes from Current Implementation

1. **Add params argument** — currently takes no arguments
2. **Add `where` clause construction** — currently fetches all courses
3. **Add pagination** (`skip`/`take`) — currently returns all
4. **Add `totalCount` query** — new, needed for pagination controls
5. **Add `isPublished` to select** — not currently selected
6. **Return structured object** instead of flat array — `{ courses, totalCount, totalPages, currentPage }`

### Backward Compatibility

The courses list page (`app/admin/courses/page.tsx`) is the only consumer. It will be modified in the same task to pass search params and handle the new return shape.

---

## adminGetCourse (new)

**Purpose**: Fetch a single course with all fields for the detail and edit pages.

**File**: `app/data/admin/admin-get-course.ts`

### Signature

```typescript
export default async function adminGetCourse(
  courseId: string,
): Promise<AdminCourseDetailType | null>
```

### Parameters

| Param | Type | Description |
|-------|------|-------------|
| `courseId` | `string` | The course UUID from the URL param |

### Query

```typescript
await requireAdmin();

const course = await prisma.course.findUnique({
  where: { id: courseId },
});

if (!course) return null;

// Generate signed S3 URL for thumbnail
const imageUrl = await getSignedUrl(S3, new GetObjectCommand({
  Bucket: env.NEXT_PUBLIC_S3_BUCKET_NAME_IMAGES,
  Key: course.fileKey,
}), { expiresIn: 3600 });

return { ...course, imageUrl };
```

### Return Type

```typescript
export type AdminCourseDetailType = {
  id: string;
  title: string;
  description: string;      // Full rich text HTML
  smallDescription: string;
  fileKey: string;
  price: number;
  duration: number;
  level: CourseLevel;
  category: string;
  slug: string;
  isPublished: boolean;
  status: CourseStatus;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  imageUrl: string;          // Signed S3 URL
};
```

### Consumers

- `app/admin/courses/[courseId]/page.tsx` — course detail page
- `app/admin/courses/[courseId]/edit/page.tsx` — edit form pre-population (fetched in a server wrapper or via prop drilling)

---

## Pagination Constants

Defined in the data helper or as a shared constant:

```typescript
export const COURSES_PAGE_SIZE = 12;
```

## URL Search Parameter Contract

The courses list page reads the following search parameters (all optional):

| Param | Type | Example | Used by |
|-------|------|---------|---------|
| `search` | `string` | `?search=forex` | Title search |
| `status` | `string` | `?status=Published` | Status filter |
| `level` | `string` | `?level=Beginner` | Level filter |
| `category` | `string` | `?category=Forex` | Category filter |
| `page` | `string` (parsed to number) | `?page=2` | Pagination |

Parameters can be combined: `?search=intro&status=Draft&level=Beginner&page=1`

The `CourseFilters` client component writes these parameters. The courses list server component reads them and passes to `adminGetCourses()`.

