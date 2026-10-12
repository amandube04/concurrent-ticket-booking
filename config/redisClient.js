const { createClient } = require("redis");

const redisClient = createClient({ url: "redis://localhost:6379" });

redisClient.on("error", (err) => console.error("❌ Redis Client Error:", err));
redisClient.on("connect", () => console.log("🔄 Connecting to Redis..."));
redisClient.on("ready", () =>
  console.log("✅ Redis Client Connected and Ready!"),
);

redisClient
  .connect()
  .catch((err) => console.error("Redis connect failed:", err));

module.exports = redisClient;
