import { drizzle } from "drizzle-orm/pglite";
import { PGlite } from "@electric-sql/pglite";

import { tasks } from "../schema.js";
import { PG_DATA } from "./env.js";

const pgliteClient = new PGlite(PG_DATA);

export const db = drizzle(pgliteClient, { schema: { tasks } });

// await pgliteClient.exec(`
//   CREATE TABLE IF NOT EXISTS "tasks"(
//     "id" integer PRIMARY KEY NOT NULL,
//     "public_id" text NOT NULL,
//     "title" text NOT NULL,
//     "description" text NOT NULL,
//     "completed" boolean DEFAULT false NOT NULL,
//     CONSTRAINT "tasks_id_unique" UNIQUE("id")
//   );
// `)
