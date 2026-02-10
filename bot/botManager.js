require("dotenv").config();
const { ShardingManager } = require("discord.js");

const manager = new ShardingManager("./bot/botShard.js", {
    token: process.env.BOT_TOKEN,
    totalShards: 2,
});

manager.on("shardCreate", shard => {
    console.log(`Launched shard ${shard.id}`);
});

manager.spawn();