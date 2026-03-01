const mongoose = require("mongoose");

const scanLogSchema = new mongoose.Schema({
  medicalId: { type: mongoose.Schema.Types.ObjectId, ref: "Medical" },
  scannedAt: { type: Date, default: Date.now },
  ipAddress: String,
  userAgent: String
});

module.exports = mongoose.model("ScanLog", scanLogSchema);