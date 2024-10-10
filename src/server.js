import cors from "cors";
import express from "express";
import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";
import { drizzle } from "drizzle-orm/pglite";
import { PGlite } from "@electric-sql/pglite";

import { tasks } from "./schema.js";
import { createError, logger } from "./utils.js";

config();

const pgliteClient = new PGlite("./db/data/");

const db = drizzle(pgliteClient, { schema: { tasks } });

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

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "*",
    credentials: true,
  }),
);

// Root route
app.get("/", (req, res, next) => {
  logger.info({ success: true, message: "Application works!" });
  res.json({ success: true, message: "Application works!" });
});

app.get("/tasks", async (req, res, next) => {
  try {
    const result = await db.select().from(tasks);
    logger.info("Task(s) read!");
    res.json({ success: true, message: "Task(s) read!", data: result });
  } catch (err) {
    logger.error(`Error reading task(s): ${err.message}`);
    next(createError(500, `Error reading task(s): ${err.message}`));
  }
});

app.post("/tasks", async (req, res, next) => {
  try {
    const public_id = uuid();
    const { title, description } = req.body;
    if (title === "" || description === "") {
      logger.error(
        "Error creating task(s): Please provide a title & a description",
      );
      return res.status(400).json({
        success: false,
        message: "Please provide a title & a description!",
      });
    }

    const result = await db
      .insert(tasks)
      .values({ public_id, title, description })
      .returning();

    // console.log(result);

    logger.info("Task(s) created!");
    res
      .status(201)
      .json({ success: true, message: "Task(s) created!", data: result[0] });
  } catch (err) {
    console.log({ err });
    logger.error(`Error creating task(s): ${err.message}`);
    next(createError(500, `Error creating task(s): ${err.message}`));
  }
});

app.get("/tasks/:pid", async (req, res, next) => {
  try {
    const { pid } = req.params;
    const result = await db
      .select()
      .from(tasks)
      .where(eq(tasks.public_id, pid));

    if (result.length === 0) {
      logger.error(`Tasks(s): ${pid} not found!`);
      return res.status(404).json({
        success: false,
        message: "Task(s) not found!",
      });
    }

    logger.info("Task(s) read");
    res.json({ success: true, message: "Task(s) read!", data: result });
  } catch (err) {
    logger.error(`Error reading task(s): ${err.message}`);
    next(createError(500, `Error reading task(s): ${err.message}`));
  }
});

app.put("/tasks/:pid", async (req, res, next) => {
  try {
    const { pid } = req.params;
    const { title, description } = req.body;
    if (title === "" || description === "") {
      logger.error(
        "Error updating task(s): Please provide a title & a description to update!",
      );
      return res.status(400).json({
        success: false,
        message: "Please provide a title & a description to update!",
      });
    }

    const result = await db
      .update(tasks)
      .set({ title, description })
      .where(eq(tasks.public_id, pid))
      .returning();

    logger.info(`Task(s): ${pid} updated!`);
    res.json({
      success: true,
      message: "Task(s) updated!",
      data: result[0],
    });
  } catch (err) {
    logger.error(`Error updating task(s): ${err.message}`);
    next(createError(500, `Error reading task(s): ${err.message}`));
  }
});

app.put("/tasks/complete/:pid", async (req, res, next) => {
  try {
    const { pid } = req.params;
    const fetchResult = await db
      .select()
      .from(tasks)
      .where(eq(tasks.public_id, pid));
    const result = await db
      .update(tasks)
      .set({ completed: fetchResult[0].completed ? false : true })
      .where(eq(tasks.public_id, pid))
      .returning();

    logger.info(`Task(s): ${pid} completed!`);
    res.json({
      success: true,
      message: "Task(s) completed!",
      data: result[0],
    });
  } catch (error) {
    logger.error(`Error completing task(s): ${error.message}`);
    next(createError(500, `Error completing task(s): ${err.message}`));
  }
});

app.delete("/tasks/:pid", async (req, res, next) => {
  try {
    const { pid } = req.params;
    const result = await db
      .delete(tasks)
      .where(eq(tasks.public_id, pid))
      .returning();
    if (result.length === 0) {
      logger.error(`Error deleting task(s): ${pid} not found!`);
      return res.status(404).json({
        success: false,
        message: `Task(s): ${pid} not found!`,
      });
    }
    res.json({
      success: true,
      message: `Task(s): ${pid} deleted!`,
      data: result,
    });
  } catch (err) {
    logger.error(`Error deleting task(s): ${error.message}`);
    next(createError(500, `Error deleting task(s): ${err.message}`));
  }
});

// 404 route
app.get("*", (req, res, next) => {
  logger.error("Resource Not Found!");
  next(createError(500, `Resource Not Found!`));
});

// Error Middleware
app.use((err, req, res, next) => {
  const errorStatus = err.status || 500;
  const errorMessage = err.message || "Something went wrong!";
  logger.error(`Error: ${err.message}`);
  return res.status(errorStatus).json({
    success: false,
    data: {
      message: errorMessage,
    },
    stack: process.env.NODE_ENV === "production" ? {} : err.stack,
  });
});

const PORT = process.env.PORT || 3489;

app.listen(PORT, () => {
  console.log(`Server listening for requests: http://localhost:${PORT}`);
});
