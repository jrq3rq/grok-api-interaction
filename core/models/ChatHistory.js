// core/models/ChatHistory.js
const mongoose = require("mongoose");

const ChatHistorySchema = new mongoose.Schema(
  {
    firmId: {
      type: String,
      required: true,
      index: true, // For faster queries by firmId
    },
    userMessage: {
      type: String,
      required: true,
    },
    aiResponse: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      enum: ["chat", "summarize", "generate-bullet-points", "draft-summary"],
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChatHistory", ChatHistorySchema);
