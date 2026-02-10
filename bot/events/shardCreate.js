const { Events } = require('discord.js');

module.exports = {
  name: Events.ShardCreate,
  execute(shard) {
    console.log(`Shard ${shard.id} has been created.`);
  },
};