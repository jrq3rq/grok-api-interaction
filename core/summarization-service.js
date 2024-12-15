const axios = require("axios");

async function summarizeWithGrok(text) {
  try {
    // Replace this with your AI API call for summarization
    const response = await axios.post(
      "https://api.openai.com/v1/engines/davinci-codex/completions",
      {
        prompt: `Summarize the following text in the least amount of words, focusing on the most important points:\n\n${text}`,
        max_tokens: 100, // Adjust token limit as needed
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, // Use your API key from environment variables
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.choices[0].text.trim();
  } catch (error) {
    console.error("Error in summarizeWithGrok:", error.message);
    throw new Error("Summarization service failed.");
  }
}

module.exports = { summarizeWithGrok };
