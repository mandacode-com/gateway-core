import { createClient } from "redis";
import config from ".";

export const redis = createClient({
  url: config.redis.url,
}); 
