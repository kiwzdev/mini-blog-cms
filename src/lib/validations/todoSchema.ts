import { z } from "zod";

export const todoSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(100, "Title must be at most 100 characters"),

  description: z
    .string()
    .trim()
    .max(500, "Description must be at most 500 characters")
    .optional(),

  dueDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Invalid date format",
    }),

  tags: z
    .array(z.string().trim().min(1))
    .max(5, "You can enter up to 5 tags only")
    .refine((tags) => new Set(tags).size === tags.length, {
      message: "Tags must be unique",
    })
    .optional(),

  priority: z.enum(["low", "medium", "high"]),
});

export const todoUpdateSchema = todoSchema.extend({
  id: z.string(),
});
