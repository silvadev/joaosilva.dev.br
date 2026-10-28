import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const posts = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/ideas" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    translation: z.string().optional(),
    kind: z.enum(["essay", "note"]).default("note"),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    kicker: z.string().optional(),
  }),
});

export const collections = { posts };
