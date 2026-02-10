const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("shardstatus")
    .setDescription("Shows number of shards and guilds per shard"),
  async execute(interaction) {
    // Number of shards
    const totalShards = interaction.client.shard.count;

    // Get guild counts for each shard
    const guildCounts = await interaction.client.shard.fetchClientValues("guilds.cache.size");
    // guildCounts is an array: [shard0Count, shard1Count, ...]

    let reply = `**Total Shards:** ${totalShards}\n\n`;
    guildCounts.forEach((count, index) => {
      reply += `Shard ${index}: ${count} guilds\n`;
    });

    await interaction.reply(reply);
  },
};