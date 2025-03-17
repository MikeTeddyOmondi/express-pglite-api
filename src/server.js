import cors from "cors";
import express from "express";

import routes from "./routes.js";
import { NODE_ENV } from "./config/env.js";
import { createError, logger } from "./utils.js";
import { messageBroker } from "./config/broker.js";
import { ensureBucketExists } from "./config/s3.js";

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(routes);

// Root route
app.get("/", (req, res, next) => {
  messageBroker.publish("logs", "logs.serviceId.info", {
    level: "info",
    service: "expressPgliteAPI",
    message: "Index route log(s)",
  });
  logger.info({ success: true, message: "Application works!" });
  return res.json({ success: true, message: "Application works!" });
});

// 404 route
app.get("*", (req, res, next) => {
  logger.error("Resource Not Found!");
  next(createError(500, `Resource Not Found!`));
});

// Error Middleware
// @ts-ignore
app.use((err, req, res, next) => {
  const errorStatus = err.status || 500;
  const errorMessage = err.message || "Something went wrong!";
  logger.error(`Error: ${err.message}`);
  messageBroker.publish("logs", "logs.serviceId.error", {
    level: "info",
    service: "expressPgliteAPI",
    message: `Error middleware log(s): ${errorMessage}`,
  });
  return res.status(errorStatus).json({
    success: false,
    data: {
      message: errorMessage,
    },
    stack: NODE_ENV === "production" ? {} : err.stack,
  });
});

const PORT = process.env.PORT || 3489;

app.listen(PORT, async () => {
  await ensureBucketExists();
  await messageBroker.init();
  await messageBroker.createExchange("logs", "topic");
  console.log(`Server listening for requests: http://localhost:${PORT}`);
});
