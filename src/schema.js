import { boolean, pgTable, serial, text } from "drizzle-orm/pg-core";

export const tasks = pgTable("tasks", {
  id: serial("id").notNull().primaryKey().unique(),
  public_id: text("public_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  completed: boolean("completed", { mode: "boolean" }).notNull().default(false),
});
