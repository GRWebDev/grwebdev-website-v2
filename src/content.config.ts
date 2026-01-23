import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const board = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "src/content/Board" }),
  schema: z.object({
    title: z.string().optional(),
    name: z.string(),
    image: z.object({
      src: z.string(),
      alt: z.string(),
    }),
    shortDescription: z.string(),
    slug: z.string(),
    joinDate: z.date(),
    active: z.boolean()
  }),
});

const sponsors = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "src/content/Sponsors" }),
  schema: z.object({
    level: z.string(),
    name: z.string(),
    image: z.object({
      src: z.string(),
      alt: z.string(),
    }),
    shortDescription: z.string(),
    url: z.string(),
    slug: z.string(),
    joinDate: z.date(),
    active: z.boolean(),
  })
})

const events = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "src/content/Events" }),
  schema: z.object({
    name: z.string(),
    image: z.object({
      src: z.string(),
      alt: z.string(),
    }),
    url: z.string(),
    date: z.date(),

  })
})
export const collections = { board, sponsors, events };
