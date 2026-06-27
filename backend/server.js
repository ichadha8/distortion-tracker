require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const BUNGIE_API_KEY = process.env.BUNGIE_API_KEY;

// test route
app.get("/", (req, res) => {
  res.json({ message: "Destiny backend is running" });
});

// test Bungie API connection
app.get("/api/test-bungie", async (req, res) => {
  try {
    if (!BUNGIE_API_KEY) {
      return res.status(400).json({ error: "BUNGIE_API_KEY not set in .env" });
    }

    const response = await fetch(
      "https://www.bungie.net/Platform/Destiny2/",
      {
        headers: {
          "X-API-Key": BUNGIE_API_KEY,
        },
      }
    );

    const data = await response.json();

    res.json({ 
      success: true, 
      message: "Successfully connected to Bungie API",
      responseStatus: data.Response?.ErrorStatus || "OK"
    });
  } catch (error) {
    console.error("Bungie API error:", error);
    res.status(500).json({ error: "Failed to connect to Bungie API", details: error.message });
  }
});

// example Bungie API proxy route
app.get("/api/search-player", async (req, res) => {
  try {
    const name = req.query.name;

    if (!name) {
      return res.status(400).json({ error: "Missing player name" });
    }

    const response = await fetch(
      `https://www.bungie.net/Platform/Destiny2/SearchDestinyPlayer/-1/${encodeURIComponent(
        name
      )}/`,
      {
        headers: {
          "X-API-Key": BUNGIE_API_KEY,
        },
      }
    );

    const data = await response.json();

    res.json(data);
  } catch (error) {
    console.error("Bungie API error:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});