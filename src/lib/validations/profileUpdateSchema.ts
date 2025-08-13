import { z } from "zod";

export const profileUpdateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name must be at most 50 characters"),

  bio: z
    .string()
    .trim()
    .max(300, "Bio must be at most 300 characters")
    .optional()
    .or(z.literal("")),

  profileImage: z
    .string()
    .url("Invalid image URL")
    .optional()
    .or(z.literal("")),

  location: z.string().trim().max(100).optional().or(z.literal("")),

  jobTitle: z.string().trim().max(100).optional().or(z.literal("")),

  company: z.string().trim().max(100).optional().or(z.literal("")),

  education: z.string().trim().max(100).optional().or(z.literal("")),

  socialLinks: z.object({
    website: z.string().trim().url("Invalid URL").optional().or(z.literal("")),
    github: z.string().trim().url("Invalid URL").optional().or(z.literal("")),
    twitter: z.string().trim().url("Invalid URL").optional().or(z.literal("")),
    linkedin: z.string().trim().url("Invalid URL").optional().or(z.literal("")),
    instagram: z.string().trim().url("Invalid URL").optional().or(z.literal("")),
    facebook: z.string().trim().url("Invalid URL").optional().or(z.literal("")),
    youtube: z.string().trim().url("Invalid URL").optional().or(z.literal("")),
    tiktok: z.string().trim().url("Invalid URL").optional().or(z.literal("")),
  }).optional(),
});

export type ProfileFormData = z.infer<typeof profileUpdateSchema>;