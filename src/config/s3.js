import { Client } from "minio";

import { logger } from "../utils.js";

import {
  NODE_ENV,
  MINIO_PORT,
  MINIO_ENDPOINT,
  MINIO_ACCESS_KEY,
  MINIO_SECRET_KEY,
  MINIO_BUCKET_NAME,
} from "./env.js";

export const minioClient = new Client({
  endPoint: MINIO_ENDPOINT,
  port: MINIO_PORT,
  useSSL: NODE_ENV === "production" ? true : false,
  accessKey: MINIO_ACCESS_KEY,
  secretKey: MINIO_SECRET_KEY,
});

const bucketName = MINIO_BUCKET_NAME;

export async function ensureBucketExists() {
  try {
    const exists = await minioClient.bucketExists(bucketName);
    logger.info(`Bucket '${bucketName}' exists!`);
    if (!exists) {
      await minioClient.makeBucket(bucketName);
      logger.info(`Bucket '${bucketName}' created!`);
    }
  } catch (error) {
    logger.error({ error }, "Error ensuring bucket exists!");
  }
}
