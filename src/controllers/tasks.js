import { eq } from "drizzle-orm";
import { v4 as uuid } from "uuid";

import { tasks } from "../schema.js";
import { db } from "../config/database.js";
import { createError, logger } from "../utils.js";
import { messageBroker } from "../config/broker.js";

// @ts-ignore
export const getAllTasks = async (req, res, next) => {
  try {
    const result = await db.select().from(tasks);
    messageBroker.publish("logs", "logs.serviceId.info", {
      level: "info",
      service: "expressPgliteAPI",
      message: "Get All Tasks route log(s)",
    });
    logger.info("Task(s) read!");
    return res.json({ success: true, message: "Task(s) read!", data: result });
  } catch (err) {
    // @ts-ignore
    logger.error(`Error reading task(s): ${err.message}`);
    // @ts-ignore
    next(createError(500, `Error reading task(s): ${err.message}`));
  }
};

// @ts-ignore
export const getSingleTask = async (req, res, next) => {
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
    // @ts-ignore
    logger.error(`Error reading task(s): ${err.message}`);
    // @ts-ignore
    next(createError(500, `Error reading task(s): ${err.message}`));
  }
};

// @ts-ignore
export const createTask = async (req, res, next) => {
  try {
    const public_id = uuid();
    const { title, description } = req.body;
    if (title === "" || description === "") {
      logger.error(
        "Error creating task(s): Please provide a title & a description"
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
    // @ts-ignore
    logger.error(`Error creating task(s): ${err.message}`);
    // @ts-ignore
    next(createError(500, `Error creating task(s): ${err.message}`));
  }
};

// @ts-ignore
export const updateTask = async (req, res, next) => {
  try {
    const { pid } = req.params;
    const { title, description } = req.body;
    if (title === "" || description === "") {
      logger.error(
        "Error updating task(s): Please provide a title & a description to update!"
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
    // @ts-ignore
    logger.error(`Error updating task(s): ${err.message}`);
    // @ts-ignore
    next(createError(500, `Error reading task(s): ${err.message}`));
  }
};

// @ts-ignore
export const completeTask = async (req, res, next) => {
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
    // @ts-ignore
    logger.error(`Error completing task(s): ${error.message}`);
    // @ts-ignore
    next(createError(500, `Error completing task(s): ${err.message}`));
  }
};

// @ts-ignore
export const deleteTask = async (req, res, next) => {
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
    // @ts-ignore
    logger.error(`Error deleting task(s): ${error.message}`);
    // @ts-ignore
    next(createError(500, `Error deleting task(s): ${err.message}`));
  }
};
