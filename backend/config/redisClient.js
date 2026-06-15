// import { Redis } from "@upstash/redis";
// import dotenv from "dotenv";

// dotenv.config();

// // The SDK looks for these exact environment variables to connect via REST HTTPS
// const redis = new Redis({
//   url: process.env.UPSTASH_REDIS_REST_URL,
//   token: process.env.UPSTASH_REDIS_REST_TOKEN,
// });

// export default redis;
import { Redis } from "@upstash/redis";
import dotenv from "dotenv";

dotenv.config();

// The SDK looks for these exact environment variables to connect via REST HTTPS
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default redis;