import { config } from "dotenv";

config();

const NODE_ENV = String(process.env.NODE_ENV);

const PG_DATA = String(process.env.PG_DATA);

const RABBITMQ_URL = String(process.env.RABBITMQ_URL);

const MINIO_ENDPOINT = String(process.env.MINIO_ENDPOINT);
const MINIO_PORT = parseInt(String(process.env.MINIO_PORT));
const MINIO_ACCESS_KEY = String(process.env.MINIO_ACCESS_KEY);
const MINIO_SECRET_KEY = String(process.env.MINIO_SECRET_KEY);
const MINIO_BUCKET_NAME = String(process.env.MINIO_BUCKET_NAME);

export {
  NODE_ENV,
  PG_DATA,
  RABBITMQ_URL,
  MINIO_ENDPOINT,
  MINIO_PORT,
  MINIO_ACCESS_KEY,
  MINIO_SECRET_KEY,
  MINIO_BUCKET_NAME,
};
