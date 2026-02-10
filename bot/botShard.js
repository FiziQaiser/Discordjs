require("dotenv").config();
const fs = require("fs");
const path = require("path");
const Redis = require("ioredis");
const { Client, Collection, GatewayIntentBits } = require("discord.js");

// ------------------ Create client for this shard ------------------ //
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

// ------------------ Commands (recursive loader) ------------------ //
client.commands = new Collection();

const loadCommands = (dir) => {
    if (!fs.existsSync(dir)) return;

    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            // Recurse into subfolder
            loadCommands(fullPath);
        } else if (entry.isFile() && entry.name.endsWith(".js")) {
            const command = require(fullPath);
            if ("data" in command && "execute" in command) {
                client.commands.set(command.data.name, command);
                console.log(`Shard ${client.shard?.ids[0] || "?"} Loaded command ${command.data.name}`);
            } else {
                console.log(`[WARNING] Invalid command file: ${fullPath}`);
            }
        }
    }
};

const commandsPath = path.join(__dirname, "commands");
loadCommands(commandsPath);

// Log all loaded commands
console.log(`Shard ${client.shard?.ids[0] || "?"} commands:`, Array.from(client.commands.keys()));

// ------------------ Events ------------------ //
const eventsPath = path.join(__dirname, "events");
if (fs.existsSync(eventsPath)) {
    const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith(".js"));
    for (const file of eventFiles) {
        const event = require(path.join(eventsPath, file));
        console.log(`Shard ${client.shard?.ids[0] || "?"} Loaded event ${event.name}`);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args));
        } else {
            client.on(event.name, (...args) => event.execute(...args));
        }
    }
}

// ------------------ Redis Subscriber ------------------ //
const redis = new Redis(process.env.REDISCLOUD_URL);

redis.subscribe("bot:actions", (err, count) => {
    if (err) console.error(err);
    else console.log(`Shard ${client.shard?.ids[0] || "?"} subscribed to ${count} Redis channels`);
});

redis.on("message", async (channel, message) => {
    if (channel !== "bot:actions") return;
    try {
        const { type, channelId, content } = JSON.parse(message);
        if (type === "SEND_MESSAGE") {
            const discordChannel = await client.channels.fetch(channelId).catch(() => null);
            if (!discordChannel) return;
            await discordChannel.send(content);
            console.log(`Shard ${client.shard?.ids[0] || "?"} sent message to ${channelId}`);
        }
    } catch (err) {
        console.error("Failed to handle bot action:", err);
    }
});

// ------------------ Login ------------------ //
client.login(process.env.BOT_TOKEN);