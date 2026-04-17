import { z } from "zod";

export const courseLevels = ["Beginner", "Intermediate", "Advanced"] as const;
export const courseStatus = ["Draft", "Published", "Archived"] as const;
export const courseCategories = [
  "Forex",
  "Crypto",
  "Stocks",
  "Options",
  "Commodities",
  "Indices",
  "Bonds",
  "ETFs",
  "Mutual Funds",
  "Real Estate",
  "Other",
] as const;

export const createCourseSchema = z.object({
  title: z
    .string()
    .min(5, { message: "Title is required" })
    .max(100, { message: "Title is too long" }),
  description: z
    .string()
    .min(10, { message: "Description is required" })
    .max(10000, { message: "Description is too long" }),
  fileKey: z.string().min(1, { message: "File key is required" }),
  price: z.coerce.number().min(1, { message: "Price is required" }),
  duration: z.coerce
    .number()
    .min(1, { message: "Duration is required" })
    .max(500, { message: "Duration is too long" }),
  level: z
    .enum(courseLevels, { message: "Level is required" })
    .default("Beginner"),
  category: z
    .enum(courseCategories, { message: "Category is required" })
    .default("Forex"),
  smallDescription: z
    .string()
    .min(3, { message: "Small description is required" })
    .max(500, { message: "Small description is too long" }),
  slug: z.string().min(3, { message: "Slug is required" }),
  status: z
    .enum(courseStatus, { message: "Status is required" })
    .default("Draft"),
});

export type CreateCourseSchema = z.infer<typeof createCourseSchema>;
export type CreateCourseInput = z.input<typeof createCourseSchema>;

export const updateCourseSchema = createCourseSchema.extend({
  courseId: z.string().uuid({ message: "Valid course ID is required" }),
});

export type UpdateCourseSchema = z.infer<typeof updateCourseSchema>;
export type UpdateCourseInput = z.input<typeof updateCourseSchema>;

export const COURSES_PAGE_SIZE = 12;

// ─── Chapter Schemas ────────────────────────────────────────

export const createChapterSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, { message: "Title must be at least 3 characters" })
    .max(200, { message: "Title must be at most 200 characters" }),
  courseId: z.string().uuid({ message: "Valid course ID is required" }),
});

export type CreateChapterInput = z.infer<typeof createChapterSchema>;

export const updateChapterSchema = z.object({
  chapterId: z.string().uuid({ message: "Valid chapter ID is required" }),
  title: z
    .string()
    .trim()
    .min(3, { message: "Title must be at least 3 characters" })
    .max(200, { message: "Title must be at most 200 characters" }),
});

export type UpdateChapterInput = z.infer<typeof updateChapterSchema>;

export const reorderChaptersSchema = z.object({
  courseId: z.string().uuid({ message: "Valid course ID is required" }),
  items: z.array(
    z.object({
      id: z.string().uuid({ message: "Valid item ID is required" }),
      position: z.number().int().min(0, { message: "Position must be >= 0" }),
    }),
  ),
});

export type ReorderChaptersInput = z.infer<typeof reorderChaptersSchema>;

// ─── Lesson Schemas ─────────────────────────────────────────

export const createLessonSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, { message: "Title must be at least 3 characters" })
    .max(200, { message: "Title must be at most 200 characters" }),
  content: z
    .string()
    .min(10, { message: "Content must be at least 10 characters" }),
  chapterId: z.string().uuid({ message: "Valid chapter ID is required" }),
  isFreePreview: z.boolean().default(false),
  videoFileKey: z.string().optional(),
});

export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type CreateLessonFormInput = z.input<typeof createLessonSchema>;

export const updateLessonSchema = z.object({
  lessonId: z.string().uuid({ message: "Valid lesson ID is required" }),
  title: z
    .string()
    .trim()
    .min(3, { message: "Title must be at least 3 characters" })
    .max(200, { message: "Title must be at most 200 characters" }),
  content: z
    .string()
    .min(10, { message: "Content must be at least 10 characters" }),
  isFreePreview: z.boolean(),
  videoFileKey: z.string().nullable().optional(),
});

export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;

export const reorderLessonsSchema = z.object({
  chapterId: z.string().uuid({ message: "Valid chapter ID is required" }),
  items: z.array(
    z.object({
      id: z.string().uuid({ message: "Valid item ID is required" }),
      position: z.number().int().min(0, { message: "Position must be >= 0" }),
    }),
  ),
});

export type ReorderLessonsInput = z.infer<typeof reorderLessonsSchema>;
