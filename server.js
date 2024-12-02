const express = require("express");
const mongoose = require("mongoose");
const shortid = require("shortid");
const cors = require("cors");
require("dotenv").config(); // Load environment variables

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Atlas connection
const mongoUri = process.env.MONGO_URI;
mongoose
  .connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));

// URL Schema
const urlSchema = new mongoose.Schema({
  fullUrl: { type: String, required: true },
  shortUrl: { type: String, required: true, unique: true },
});

const Url = mongoose.model("Url", urlSchema);

// Routes
app.post("/shorten", async (req, res) => {
  const { fullUrl } = req.body;

  if (!fullUrl) return res.status(400).send("Full URL is required");

  const shortUrl = shortid.generate();
  const newUrl = new Url({ fullUrl, shortUrl });

  try {
    await newUrl.save();
    res.status(201).json({ shortUrl });
  } catch (error) {
    res.status(500).send("Error creating shortened URL");
  }
});

app.get("/:shortUrl", async (req, res) => {
  const { shortUrl } = req.params;

  try {
    const url = await Url.findOne({ shortUrl });
    if (!url) return res.status(404).send("URL not found");

    res.redirect(url.fullUrl);
  } catch (error) {
    res.status(500).send("Error fetching URL");
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
