# Forex LMS

## Full Project Plan — Enhanced

**Next.js 16 · TypeScript · Prisma · Better Auth · Arcjet · S3**  
**April 2026**

- ✅ 7 Phases Done
- ⏳ 9 Phases Remaining

**17 Total Phases**  
**~35% Complete**  
**~95 Tasks Total**

---

## Project Phase Summary

| Phase | Description                    | Status  |
| ----- | ------------------------------ | ------- |
| 1     | Foundation & Infrastructure    | ✅ Done |
| 2     | Authentication & Authorization | ✅ Done |
| 3     | Admin Dashboard Shell          | ✅ Done |
| 4     | Course Creation (Admin)        | ✅ Done |
| 5     | Course Listing (Admin)         | ✅ Done |
| 6     | Public Landing Page            | ✅ Done |
| 7     | Course Management — Admin CRUD | ✅ Done |
| 8     | Chapters & Lessons System      | ✅ Done |
| 9     | Public Course Catalog          | ✅ Done |
| 10    | Enrollment & Payment           | ✅ Todo |
| 11    | Student Learning Experience    | 🔲 Todo |
| 12    | User Profile                   | 🔲 Todo |
| 13    | Admin Analytics (Real Data)    | 🔲 Todo |
| 14    | Admin User Management          | 🔲 Todo |
| 15    | Reviews & Ratings              | 🔲 Todo |
| 16    | Certificates                   | 🔲 Todo |
| 17    | Polish & Production            | 🔲 Todo |

---

# ✅ Completed Phases (Do Not Modify)

## ✅ Phase 1: Foundation & Infrastructure — DONE

| #   | Task                   | Description                          | Status |
| --- | ---------------------- | ------------------------------------ | ------ |
| 1   | Project setup          | Next.js 16, TypeScript 5, Tailwind 4 | ✅     |
| 2   | shadcn/ui setup        | UI primitives                        | ✅     |
| 3   | PostgreSQL + Prisma    | Neon + WebSocket                     | ✅     |
| 4   | Env validation         | @t3-oss/env-nextjs                   | ✅     |
| 5   | Theme system           | next-themes + CSS vars               | ✅     |
| 6   | tryCatch + ApiResponse | Error handling                       | ✅     |
| 7   | ESLint config          | Strict rules                         | ✅     |

---

## ✅ Phase 2: Authentication & Authorization — DONE

| #   | Task              | Description                    | Status |
| --- | ----------------- | ------------------------------ | ------ |
| 1   | Better Auth       | GitHub OAuth + OTP             | ✅     |
| 2   | Roles             | Admin/User roles               | ✅     |
| 3   | Login page        | LoginForm                      | ✅     |
| 4   | OTP verification  | verify-request                 | ✅     |
| 5   | Guards            | requireAdmin                   | ✅     |
| 6   | Unauthorized page | /unauthorized                  | ✅     |
| 7   | Email templates   | React Email                    | ✅     |
| 8   | Arcjet security   | Rate limiting + bot protection | ✅     |

---

## ✅ Phase 3: Admin Dashboard Shell — DONE

- Sidebar layout
- Navigation (Dashboard, Courses, Analytics, Users)
- Header + user menu
- Admin home with demo charts

---

## ✅ Phase 4: Course Creation — DONE

- Course schema (title, price, level, etc.)
- Zod validation
- S3 upload system
- Tiptap editor
- Create course page
- Server action with rate limiting

---

## ✅ Phase 5: Course Listing — DONE

- adminGetCourses()
- AdminCourseCard
- Courses grid page

---

## ✅ Phase 6: Public Landing Page — DONE

- Public layout
- Landing sections (features, stats, CTA)
- useSignOut hook

---

# Active Phase

## ✅ Phase 7: Course Management — Admin CRUD

- Courses list page refinement
- Course details page
- Edit course
- Delete course
- Publish / Unpublish
- Filters & search

---

# ✅ Upcoming Phases

## ✅ Phase 8: Chapters & Lessons System

- Chapter & Lesson schemas
- CRUD operations
- Drag & drop ordering
- Video upload (S3 / CDN)
- Lesson editor
- Free preview flag

---

## ✅ Phase 9: Public Course Catalog

- Browse page `/courses`
- Course details page
- Search & filters
- PublicCourseCard
- Free preview lessons

---

## ✅ Phase 10: Enrollment & Payment

- Enrollment schema
- Mobile Wallet / Visa Paymob integration
- Checkout flow
- Webhook handler
- Custom Callback url on success or fail to check the status in the website and check the use status
- Free enrollment
- Access guards

---

## ✅ Phase 11: Student Learning Experience

**Branch**: `learning-experience` | **Spec**: `specs/002-student-learning-experience/`  
**New Dependencies**: `video.js`, `@aws-sdk/s3-request-presigner`, `@types/video.js`  
**New Prisma Model**: `UserProgress` (id, userId, lessonId, completedAt) — `@@unique([userId, lessonId])`, cascade deletes  
**Routes**: `/my-courses`, `/courses/[slug]/lessons/[lessonId]`  
**Performance Targets**: My Courses <2s, course player <3s, mark-complete <1s, auto-advance <1s

### Data Layer

| Function | File | Description |
| --- | --- | --- |
| `getCourseProgress(userId, courseId)` | `app/data/get-course-progress.ts` | Parallel count queries → `{ completed, total, percentage }`. Always dynamic (no cached values). |
| `getCoursePlayerData(courseId, userId)` | `app/data/get-course-player-data.ts` | Full course structure: chapters → lessons (ordered by position) with `hasVideo` and `isCompleted` flags per lesson, plus progress summary. |
| `getMyCoursesData(userId)` | `app/data/get-my-courses.ts` | Active enrollments with per-course progress %, next incomplete lesson ID (by chapter position → lesson position). |
| `getSignedVideoUrl(videoFileKey)` | `lib/s3-signed-url.ts` | S3 presigned `GetObject` URL with 1-hour expiry via `@aws-sdk/s3-request-presigner`. |

### Server Actions

| Action | File | Validation | Rate Limit |
| --- | --- | --- | --- |
| `markLessonComplete` | `app/(student)/courses/[slug]/_actions/mark-complete.ts` | Zod (`lessonId: uuid, courseId: uuid`), auth check, Active enrollment check | Arcjet `slidingWindow` 30/60s |
| `markLessonIncomplete` | `app/(student)/courses/[slug]/_actions/mark-incomplete.ts` | Zod (`lessonId: uuid, courseId: uuid`), auth check, Active enrollment check | Arcjet `slidingWindow` 30/60s |

- Mark complete uses `upsert` (idempotent — repeated clicks safe)
- Mark incomplete uses `delete` (removes UserProgress record)
- Both `revalidatePath` after mutation for instant UI update

### Pages & Layouts

| File | Type | Description |
| --- | --- | --- |
| `app/(student)/layout.tsx` | Server Component | Auth guard (redirect to `/login`), sticky header with logo + "My Courses" nav link |
| `app/(student)/my-courses/page.tsx` | Server Component | Grid of enrolled courses (1/2/3 col responsive), shadcn Card + Progress + Badge, "Continue Learning" link → next incomplete lesson, empty state → browse catalog |
| `app/(student)/my-courses/loading.tsx` | Loading UI | Skeleton loaders for course cards |
| `app/(student)/courses/[slug]/layout.tsx` | Server Component | Enrollment guard (Active required, else redirect to public course page), fetches `getCoursePlayerData`, renders sidebar + progress bar + children |
| `app/(student)/courses/[slug]/lessons/[lessonId]/page.tsx` | Server Component | Fetches lesson data, generates signed video URL if `videoFileKey` exists, renders VideoPlayer + LessonContent + MarkCompleteButton + AutoAdvance, computes next lesson URL |
| `app/(student)/courses/[slug]/lessons/[lessonId]/loading.tsx` | Loading UI | Skeleton loaders for lesson content |

### Client Components

| Component | File | Description |
| --- | --- | --- |
| `CourseSidebar` | `_components/course-sidebar.tsx` | Overall progress bar at top, collapsible chapters, ordered lessons with checkmark icons for completed, highlighted current lesson. **Mobile**: shadcn Sheet off-canvas drawer with toggle button. |
| `VideoPlayer` | `_components/video-player.tsx` | `"use client"` — video.js wrapper. `useEffect` init + `player.dispose()` cleanup. Imports `video-js.css`. Props: `signedUrl`, `onEnded` callback. Controls: play/pause, seek, volume, fullscreen. Error state: "Video unavailable". |
| `MarkCompleteButton` | `_components/mark-complete-button.tsx` | `"use client"` — Toggle button ("Mark as Complete" ↔ "Mark as Incomplete"). Calls server actions via `useTransition`. Sonner toast on success/error. `onComplete` callback triggers auto-advance. |
| `AutoAdvance` | `_components/auto-advance.tsx` | `"use client"` — 5-second countdown overlay after lesson completion. Shows "Next: {title}" with progress bar. "Cancel" button to stay. `router.push(nextLessonUrl)` on countdown end. Last lesson: "Course Complete 🎉" message with link to `/my-courses`. |
| `LessonContent` | `_components/lesson-content.tsx` | Renders Tiptap HTML content as rich text using `lib/tiptap-html.ts`. |

### User Stories & Acceptance Criteria

1. **My Courses Dashboard (P1)**: Enrolled courses grid with progress bars, "Continue Learning" links to next incomplete lesson, "Completed" badge at 100%, empty state prompts catalog browsing
2. **Course Player Navigation (P1)**: Sidebar with chapters/lessons, checkmarks for completed, highlighted current lesson, enrollment-based access control (non-enrolled → redirect)
3. **Video Playback (P2)**: video.js player with S3 signed URLs (1hr expiry), standard controls, no player for text-only lessons, "Video unavailable" on load failure
4. **Mark Lesson Complete (P2)**: Manual button for text-only, auto-mark on video `ended` event, idempotent upsert, toggle to mark incomplete, sidebar + progress instant update
5. **Auto-Advance (P3)**: 5-second countdown after completion, cancel option, cross-chapter navigation (last lesson in chapter → first lesson of next chapter), "Course Complete" on final lesson
6. **Progress Tracking (P2)**: Dynamic calculation (completed/total), persists across sessions, recalculates when admin adds/removes lessons, consistent across all views

### Edge Cases Handled

- Course with no chapters/lessons → "This course has no content yet" empty state
- 100% complete course in player → "Course Complete" banner, "Continue Learning" links to first lesson
- Rapid "Mark Complete" clicks → idempotent upsert, no duplicates (`@@unique` constraint)
- Concurrent tabs marking different lessons → independent records, no conflict
- Deleted lesson with progress → cascading delete removes UserProgress, progress recalculates
- Missing/failed video → "Video unavailable" error with text content still accessible
- Non-enrolled user → redirected to public course details page

### Task Breakdown (29 tasks across 9 phases)

| Phase | Tasks | Description |
| --- | --- | --- |
| Setup | T001–T003 | Install deps, add UserProgress schema, run migration |
| Foundational | T004–T008 | S3 signed URL util, 3 data functions, student layout with auth guard |
| US1 My Courses | T009–T010 | My Courses page + responsive styling |
| US2 Course Player | T011–T014 | Player layout + enrollment guard, sidebar, lesson content renderer, lesson page |
| US3 Video | T015–T016 | video.js client component, integrate into lesson page |
| US4 Mark Complete | T017–T020 | 2 server actions (parallel), button component, wire into lesson page |
| US5 Auto-Advance | T021–T022 | Countdown component, integrate into lesson page |
| US6 Progress | T023–T024 | End-to-end accuracy verification, progress display in player header |
| Polish | T025–T029 | Edge cases, mobile responsiveness, loading skeletons, quickstart validation |

---

## 🔲 Phase 12: User Profile

**Branch**: `user-profile` | **Spec**: `specs/003-user-profile/`  
**No New Dependencies** — uses existing S3, Better Auth, shadcn/ui, Zod, Arcjet  
**Schema Changes**: Add `bio` (String?) and `phone` (String?) fields to `User` model  
**Routes**: `/profile` (tabbed: Profile / My Courses / Sessions), `/admin/users/[userId]` (admin read-only view)  
**Decisions**: Email read-only, 1:1 square avatar crop, admin view is read-only (edits in Phase 14)  
**Performance Targets**: Profile page <2s, update <1s, avatar upload <3s, session revoke <500ms

### Data Layer

| Function | File | Description |
| --- | --- | --- |
| `getUserProfile(userId)` | `app/data/get-user-profile.ts` | User record (name, email, image, bio, phone, role, createdAt). No sensitive fields. |
| `getUserLearningStats(userId)` | `app/data/get-user-learning-stats.ts` | Parallel aggregation: totalEnrolled, completedCourses, inProgressCourses, totalLessonsCompleted, memberSince. |
| `getUserEnrolledCourses(userId)` | `app/data/get-user-enrolled-courses.ts` | Enrolled courses with progress %, title, slug, image, level, category. Sorted by most recent. |
| `getUserAccounts(userId)` | `app/data/get-user-accounts.ts` | Connected OAuth providers (providerId, createdAt). No tokens exposed. |

### Server Actions

| Action | File | Validation | Rate Limit |
| --- | --- | --- | --- |
| `updateProfile` | `app/(student)/profile/_actions/update-profile.ts` | Zod: name (2-100), bio? (max 500), phone? (regex) | 10/60s |
| `updateAvatar` | `app/(student)/profile/_actions/update-avatar.ts` | Zod: imageFileKey (non-empty), auth check | 5/60s |
| `removeAvatar` | `app/(student)/profile/_actions/remove-avatar.ts` | Auth check, deletes old S3 object | 5/60s |
| `revokeSession` | `app/(student)/profile/_actions/revoke-session.ts` | Zod: sessionId, cannot revoke current session | 10/60s |

### Pages & Layouts

| File | Type | Description |
| --- | --- | --- |
| `app/(student)/profile/page.tsx` | Server Component | Tabbed profile page (self-view). Parallel fetch of profile, stats, courses, accounts. |
| `app/(student)/profile/loading.tsx` | Loading UI | Skeleton loaders for header, stats, tabs. |
| `app/admin/users/[userId]/page.tsx` | Server Component | Admin read-only view of any user's profile. Requires `requireAdmin`. |
| `app/admin/users/[userId]/loading.tsx` | Loading UI | Skeleton loaders for admin profile view. |

### Client Components

| Component | File | Description |
| --- | --- | --- |
| `ProfileHeader` | `_components/profile-header.tsx` | Avatar (fallback initials), name, email, role badge, member since. |
| `ProfileEditForm` | `_components/profile-edit-form.tsx` | React Hook Form + Zod. Fields: name, bio, phone. `useTransition` + Sonner toast. |
| `AvatarUploadDialog` | `_components/avatar-upload-dialog.tsx` | shadcn Dialog with existing ImageCropper + Uploader. Preview before save. Remove option. |
| `LearningStatsCards` | `_components/learning-stats-cards.tsx` | Grid of stat cards: Enrolled, Completed, In Progress, Lessons Done. |
| `EnrolledCoursesGrid` | `_components/enrolled-courses-grid.tsx` | Responsive course grid with progress bars, "Continue Learning" links. Empty state → catalog CTA. |
| `SessionsManager` | `_components/sessions-manager.tsx` | Active sessions list, device/IP info, current session badge, revoke with confirmation. |
| `ConnectedAccounts` | `_components/connected-accounts.tsx` | OAuth providers (GitHub) with connection date. Read-only. |
| `ProfileTabs` | `_components/profile-tabs.tsx` | shadcn Tabs: Profile / My Courses / Sessions. URL hash sync. |

### User Stories & Acceptance Criteria

1. **View Profile (P1)**: Avatar/initials, name, email (read-only), role, member since. Responsive layout.
2. **Edit Profile (P1)**: Update name/bio/phone with validation. Email NOT editable. Sonner toast feedback. Rate limited.
3. **Avatar Management (P2)**: S3 upload + 1:1 square crop, preview, remove. Old object cleanup. Max 2MB (JPEG/PNG/WebP).
4. **Learning Statistics (P2)**: Dynamic stat cards. Zero state for new users.
5. **Enrolled Courses (P2)**: Progress grid, "Continue Learning" links, sorted by recent. Empty state CTA.
6. **Session Management (P3)**: List active sessions, revoke non-current sessions, confirmation dialog.
7. **Connected Accounts (P3)**: Display linked OAuth providers. Read-only for now.
8. **Admin Profile View (P2)**: Read-only view at `/admin/users/[userId]`. No edit forms. Requires `requireAdmin`.

### Edge Cases Handled

- No avatar → initials fallback; No bio/phone → "Not provided" placeholder
- No enrolled courses → empty state with catalog link; Zero stats → encouraging message
- S3 upload failure → error toast, avatar unchanged; Revoke current session → disabled/guarded
- Concurrent edits → last write wins + `revalidatePath`; Banned user → auth redirect
- Long bio → 500 char Zod limit + truncated display with expand; Null image remove → no-op
- 
- Admin viewing non-existent user → 404; Admin edit attempt via API → ownership check blocks

### Task Breakdown (25 tasks across 8 phases)

| Phase | Tasks | Description |
| --- | --- | --- |
| Setup | T001–T002 | Add bio/phone to User schema, run migration |
| Data Layer | T003–T006 | 4 data functions (profile, stats, courses, accounts) |
| Zod Schemas | T007 | updateProfileSchema, updateAvatarSchema, revokeSessionSchema |
| Server Actions | T008–T011 | updateProfile, updateAvatar, removeAvatar, revokeSession (with ownership guards) |
| Profile View & Edit | T012–T015 | ProfileHeader, ProfileEditForm (email read-only), AvatarUploadDialog (1:1 crop), profile page + tabs |
| Stats & Courses | T016–T018 | LearningStatsCards, EnrolledCoursesGrid, wire into tabs |
| Sessions & Accounts | T019–T020 | SessionsManager, ConnectedAccounts components |
| Admin View | T021–T022 | AdminProfileView component, `/admin/users/[userId]` page + loading skeleton |
| Polish | T023–T025 | Loading skeleton, navigation updates (student + public layout), mobile responsiveness, edge case testing |

---

## 🔲 Phase 13: Admin Analytics

- Revenue dashboard
- Student analytics
- Course performance
- Replace demo data

---

## 🔲 Phase 14: Admin User Management

- Users list
- User details
- Ban / Unban
- Role management

---

## 🔲 Phase 15: Reviews & Ratings

- Review schema
- Add review
- Display reviews
- Average rating
- Admin moderation

---

## 🔲 Phase 16: Certificates

- Certificate schema
- PDF generation
- Certificate page
- Public verification

---

## 🔲 Phase 17: Polish & Production

- SEO
- Loading states
- Error boundaries
- Responsive audit
- Performance optimization
- Email notifications
- Deployment

---

# Architecture & Conventions

- **Server Components first**
- **Server Actions for mutations**
- **Co-location structure**
- **Centralized data fetching**
- **requireAdmin enforcement**
- **Arcjet rate limiting**
- **Zod validation**
- **tryCatch error handling**
- **Strict naming conventions**
- **No banned packages**
- **Git workflow (feature branches + clean commits)**

---
