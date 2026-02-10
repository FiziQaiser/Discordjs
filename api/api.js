require("dotenv").config();
const express = require("express");

const app = express();
app.use(express.json());

// ------------------ Simple API Auth ------------------ //
const API_KEY = process.env.API_KEY || "secret";
app.use((req, res, next) => {
    if (req.headers.authorization !== `Bearer ${API_KEY}`) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    next();
});

// ------------------ Routes ------------------ //
const pingRoute = require("./routes/ping");
app.use("/api/ping", pingRoute);

// ------------------ Start Express ------------------ //
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));