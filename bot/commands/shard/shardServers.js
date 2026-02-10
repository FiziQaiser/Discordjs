const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("shardservers")
    .setDescription("Lists servers for each shard"),
  async execute(interaction) {
    // Fetch all guild names per shard
    const allGuilds = await interaction.client.shard.broadcastEval(client => {
      return client.guilds.cache.map(g => g.name);
    });

    // allGuilds is an array of arrays: [[shard0Guilds], [shard1Guilds], ...]
    let reply = "";
    allGuilds.forEach((guilds, index) => {
      reply += `**Shard ${index}** (${guilds.length} guilds):\n`;
      reply += guilds.join(", ") + "\n\n";
    });

    // Send reply (truncate if too long)
    if (reply.length > 2000) reply = reply.slice(0, 1997) + "...";
    await interaction.reply(reply);
  },
};