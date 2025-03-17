import express from "express";

import {
  completeTask,
  createTask,
  deleteTask,
  getAllTasks,
  getSingleTask,
  updateTask,
} from "./controllers/tasks.js";
import {
  checkFileUpload,
  generatePresignedUrl,
} from "./controllers/s3Bucket.js";

const routes = express.Router();

routes.get("/tasks", getAllTasks);

routes.post("/tasks", createTask);

routes.get("/tasks/:pid", getSingleTask);

routes.put("/tasks/:pid", updateTask);

routes.put("/tasks/complete/:pid", completeTask);

routes.delete("/tasks/:pid", deleteTask);

routes.get("/generate-presigned-url/", generatePresignedUrl);

routes.get("/check-file-upload/:filename", checkFileUpload);

export default routes;
