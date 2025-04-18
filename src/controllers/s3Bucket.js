import { listAllObjectsV2, minioClient } from "../config/s3.js";
import { createError, logger } from "../utils.js";
import { messageBroker } from "../config/broker.js";
import { MINIO_BUCKET_NAME } from "../config/env.js";

// @ts-ignore
export const generatePresignedUrl = async (req, res, next) => {
  try {
    const { filename, contentType } = req.query;

    if (!filename || !contentType) {
      logger.error(
        `Error generating pre-signed url: filename & contentType are required query params`
      );
      return res.status(400).json({
        success: false,
        message: "Please provide a filename & contentType in query params!",
      });
    }

    // Time-To-Live (TTL) for the pre-signed URL in seconds
    const TTL = 60 * 5;
    const presignedUrl = await minioClient.presignedPutObject(
      MINIO_BUCKET_NAME,
      filename,
      TTL
    );

    logger.info("Pre-signed URL generated!");
    messageBroker.publish("logs", "logs.serviceId.info", {
      level: "info",
      service: "expressPgliteAPI",
      message: `Pre-signed URL generated - ${presignedUrl}`,
    });
    res.status(200).json({
      success: true,
      message: "Pre-signed URL generated!",
      data: { url: presignedUrl },
    });
  } catch (err) {
    // @ts-ignore
    logger.error(`Error generating pre-signed url: ${err.message}`);
    messageBroker.publish("logs", "logs.serviceId.error", {
      level: "error",
      service: "expressPgliteAPI",
      // @ts-ignore
      message: `Error generating pre-signed url - ${err.message}`,
    });
    // @ts-ignore
    next(createError(500, `Error generating pre-signed url: ${err.message}`));
  }
};

// Verify File Upload(s)
// @ts-ignore
export const checkFileUpload = async (req, res, next) => {
  try {
    const { filename } = req.params;

    await minioClient.statObject(MINIO_BUCKET_NAME, filename);

    logger.info(`Filename '${filename}' exists!`);
    res.status(200).json({
      success: true,
      message: `Filename '${filename}' exists!`,
      data: { filename },
    });
  } catch (err) {
    // @ts-ignore
    if (err.code === "NotFound") {
        // @ts-ignore
        logger.error(`Error checking file upload: File not found - ${err.message}`);
    }
    // @ts-ignore
    logger.error(`Error checking file upload: ${err.message}`);
    // @ts-ignore
    next(createError(500, `Error checking file upload: ${err.message}`));
  }
};

// Get All Objects - Files inside the Bucket(s)
// @ts-ignore
export const getFiles = async (req, res, next) => {
  try {
    // @ts-ignore
    const results = await listAllObjectsV2();
    logger.info(`📄 ${results.length} files found in bucket!`);
    return res.json(results);
  } catch (err) {
    // @ts-ignore
    logger.error(`Error getting buckets: ${err.message}`);
    // @ts-ignore
    next(createError(500, `Error getting buckets: ${err.message}`));
  }
};

// Generate download URL for an object
// @ts-ignore
export const generateDownloadUrl = async (req, res, next) => {
  // const { bucket, object } = req.query;
  const { object } = req.query;
  try {
    const url = await minioClient.presignedGetObject(MINIO_BUCKET_NAME, object, 300);
    logger.info(`Object download url for object ${object}: ${url}`)
    res.json({ url });
  } catch (err) {
    // @ts-ignore
    logger.error(`Error generating downloading presigned URL: ${err.message}`);
    // @ts-ignore
    next(createError(500, `Error generating downloading presigned URL: ${err.message}`));
  }
};

