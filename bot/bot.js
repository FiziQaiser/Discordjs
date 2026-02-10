require("dotenv").config();
const fs = require("fs");
const path = require("path");
const Redis = require("ioredis");
const { Client, Collection, GatewayIntentBits } = require("discord.js");

// ------------------ Discord Bot ------------------ //
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

client.commands = new Collection();

// Load commands
const commandsPath = path.join(__dirname, "commands");
if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith(".js"));
    for (const file of commandFiles) {
        const command = require(path.join(commandsPath, file));
        if ("data" in command && "execute" in command) {
            client.commands.set(command.data.name, command);
            console.log(`Loaded command ${command.data.name}`);
        }
    }
}

// Load events
const eventsPath = path.join(__dirname, "events");
if (fs.existsSync(eventsPath)) {
    const eventFiles = fs.readdirSync(eventsPath).filter(f => f.endsWith(".js"));
    for (const file of eventFiles) {
        const event = require(path.join(eventsPath, file));
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
    else console.log(`Subscribed to ${count} Redis channels`);
});

redis.on("message", async (channel, message) => {
    if (channel !== "bot:actions") return;
    try {
        const { type, channelId, content } = JSON.parse(message);
        if (type === "SEND_MESSAGE") {
            const discordChannel = await client.channels.fetch(channelId);
            await discordChannel.send(content);
            console.log(`Sent message to ${channelId}`);
        }
    } catch (err) {
        console.error("Failed to handle bot action:", err);
    }
});

// ------------------ Login ------------------ //
client.login(process.env.BOT_TOKEN);