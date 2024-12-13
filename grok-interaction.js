require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { interactWithGrok } = require("./core/ai-service");

const app = express();
app.use(express.json());
app.use(cors());

// Endpoint to handle chat requests
app.post("/chat", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "No prompt provided." });
  }

  try {
    const response = await interactWithGrok(prompt);
    res.json({ response });
  } catch (error) {
    console.error("Error in /chat:", error.message);
    res.status(500).json({ error: "Internal server error." });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
