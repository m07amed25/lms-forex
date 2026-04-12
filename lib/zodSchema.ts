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
