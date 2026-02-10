const { ShardingManager } = require("discord.js");
require("dotenv").config();

// Parse the shard IDs from environment variable
const shardIDs = process.env.SHARD_IDS?.split(",").map(Number);

const manager = new ShardingManager("./bot/botShard.js", {
  token: process.env.BOT_TOKEN,
  totalShards: 4,  // total number of shards for your bot
  shards: shardIDs, // only spawn these shards on this dyno
});

manager.on("shardCreate", shard => {
  console.log(`Launched shard ${shard.id}`);
});

manager.spawn();