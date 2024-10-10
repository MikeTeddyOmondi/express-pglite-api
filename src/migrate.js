import { config } from "dotenv";
import { migrate } from "drizzle-orm/pglite/migrator";
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";

config();

const pgliteClient = new PGlite("./db/data");

const db = drizzle(pgliteClient);

migrate(db, { migrationsFolder: "db" });
