const { createClient } = require("redis");

const redisClient = createClient({
  url: "redis://localhost:6379",
});

redisClient.on("error", (err) => {
  console.log("Redis Client Error", err);
});

redisClient.connect();
console.log("Redis connected successfully");

module.exports = redisClient;
