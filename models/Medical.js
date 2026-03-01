const mongoose = require("mongoose");

const medicalSchema = new mongoose.Schema({

  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  firstName: String,
  middleName: String,
  lastName: String,
  bloodType: String,
  contactNumber: String,

  emergencyFirstName: String,
  emergencyNumber: String,

  allergies: String,
  medications: String,
  medicalConditions: String,

  publicToken: { type: String, unique: true },
  qrCode: String,

  status: { type: String, default: "active" } // active, lost, disabled

}, { timestamps: true });

module.exports = mongoose.model("Medical", medicalSchema);