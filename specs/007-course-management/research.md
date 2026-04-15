# Research: Course Management — Admin CRUD

**Feature**: 007-course-management | **Date**: 2026-04-15 | **Phase**: 0 — Outline & Research

## Research Tasks

The feature spec was fully clarified before planning. No NEEDS CLARIFICATION markers exist. Research below covers technology patterns, integration best practices, and design decisions relevant to implementation.

---

### R-01: Server-Side Search, Filter, and Pagination with URL Search Params in Next.js 16 App Router

**Context**: The courses list page must support text search (title, case-insensitive), filters (status, level, category), and pagination (12 per page), all driven by URL search parameters for shareable/bookmarkable views.

**Decision**: Use `searchParams` page prop (async in Next.js 16 — must be awaited) to read URL parameters in the server component. Pass these parameters to the data helper, which constructs a Prisma `where` clause and applies `skip`/`take` for pagination. The client-side `CourseFilters` component uses `useRouter` + `useSearchParams` + `usePathname` to update the URL on filter/search changes. Search input uses a 300ms debounce via `setTimeout`/`clearTimeout` in a `useEffect`.

**Rationale**: Server-side filtering keeps client JS minimal (constitution Principle V). URL-driven state makes views shareable (FR-012). Prisma's `contains` with `mode: 'insensitive'` handles case-insensitive search natively. No additional libraries needed.

**Alternatives considered**:
- Client-side filtering with `useQuery` / React Query → rejected: violates Server Components-first principle, unnecessary client JS, data fetched on server already
- `nuqs` URL state library → rejected: adds a dependency for something achievable with built-in Next.js hooks; the project avoids unnecessary packages per constitution

---

### R-02: Update Course Server Action Pattern

**Context**: The edit form submits all fields (full replacement, not partial update) plus the course ID. The Server Action must validate, check slug uniqueness (excluding the current course), update the record, and handle thumbnail replacement.

**Decision**: Create `updateCourseSchema` by extending `createCourseSchema` with a required `courseId: z.string().uuid()` field. The Server Action (`updateCourse`) follows the exact same structure as `createCourse`: requireAdmin → Arcjet protect → Zod validate → Prisma update. Slug uniqueness is checked by catching `P2002` from Prisma (the unique constraint on `slug`). Alternatively, a pre-check query with `where: { slug, NOT: { id: courseId } }` can provide a cleaner error. Both approaches are valid; using the Prisma constraint error is simpler and consistent with `createCourse`.

**Rationale**: Full replacement matches the spec's clarification ("all fields required on every submit"). Extending `createCourseSchema` avoids duplication. The `P2002` error code is already handled in `createCourse`, so the pattern is proven.

**Alternatives considered**:
- Partial update with `z.partial()` → rejected: spec explicitly chose full replacement for simplicity
- Optimistic locking with `updatedAt` check → rejected: spec explicitly chose last-write-wins due to low admin concurrency

---

### R-03: S3 Thumbnail Cleanup During Course Deletion and Edit

**Context**: Deleting a course must also delete its S3 thumbnail. Editing a course with a new thumbnail must delete the old S3 object. S3 failures must not block the primary operation.

**Decision**: For deletion: the `deleteCourse` Server Action first reads the course's `fileKey`, deletes the course record from the database, then calls the existing `/api/s3/delete` route handler to clean up the S3 object. If the S3 call fails, the failure is logged with `console.error` and the course deletion is still considered successful. For edit thumbnail replacement: the `updateCourse` Server Action compares the submitted `fileKey` with the existing one. If different, after a successful DB update, it calls `/api/s3/delete` to remove the old thumbnail. S3 failure is logged but does not roll back the update.

**Rationale**: Reusing the existing `/api/s3/delete` route avoids duplicating S3 logic. The "DB first, S3 cleanup second" ordering ensures data consistency — an orphaned S3 object is a minor issue (logged for manual cleanup), but a deleted S3 thumbnail with an existing course record would be worse. This matches the spec's edge case requirements (FR-005, FR-006).

**Alternatives considered**:
- Direct S3 SDK call in the Server Action instead of HTTP call to route → considered viable but rejected because the route already includes its own Arcjet protection and error handling, and reusing it matches the constitution's established pattern
- Transaction wrapping DB delete + S3 delete → rejected: S3 is an external service and cannot participate in a DB transaction; sequential with logged failure is the pragmatic approach

---

### R-04: Publish/Unpublish Toggle with Server-Confirmed Update

**Context**: The toggle changes `isPublished` and `status` atomically. The spec requires a pending state indicator during processing and server-confirmed UI update (not optimistic).

**Decision**: The `PublishToggle` client component uses `useTransition` to call the `togglePublish` Server Action. While `isPending` is true, the button shows a spinner/loading state. On success, `revalidatePath` in the Server Action triggers a server re-render, reflecting the new state. The toggle only handles Draft↔Published; if the course is Archived and the toggle is activated, it moves to Published (as specified).

**Rationale**: `useTransition` is the idiomatic React 19 pattern for pending state without optimistic updates. It matches the existing `createCourse` form pattern. Server-confirmed update is explicitly required by the spec's clarification.

**Alternatives considered**:
- `useOptimistic` for instant visual feedback → rejected: spec explicitly chose server-confirmed update for consistency with Server Components-first principle
- `useActionState` (React 19) → considered but `useTransition` is simpler for a single toggle action and matches the existing codebase pattern

---

### R-05: Course Detail Page — Rich Text Rendering

**Context**: The detail page must render the course description as rich HTML content. The description is stored as Tiptap-generated HTML.

**Decision**: Render the stored HTML description using `dangerouslySetInnerHTML` inside a container with Tailwind Typography plugin classes (`prose`). The project already has `@tailwindcss/typography` installed as a dev dependency. Since this content is admin-authored (only admins can create/edit courses), the XSS risk is minimal. Input is validated via Zod (max 10,000 chars) and the HTML is generated by the Tiptap editor, which produces sanitized output.

**Rationale**: No additional rendering library is needed. The Tiptap editor already produces clean HTML, and the typography plugin provides consistent formatting. This avoids adding a server-side markdown/HTML parser dependency.

**Alternatives considered**:
- Re-instantiate Tiptap in read-only mode → rejected: heavier client JS for no interactive benefit on a read-only page; Server Component with `dangerouslySetInnerHTML` keeps it zero-JS
- DOMPurify sanitization → considered: could be added as a defense-in-depth measure but adds a dependency for admin-only content; may be revisited when public course pages are built in Phase 9

---

### R-06: Debounced Search Input Pattern

**Context**: The search input on the courses list must debounce at 300ms before triggering a server-side search via URL parameter update.

**Decision**: The `CourseFilters` client component manages a local `searchTerm` state. A `useEffect` with a 300ms `setTimeout` watches `searchTerm` and updates the URL search parameter using `router.replace(pathname + "?" + newParams)`. The `replace` method avoids cluttering the browser history. The server component reads `searchParams.search` and passes it to the data helper.

**Rationale**: 300ms is the spec-mandated debounce delay. `setTimeout`/`clearTimeout` in `useEffect` is the standard React pattern — no external debounce library needed. Using `router.replace` instead of `router.push` prevents every keystroke from creating a new history entry.

**Alternatives considered**:
- `useDeferredValue` → not suitable here because it defers rendering, not network requests; the URL update is the trigger for the server query
- `lodash.debounce` → rejected: adds a dependency for a trivial pattern; existing codebase doesn't use lodash

---

### R-07: Not-Found Handling for Dynamic Course Routes

**Context**: Navigating to `/admin/courses/[courseId]` or `/admin/courses/[courseId]/edit` with a non-existent ID must show a not-found state.

**Decision**: The data helper `adminGetCourse(courseId)` returns `null` when no course is found. The page server component checks the result and calls `notFound()` from `next/navigation` if null. Next.js will render the closest `not-found.tsx` boundary. A custom `not-found.tsx` can be added to `app/admin/courses/[courseId]/` to show a message specific to courses with a link back to `/admin/courses`.

**Rationale**: `notFound()` is the built-in Next.js mechanism for 404 states in server components. It integrates with the framework's error boundary system and is the idiomatic approach.

**Alternatives considered**:
- Conditional rendering in the page component → functional but less idiomatic; doesn't set the correct HTTP status code
- `redirect("/admin/courses")` on not-found → rejected: the user should see a clear not-found message, not a silent redirect

---

## Summary of Decisions

| # | Topic | Decision |
|---|-------|----------|
| R-01 | Search/filter/pagination | Server-side via Prisma + URL searchParams; client debounce 300ms; `router.replace` |
| R-02 | Update action pattern | Full replacement with `updateCourseSchema` (createCourseSchema + courseId); P2002 for slug conflicts |
| R-03 | S3 cleanup | DB operation first, S3 cleanup second via existing `/api/s3/delete`; failures logged, not blocking |
| R-04 | Publish toggle | `useTransition` for pending state; server-confirmed; Draft↔Published only (Archived→Published if toggled) |
| R-05 | Rich text rendering | `dangerouslySetInnerHTML` + Tailwind Typography; zero client JS on detail page |
| R-06 | Debounced search | Local state + `useEffect` setTimeout 300ms + `router.replace`; no external library |
| R-07 | Not-found handling | `notFound()` from `next/navigation` in server component; custom `not-found.tsx` |

All NEEDS CLARIFICATION items resolved. Ready for Phase 1 design.

