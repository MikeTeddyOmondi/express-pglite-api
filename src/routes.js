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
  generateDownloadUrl,
  generatePresignedUrl,
  getFiles,
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

routes.get("/get-files", getFiles);

routes.get("/generate-download-url", generateDownloadUrl);

export default routes;
