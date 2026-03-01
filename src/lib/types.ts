import type { AppSchema } from "@/instant.schema";
import type { InstaQLEntity } from "@instantdb/react";

export type Person = InstaQLEntity<
  AppSchema,
  "people",
  { categories: {} }
>;

export type Category = InstaQLEntity<AppSchema, "categories">;

export type PersonWithCategories = InstaQLEntity<
  AppSchema,
  "people",
  { categories: {} }
>;
