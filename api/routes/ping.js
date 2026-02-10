const express = require("express");
const router = express.Router();
const Redis = require("ioredis");

// Create Redis instance (publisher)
const redis = new Redis(process.env.REDISCLOUD_URL);

// POST /api/ping/:channelId
router.post("/:channelId", async (req, res) => {
    const { channelId } = req.params;

    try {
        // Publish a message to the bot via Redis
        await redis.publish("bot:actions", JSON.stringify({
            type: "SEND_MESSAGE",
            channelId,
            content: "Pong!"
        }));

        res.json({ success: true, message: `Pong sent to channel ${channelId}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Failed to publish action" });
    }
});

module.exports = router;