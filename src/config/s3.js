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

// List all object in a specific bucket
// @ts-ignore
export function listAllObjectsV2() {
  return new Promise((resolve, reject) => {
    // @ts-ignore
    const objects = [];
    const stream = minioClient.listObjectsV2(bucketName, '', true, '');
    stream.on('data', obj => objects.push(obj));
    stream.on('error', err => reject(err));
    // @ts-ignore
    stream.on('end', () => resolve(objects));
  });
}

// Get Object from Multiple buckets
export async function getAllObjectsFromBuckets () {
  const results = {};
  const buckets = await minioClient.listBuckets();

  // Parallelize listing across buckets
  await Promise.all(buckets.map(async b => {
    // @ts-ignore
    results[b.name] = await listAllObjectsV2(b.name);
  }));

  // @ts-ignore
  return results;
}