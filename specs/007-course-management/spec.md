# Feature Specification: Course Management — Admin CRUD

**Feature Branch**: `007-course-management`  
**Created**: 2026-04-15  
**Status**: Clarified  
**Input**: User description: "Phase 7 adds full course management capabilities for admin users: course detail view, edit, delete, publish/unpublish toggle, and courses list refinement with search, filters, and pagination."

## Constitutional Alignment *(mandatory)*

- **Roadmap Phase**: Phase 7 — Course Management — Admin CRUD (active phase, `▶ Next` in `Phases.md`). This feature belongs here because it completes the admin CRUD lifecycle started in Phases 4–5 (create and list), adding view, edit, delete, and publish/unpublish before moving to chapter/lesson content in Phase 8.
- **Affected Roles**: Admin only. All surfaces in this phase are behind admin authentication and authorization. Public and student roles are not affected.
- **Primary Surfaces**: Admin courses list page (`/admin/courses`), course detail page (`/admin/courses/[courseId]`), edit course page (`/admin/courses/[courseId]/edit`), Server Actions for update/delete/togglePublish in `[courseId]/actions.ts`, shared data helpers in `app/data/admin/`.
- **Mutation Boundary**: Server Actions for all course mutations (update, delete, toggle publish). The existing S3 delete route handler (`/api/s3/delete`) is reused for thumbnail cleanup during course deletion — this is justified because S3 file operations are an established exception to the Server Actions rule per constitution Principle II.
- **Data & Validation Impact**: Reads and writes to the `Course` Prisma model. A new Zod schema for course updates will extend/mirror `createCourseSchema`. Cache invalidation via `revalidatePath("/admin/courses")` and `revalidatePath("/admin/courses/[courseId]")` after every mutation. The courses list data helper will be extended to support filtering and search parameters.
- **Security Impact**: All pages and actions enforce `requireAdmin()`. All write Server Actions apply Arcjet rate limiting and bot protection (consistent with `createCourse` pattern). S3 delete route already uses `getAdmin()` + Arcjet. No new secrets or webhook surfaces required.
- **Verification Plan**: Manual verification of all CRUD flows (view, edit, delete, publish/unpublish, search, filter). `pnpm lint` and `pnpm build` must pass. Verification of unauthorized access redirects, invalid input rejection, rate limit responses, and S3 cleanup on delete. Edge cases (not-found course, stale data, duplicate slug on edit) must be manually tested.

## Clarifications

### Session 2026-04-15

- Q: Should the edit form use full replacement (all fields required, mirroring createCourseSchema) or partial updates (only changed fields)? → A: Full replacement — all fields required on every submit, matching the existing create schema pattern plus courseId.
- Q: When two admins edit the same course simultaneously, should the system use last-write-wins or optimistic locking (e.g., updatedAt check)? → A: Last-write-wins — low admin concurrency does not justify optimistic locking complexity.
- Q: Should the publish/unpublish toggle use optimistic UI (instant visual update before server confirms) or server-confirmed update (wait for response, then reflect)? → A: Server-confirmed update with pending state indicator — consistent with Server Components-first principle; use transition pending state for feedback.
- Q: What is the specific debounce delay for live search on the courses list? → A: 300ms debounce delay.
- Q: Can admins set a course status to "Archived" via the edit form's status dropdown, or is Archived reserved for future workflows? → A: Available in edit form — all three status values (Draft, Published, Archived) are selectable. Archived is only reachable via the edit form; the publish/unpublish toggle handles Draft↔Published transitions exclusively.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Course Detail View Page (Priority: P1)

As an admin, I want to view a single course's complete details on a dedicated page so that I can review all course metadata before deciding to edit, publish, or delete it.

The admin navigates from the courses list to a course detail page at `/admin/courses/[courseId]`. The page displays the course thumbnail, title, full description (rendered rich text), short description, price, duration, level, category, slug, status, publication state, and timestamps. The page provides clear navigation actions to edit, delete, or toggle the course's publish state.

**Why this priority**: This is the foundational page that all other management actions depend on. Without a detail view, the admin has no central place to inspect a course or access edit/delete/publish actions. It delivers immediate value by letting admins review course content that was created in Phases 4–5.

**Independent Test**: Can be fully tested by creating a course via the existing create flow, then navigating to `/admin/courses/[courseId]` and verifying all metadata renders correctly. Delivers value as a standalone read-only course inspector.

**Acceptance Scenarios**:

1. **Given** an admin is on the courses list page and at least one course exists, **When** the admin clicks on a course card, **Then** they are navigated to `/admin/courses/[courseId]` and see the course's full details including thumbnail image, title, description, short description, price, duration, level, category, slug, status, publication state, creation date, and last updated date.
2. **Given** an admin is on the course detail page, **When** the page loads, **Then** the course thumbnail is displayed using a signed S3 URL and renders correctly.
3. **Given** an admin navigates to `/admin/courses/[courseId]` with a non-existent course ID, **When** the page attempts to load, **Then** a not-found state is displayed with a clear message and a link back to the courses list.
4. **Given** a non-admin user attempts to access `/admin/courses/[courseId]`, **When** the page loads, **Then** they are redirected to `/login` (if unauthenticated) or `/unauthorized` (if authenticated but not an admin).
5. **Given** an admin is on the course detail page, **When** the page is fully loaded, **Then** action buttons for Edit, Delete, and Publish/Unpublish are visible and accessible.

---

### User Story 2 — Edit Course (Priority: P2)

As an admin, I want to edit an existing course's details using a pre-populated form so that I can correct mistakes, update pricing, or refine content without recreating the course from scratch.

The admin navigates to the edit page at `/admin/courses/[courseId]/edit`. The form is pre-populated with the course's current data (title, description, short description, price, duration, level, category, slug, status, and thumbnail). The admin modifies any fields, optionally uploads a new thumbnail (which replaces the old one and cleans up the old S3 file), and submits. The system validates the input, updates the course, and redirects the admin back to the course detail page with a success message.

**Why this priority**: Edit is the most frequently used management action after viewing. Admins need to iterate on course content — fixing typos, adjusting pricing, updating descriptions — before publishing. This builds directly on US1 (detail page provides the entry point).

**Independent Test**: Can be tested by creating a course, navigating to its edit page, modifying fields (e.g., changing the title and price), submitting, and verifying the updated values appear on the detail page. Also testable by submitting invalid data and verifying validation errors appear.

**Acceptance Scenarios**:

1. **Given** an admin is on the course detail page, **When** they click the Edit button, **Then** they are navigated to `/admin/courses/[courseId]/edit` and see a form pre-populated with all current course field values.
2. **Given** an admin is on the edit form with pre-populated data, **When** they modify the title and price and submit the form, **Then** the course is updated in the database, the admin is redirected to the course detail page, and a success notification is shown with the updated values reflected.
3. **Given** an admin is on the edit form, **When** they submit with an empty title (or other invalid input), **Then** validation errors are displayed inline and the form is not submitted.
4. **Given** an admin is on the edit form, **When** they change the slug to one that already belongs to another course and submit, **Then** an error message is displayed indicating the slug is already taken.
5. **Given** an admin is on the edit form, **When** they upload a new thumbnail image, **Then** the old thumbnail is deleted from S3 and the new one is stored, with the course's `fileKey` updated accordingly.
6. **Given** a non-admin user attempts to access `/admin/courses/[courseId]/edit`, **When** the page loads, **Then** they are redirected to `/login` or `/unauthorized`.

---

### User Story 3 — Delete Course (Priority: P3)

As an admin, I want to delete a course with a confirmation step so that I can remove outdated or incorrect courses while being protected from accidental deletion.

The admin initiates deletion from the course detail page. A confirmation dialog appears warning that this action is permanent and will remove the course and its thumbnail from storage. Upon confirmation, the system deletes the course record, cleans up the associated S3 thumbnail file, and redirects the admin to the courses list with a success message.

**Why this priority**: Delete is critical for content hygiene but is used less frequently than view or edit. It requires the detail page (US1) as its entry point and is destructive, so it carries higher risk and must include confirmation UX per the constitution.

**Independent Test**: Can be tested by creating a course, navigating to its detail page, clicking Delete, confirming in the dialog, and verifying the course no longer appears in the list. Also testable by cancelling the dialog and verifying the course is not deleted.

**Acceptance Scenarios**:

1. **Given** an admin is on the course detail page, **When** they click the Delete button, **Then** a confirmation dialog appears with a clear warning that this action is permanent and will delete the course and its thumbnail image.
2. **Given** the confirmation dialog is open, **When** the admin confirms deletion, **Then** the course record is removed from the database, the course thumbnail is deleted from S3, the admin is redirected to the courses list page, and a success notification is shown.
3. **Given** the confirmation dialog is open, **When** the admin cancels, **Then** the dialog closes, the course remains unchanged, and the admin stays on the detail page.
4. **Given** an admin confirms deletion but the S3 cleanup fails, **When** the system processes the deletion, **Then** the course record is still deleted from the database, the admin sees a success message, and the S3 cleanup failure is logged server-side for manual follow-up (S3 failure does not block course deletion).
5. **Given** an admin attempts to delete a course that has already been deleted (e.g., stale tab), **When** the deletion is processed, **Then** the system returns a not-found error and the admin is redirected to the courses list.

---

### User Story 4 — Publish / Unpublish Toggle (Priority: P4)

As an admin, I want to toggle a course between published and unpublished states so that I can control which courses are visible to the public and manage content lifecycle without deleting courses.

The admin uses a toggle action on the course detail page to change a course's visibility. Publishing sets the course status to "Published" and marks it as publicly visible. Unpublishing sets the status back to "Draft" and hides it from public-facing pages. The toggle uses a server-confirmed update pattern: a pending state indicator is shown while the server processes the request, and the new state is reflected upon successful server response.

**Why this priority**: Publish/unpublish is a key content lifecycle action but depends on the detail page (US1) and is less critical than edit and delete for initial admin workflows. It sets the groundwork for the public course catalog in Phase 9.

**Independent Test**: Can be tested by creating a draft course, navigating to the detail page, clicking Publish, and verifying the status changes to "Published" and `isPublished` becomes true. Then toggling back to unpublished and verifying the status reverts to "Draft".

**Acceptance Scenarios**:

1. **Given** an admin is on the detail page of a course with status "Draft" and `isPublished` is false, **When** they click the Publish action, **Then** a pending state indicator is shown, the course status is updated to "Published", `isPublished` is set to true, the page reflects the new state upon server confirmation, and a success notification is shown.
2. **Given** an admin is on the detail page of a course with status "Published" and `isPublished` is true, **When** they click the Unpublish action, **Then** a pending state indicator is shown, the course status is updated to "Draft", `isPublished` is set to false, the page reflects the new state upon server confirmation, and a success notification is shown.
3. **Given** an admin is on the detail page of a course with status "Archived", **When** they view the publish toggle, **Then** the toggle shows the course is unpublished and activating it sets the status to "Published" (moving it out of "Archived").
4. **Given** two admins are viewing the same course detail page, **When** one admin publishes the course, **Then** the other admin sees the updated state after their next page load or navigation.

---

### User Story 5 — Courses List Refinement (Priority: P5)

As an admin, I want to search, filter, and paginate the courses list so that I can efficiently find and manage courses as the catalog grows beyond a handful of entries.

The courses list page is enhanced with a text search bar (searches by title), filter controls for status (Draft, Published, Archived), level (Beginner, Intermediate, Advanced), and category (Forex, Crypto, Stocks, etc.), and pagination for large result sets. The course cards are improved to show status, level, price, and publication state at a glance. Filters and search work together and can be combined. The URL reflects the active filters so that filtered views are shareable and bookmarkable.

**Why this priority**: List refinement improves efficiency but is not blocking for core CRUD operations. It becomes increasingly valuable as more courses are created but is the least critical for an MVP admin workflow.

**Independent Test**: Can be tested by creating multiple courses with different statuses, levels, and categories, then using search and filters to verify only matching courses appear. Pagination can be tested by creating enough courses to exceed a single page.

**Acceptance Scenarios**:

1. **Given** an admin is on the courses list page with multiple courses, **When** they type a search term in the search bar, **Then** only courses whose title contains the search term (case-insensitive) are displayed, and the results update as the admin types (with a 300ms debounce delay).
2. **Given** an admin is on the courses list page, **When** they select "Published" from the status filter, **Then** only courses with status "Published" are displayed.
3. **Given** an admin is on the courses list page, **When** they select "Beginner" from the level filter and "Forex" from the category filter simultaneously, **Then** only courses matching both criteria are displayed.
4. **Given** an admin has applied a search term and filters, **When** they share the URL with another admin, **Then** the other admin sees the same filtered and searched view (filters are reflected in URL search parameters).
5. **Given** there are more courses than fit on a single page, **When** the admin views the courses list, **Then** pagination controls appear and the admin can navigate between pages.
6. **Given** an admin is on the courses list, **When** they view a course card, **Then** the card displays the course thumbnail, title, short description, status badge, level badge, price, and publication indicator.
7. **Given** an admin has applied filters and a search, **When** they click a "Clear filters" action, **Then** all filters and search are reset and the full unfiltered course list is displayed.
8. **Given** the filtered/searched result set is empty, **When** the admin views the list, **Then** an appropriate empty state is shown with a message indicating no courses match the current criteria.

---

### Edge Cases

- **Unauthenticated access**: A user without a session who navigates to any admin course URL (`/admin/courses`, `/admin/courses/[courseId]`, `/admin/courses/[courseId]/edit`) is redirected to `/login`.
- **Unauthorized access**: An authenticated user with a non-admin role who navigates to any admin course URL is redirected to `/unauthorized`.
- **Non-existent course**: Navigating to `/admin/courses/[courseId]` or `/admin/courses/[courseId]/edit` with an invalid or non-existent `courseId` displays a not-found state with navigation back to the courses list.
- **Invalid form input on edit**: Submitting the edit form with data that fails Zod validation (empty title, negative price, slug too short, description too long) displays inline validation errors without submitting.
- **Duplicate slug on edit**: Updating a course's slug to one that already belongs to another course returns a clear error message about the slug conflict.
- **Rate limiting on mutations**: Submitting update, delete, or toggle actions more than 5 times within 1 minute triggers Arcjet rate limiting and returns a user-friendly "Too many requests" error.
- **S3 failure during delete**: If the S3 thumbnail deletion fails after the course record is deleted, the deletion still succeeds and the S3 failure is logged for manual cleanup.
- **S3 failure during edit thumbnail replacement**: If the old thumbnail S3 deletion fails during a thumbnail change, the course is still updated with the new thumbnail and the orphaned S3 object is logged for cleanup.
- **Stale data / concurrent edits**: If an admin attempts to delete or edit a course that was already deleted by another admin, the system returns an appropriate not-found error rather than crashing. If two admins edit the same course simultaneously, last-write-wins semantics apply — no optimistic locking or conflict detection is implemented.
- **Archived status via edit form**: An admin can set a course's status to "Archived" only through the edit form's status dropdown. The publish/unpublish toggle on the detail page exclusively handles Draft↔Published transitions and does not interact with the Archived status.
- **Empty courses list with filters**: When search or filter criteria produce no results, the page shows an empty state specific to the active filters (not the generic "no courses created" empty state).
- **Bot detection**: Automated or bot-originated requests to mutation endpoints are blocked by Arcjet bot detection.
- **Large description content**: The detail page must render rich text descriptions of any length without layout overflow or performance degradation.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a course detail page at `/admin/courses/[courseId]` that displays all course metadata: thumbnail (via signed S3 URL), title, full description (rendered rich text), short description, price, duration, level, category, slug, status, publication state, creation date, and last updated date.
- **FR-002**: System MUST provide a course edit page at `/admin/courses/[courseId]/edit` with a form pre-populated with all current course values, allowing the admin to modify any field and submit changes.
- **FR-003**: System MUST validate all course edit input against a Zod schema before performing any database write, returning specific validation error messages for each failing field.
- **FR-004**: System MUST handle slug uniqueness conflicts during course update by returning a clear error message when the new slug is already taken by another course.
- **FR-005**: System MUST support thumbnail replacement during edit: when a new thumbnail is uploaded, the previous S3 object is deleted and the `fileKey` is updated. If the old S3 deletion fails, the update still proceeds and the failure is logged.
- **FR-006**: System MUST provide a delete course action that removes the course record from the database and deletes the associated S3 thumbnail, triggered only after the admin confirms via a confirmation dialog.
- **FR-007**: System MUST display a confirmation dialog before course deletion that clearly warns the action is permanent and describes what will be removed (course data and thumbnail image).
- **FR-008**: System MUST provide publish and unpublish actions that toggle a course between "Published" (`isPublished: true`, `status: "Published"`) and "Draft" (`isPublished: false`, `status: "Draft"`) states.
- **FR-009**: System MUST support text search on the courses list that filters courses by title (case-insensitive, partial match).
- **FR-010**: System MUST support filter controls on the courses list for status (Draft, Published, Archived), level (Beginner, Intermediate, Advanced), and category (all values from `courseCategories`).
- **FR-011**: System MUST support combining search and filters simultaneously, applying all active criteria together (AND logic).
- **FR-012**: System MUST reflect active search and filter state in URL search parameters so that filtered views are shareable and bookmarkable.
- **FR-013**: System MUST paginate the courses list when the number of courses exceeds 12 per page (default page size), providing navigation controls between pages.
- **FR-014**: System MUST enhance the course card component to display status badge, level badge, price, and publication indicator alongside the existing thumbnail, title, and short description.
- **FR-015**: System MUST enforce `requireAdmin()` authorization on all course management pages and Server Actions, redirecting unauthenticated users to `/login` and unauthorized users to `/unauthorized`.
- **FR-016**: System MUST apply Arcjet rate limiting (5 requests per minute) and bot detection on all course mutation Server Actions (update, delete, toggle publish).
- **FR-017**: System MUST call `revalidatePath` for relevant course routes after every successful mutation to ensure the UI reflects the latest data.
- **FR-018**: System MUST display a not-found state when a course ID does not exist, with navigation back to the courses list.
- **FR-019**: System MUST display appropriate loading, empty, and error states for the courses list page, course detail page, and edit form.
- **FR-020**: System MUST provide a "Clear filters" action on the courses list that resets all search and filter criteria to their defaults.

### Key Entities

- **Course**: The central entity representing an educational offering. Key attributes: title, description, short description, thumbnail (S3 file key), price, duration, level (Beginner/Intermediate/Advanced), category, slug (unique), status (Draft/Published/Archived), publication flag (`isPublished`), owning admin user, and timestamps. Relates to a User (admin creator) via `userId`.
- **User (Admin)**: The authenticated user with an admin role who owns and manages courses. Identified by session-based authentication via Better Auth. Each course belongs to one admin user.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An admin can navigate from the courses list to a course detail page and see all course information within 2 seconds of clicking, in a single page load with no additional manual steps.
- **SC-002**: An admin can update any course field via the edit form and see the changes reflected on the detail page within 3 seconds of form submission, including validation feedback for invalid input.
- **SC-003**: An admin can delete a course (including confirmation) in under 3 steps (click Delete → confirm → see updated list), and the course no longer appears in the courses list or has an accessible detail page afterward.
- **SC-004**: An admin can toggle a course between published and unpublished states in a single action from the detail page, with a pending state indicator during processing and the status change reflected upon server confirmation.
- **SC-005**: An admin can locate a specific course from a list of 50+ courses using search or filters within 10 seconds, compared to manual scrolling.
- **SC-006**: Every unauthorized access attempt (unauthenticated or non-admin) is blocked with an appropriate redirect — zero unauthorized users can view, edit, delete, or toggle courses.
- **SC-007**: Every mutation (update, delete, toggle) rejects invalid or malicious input with specific, user-friendly error messages — zero unvalidated writes reach the database.
- **SC-008**: Filtered and searched course list views are bookmarkable and shareable via URL — another admin opening the same URL sees the identical filtered results.
- **SC-009**: Rate-limited mutation attempts (more than 5 per minute) return a clear "too many requests" message without corrupting data or crashing the application.
- **SC-010**: Course deletion cleans up the associated S3 thumbnail — zero orphaned S3 objects remain after successful delete operations under normal conditions.

## Assumptions

- **Admin-only scope**: All features in this phase are exclusively for admin users. Public-facing course views are deferred to Phase 9 (Public Course Catalog).
- **Desktop-first usage**: Admins primarily manage courses from desktop browsers. The UI will be responsive but optimized for desktop workflows.
- **Existing create form pattern reuse**: The edit form will follow the same UI patterns and component structure as the existing course creation form (`/admin/courses/create`), adapted for pre-population and update semantics.
- **Existing S3 delete route reuse**: Thumbnail cleanup during course deletion and thumbnail replacement during edit will use the existing `/api/s3/delete` route handler. No new S3 endpoints are needed.
- **Server-side search and filtering**: Search, filtering, and pagination are performed server-side via Prisma queries to keep client JavaScript minimal, consistent with constitution Principle V. URL search parameters drive the query.
- **Page size default**: The courses list will default to 12 courses per page, which is a reasonable grid layout for desktop screens. This is adjustable without spec changes.
- **No bulk operations**: This phase covers single-course CRUD operations only. Bulk delete, bulk publish, or bulk edit are not in scope.
- **No course duplication**: Cloning or duplicating a course is not in scope for this phase.
- **No chapter/lesson impact**: Since chapters and lessons are introduced in Phase 8, course deletion in this phase only removes the course record and its thumbnail. No cascading content deletion is needed yet.
- **Archived status behavior**: Archived courses can be published (moving them to "Published") or remain archived. The "Archived" status is reachable only via the edit form's status dropdown — there is no separate "archive" action. The publish/unpublish toggle on the detail page handles only Draft↔Published transitions.
- **Existing Zod schema extension**: The update validation schema will mirror `createCourseSchema` with all fields required (full replacement, not partial update), plus the course ID as an additional required field. All field constraints match the create schema.
- **Revalidation strategy**: `revalidatePath` is sufficient for cache invalidation in the current codebase. No tag-based revalidation or ISR configuration changes are needed.

