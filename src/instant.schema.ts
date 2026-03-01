// Docs: https://www.instantdb.com/docs/modeling-data

import { i } from "@instantdb/react";

const _schema = i.schema({
  entities: {
    $users: i.entity({
      email: i.string().unique().indexed().optional(),
      imageURL: i.string().optional(),
      type: i.string().optional(),
    }),
    people: i.entity({
      name: i.string().indexed(),
      birthday: i.string().optional().indexed(),
      lastContactDate: i.number().indexed(),
      memo: i.string().optional(),
      createdAt: i.number().indexed(),
    }),
    categories: i.entity({
      name: i.string().indexed(),
      order: i.number().indexed(),
      isDefault: i.boolean(),
    }),
    settings: i.entity({
      weeklyReminderEnabled: i.boolean(),
      weeklyReminderDay: i.number(),
      weeklyReminderTime: i.string(),
      birthdayReminderEnabled: i.boolean(),
      birthdayReminderDays: i.number(),
    }),
  },
  links: {
    userPeople: {
      forward: {
        on: "people",
        has: "one",
        label: "owner",
        onDelete: "cascade",
      },
      reverse: {
        on: "$users",
        has: "many",
        label: "people",
      },
    },
    userCategories: {
      forward: {
        on: "categories",
        has: "one",
        label: "owner",
        onDelete: "cascade",
      },
      reverse: {
        on: "$users",
        has: "many",
        label: "categories",
      },
    },
    userSettings: {
      forward: {
        on: "settings",
        has: "one",
        label: "owner",
        onDelete: "cascade",
      },
      reverse: {
        on: "$users",
        has: "one",
        label: "settings",
      },
    },
    peopleCategories: {
      forward: {
        on: "people",
        has: "many",
        label: "categories",
      },
      reverse: {
        on: "categories",
        has: "many",
        label: "people",
      },
    },
  },
});

// This helps TypeScript display nicer intellisense
type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
