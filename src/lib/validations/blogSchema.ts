// lib/validations/blogSchema.ts
import { z } from "zod";

export const createBlogSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title must be at most 200 characters"),

  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(100, "Slug must be at most 100 characters")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message:
        "Slug must be lowercase letters, numbers, and hyphens only (e.g., my-blog-blog)",
    }),

  content: z.string().trim().min(1, "Content is required"),

  contentType: z
    .enum(["markdown", "richtext"])
    .refine(
      (val): val is "markdown" | "richtext" =>
        val === "markdown" || val === "richtext",
      {
        message: "Content type must be either 'markdown' or 'richtext'",
      }
    ),

  excerpt: z
    .string()
    .trim()
    .max(500, "Excerpt must be at most 500 characters")
    .optional(),

  coverImage: z.string().trim().optional(),

  published: z.boolean().optional().default(false),

  category: z
    .string()
    .trim()
    .min(1, "Category cannot be empty")
    .max(50, "Category must be at most 50 characters")
    .optional(),
});

export const updateBlogSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title cannot be empty")
    .max(200, "Title must be at most 200 characters")
    .optional(),

  slug: z
    .string()
    .trim()
    .min(1, "Slug cannot be empty")
    .max(100, "Slug must be at most 100 characters")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message:
        "Slug must be lowercase letters, numbers, and hyphens only (e.g., my-blog-blog)",
    })
    .optional(),

  content: z.string().trim().min(1, "Content cannot be empty").optional(),

  contentType: z
    .enum(["markdown", "richtext"])
    .refine(
      (val): val is "markdown" | "richtext" =>
        val === "markdown" || val === "richtext",
      {
        message: "Content type must be either 'markdown' or 'richtext'",
      }
    ),

  excerpt: z
    .string()
    .trim()
    .max(500, "Excerpt must be at most 500 characters")
    .optional(),

  coverImage: z.string().trim().optional(),

  published: z.boolean().optional(),

  category: z
    .string()
    .trim()
    .min(1, "Category cannot be empty")
    .max(50, "Category must be at most 50 characters")
    .optional(),
});

// Type inference สำหรับใช้ใน TypeScript
export type CreateBlogInput = z.infer<typeof createBlogSchema>;
export type UpdateBlogInput = z.infer<typeof updateBlogSchema>;
