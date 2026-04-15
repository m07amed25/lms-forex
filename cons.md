# Salma Forex LMS

A Learning Management System (LMS) for forex trading education. Admins create and manage courses; learners browse, enroll, and study.

## Tech Stack (Strict)

| Layer           | Technology                       | Version           | Notes                                                           |
| --------------- | -------------------------------- | ----------------- | --------------------------------------------------------------- |
| Framework       | **Next.js** (App Router)         | 16.2.2            | RSC by default. `"use client"` only when needed.                |
| Language        | **TypeScript**                   | 5.x               | Strict mode. No `any`.                                          |
| Runtime         | **React**                        | 19.2.4            | Server Components first.                                        |
| Styling         | **Tailwind CSS**                 | 4.x               | Utility-first. No custom CSS files except `globals.css`.        |
| UI Components   | **shadcn/ui** (base-nova)        | 4.1.2             | All UI primitives live in `components/ui/`.                     |
| Icons           | **Lucide React**                 | 0.469             | Only icon library allowed.                                      |
| Forms           | **React Hook Form** + **Zod**    | RHF 7.x / Zod 4.x | Schema-first validation. `@hookform/resolvers` for integration. |
| Database        | **PostgreSQL** (Neon serverless) | —                 | Accessed via Prisma.                                            |
| ORM             | **Prisma**                       | 7.7.0             | Neon adapter + WebSocket. Schema in `prisma/schema.prisma`.     |
| Auth            | **Better Auth**                  | 1.6.1             | GitHub OAuth + Email OTP. Admin plugin for roles.               |
| File Storage    | **S3-compatible** (T3 Storage)   | AWS SDK v3        | Presigned URLs. Keys stored in DB.                              |
| Email           | **Nodemailer** + **React Email** | 8.x / 1.x         | Templates in `components/emails/`.                              |
| Security        | **Arcjet**                       | 1.3.1             | Bot detection, rate limiting, shield.                           |
| Animations      | **Framer Motion**                | 12.x              | Dev dependency. Use sparingly.                                  |
| Package Manager | **pnpm**                         | —                 | Workspace enabled. Only pnpm.                                   |

### Do NOT introduce

- Redux, Zustand, Jotai, or any global state library (use React state/context).
- CSS Modules, Styled Components, or Emotion.
- Axios for new code (use native `fetch` or server actions).
- Any icon library other than Lucide.
- Any UI component library other than shadcn/ui.
- jQuery or Lodash.

## Project Structure

```
app/
  (auth)/          # Login, verify-request (centered card layout)
  (public)/        # Public-facing pages (navbar + user dropdown)
  admin/           # Admin dashboard (sidebar layout, requireAdmin guard)
    courses/       # Course CRUD
  api/             # Route handlers (auth, S3 upload/delete)
  data/            # Server-side data fetching functions
components/
  ui/              # shadcn/ui primitives (DO NOT edit manually — use shadcn CLI)
  emails/          # React Email templates
  file-uploader/   # Dropzone-based S3 uploader
  rich-text-editor/# Tiptap editor
  sidebar/         # Admin sidebar components
hooks/             # Custom hooks (useSignOut, useIsMobile, tryCatch)
lib/               # Core utilities (auth, db, env, S3, email, arcjet, zod schemas)
prisma/            # Schema & migrations
providers/         # ThemeProvider only
```

## Code Quality Standards

### Architecture

- **Server Components by default.** Only add `"use client"` when the component needs interactivity (hooks, event handlers, browser APIs).
- **Server Actions** (`"use server"`) for all mutations. No API routes for form submissions.
- **Co-locate** related code: `_components/` and `_actions/` sit next to their route segments.
- **Data fetching** lives in `app/data/` as async functions that call Prisma directly.

### TypeScript

- No `any` or `as` casts unless absolutely unavoidable (document why with a comment).
- Infer types from Zod schemas (`z.infer<typeof schema>`) and Prisma return types.
- Use the `ApiResponse` type (`lib/types.ts`) for server action return values.

### Validation & Error Handling

- Validate ALL user input with Zod at the server boundary (inside server actions).
- Use the `tryCatch` utility (`hooks/try-catch.ts`) for async operations.
- Surface errors to users via Sonner toasts — never swallow silently.

### Security

- Apply `requireAdmin()` on every admin data function and server action.
- Rate-limit write operations with Arcjet (`fixedWindow` / `slidingWindow`).
- Use `"server-only"` imports for secrets and sensitive modules.
- Validate env vars at startup via `@t3-oss/env-nextjs` (`lib/env.ts`).

### Styling

- Tailwind utility classes only. No inline `style` attributes.
- Use shadcn/ui component variants (`variant`, `size`) — don't override with arbitrary classes when a variant exists.
- Responsive: mobile-first with Tailwind breakpoints.
- Dark mode via `next-themes` + CSS variables (already configured).

### Naming Conventions

- **Files:** `kebab-case` for components and utilities (`admin-course-card.tsx`, `require-admin.ts`).
- **Components:** `PascalCase` exports (`AdminCourseCard`, `LoginForm`).
- **Hooks:** `camelCase` prefixed with `use` (`useSignOut`, `useIsMobile`).
- **Server actions:** `camelCase` verb-first (`createCourse`, `deleteCourse`).
- **Zod schemas:** `camelCase` suffixed with `Schema` (`createCourseSchema`).

### Git

- Branch from `master`. Feature branches named `feature-name`.
- Commit messages: imperative mood, concise (`Add course creation form`, `Fix S3 timeout`).

## Running Locally

```bash
pnpm install
pnpm dev
```

Requires a `.env` file with 18+ server variables (see `lib/env.ts` for the full list).
