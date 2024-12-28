// core/models/LawFirm.js
const mongoose = require("mongoose");

const LawFirmSchema = new mongoose.Schema(
  {
    firmId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    branding: {
      logo: String,
      styles: String,
    },
    configurations: {
      // Add any additional configuration fields as needed
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("LawFirm", LawFirmSchema);
