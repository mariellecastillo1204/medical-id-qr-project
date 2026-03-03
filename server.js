const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const crypto = require("crypto");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "client")));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

/* =======================
   MODELS
======================= */

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  role: { type: String, default: "user" }
});

const User = mongoose.model("User", userSchema);

const medicalProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  qrToken: { type: String, unique: true },

  firstName: String,
  middleName: String,
  lastName: String,
  sex: String,
  dob: Date,
  bloodType: String,
  contactNumber: String,
  religion: String,

  emergencyFirstName: String,
  emergencyMiddleName: String,
  emergencyLastName: String,
  emergencyRelationship: String,
  emergencyContactNumber: String,

  allergies: String,
  medications: String,
  medicalConditions: String,
  pastIllness: String,
  familyHistory: String,

  philhealth: String,
  hmo: String
});

const MedicalProfile = mongoose.model("MedicalProfile", medicalProfileSchema);

/* =======================
   AUTH MIDDLEWARE
======================= */

const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ message: "No token" });

  const token = header.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Invalid token format" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

/* =======================
   ROUTES
======================= */

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "client/index.html"));
});

/* AUTH */

app.post("/api/auth/signup", async (req, res) => {
  const { email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) return res.json({ message: "User already exists" });

  const hashed = await bcrypt.hash(password, 10);

  await new User({ email, password: hashed }).save();
  res.json({ message: "Account created successfully" });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.json({ message: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.json({ message: "Invalid credentials" });

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({ token });
});

/* PROFILE CREATE OR UPDATE */

app.post("/api/profile", authMiddleware, async (req, res) => {

  let profile = await MedicalProfile.findOne({ user: req.user.id });

  if (!profile) {
    profile = new MedicalProfile({
      ...req.body,
      user: req.user.id,
      qrToken: crypto.randomBytes(16).toString("hex")
    });
  } else {
    Object.assign(profile, req.body);
  }

  await profile.save();

  res.json({ message: "Profile saved successfully" });
});

/* GET PROFILE */

app.get("/api/profile", authMiddleware, async (req, res) => {
  const profile = await MedicalProfile.findOne({ user: req.user.id });
  res.json(profile);
});

/* REGENERATE QR */

app.post("/api/profile/regenerate-qr", authMiddleware, async (req, res) => {

  const newToken = crypto.randomBytes(16).toString("hex");

  await MedicalProfile.findOneAndUpdate(
    { user: req.user.id },
    { qrToken: newToken }
  );

  res.json({ message: "QR regenerated", qrToken: newToken });
});

/* PUBLIC PROFILE (FULL DATA DISPLAY) */

app.get("/public-profile/:token", async (req, res) => {

  const profile = await MedicalProfile.findOne({
    qrToken: req.params.token
  });

  if (!profile) return res.send("<h2>Invalid or expired QR Code</h2>");

  res.send(`
    <h1>Medical Identification</h1>
    <p><strong>Name:</strong> ${profile.firstName} ${profile.middleName || ""} ${profile.lastName}</p>
    <p><strong>Sex:</strong> ${profile.sex}</p>
    <p><strong>Date of Birth:</strong> ${profile.dob?.toDateString()}</p>
    <p><strong>Blood Type:</strong> ${profile.bloodType}</p>
    <p><strong>Contact:</strong> ${profile.contactNumber}</p>
    <p><strong>Religion:</strong> ${profile.religion}</p>

    <hr>

    <h3>Emergency Contact</h3>
    <p>${profile.emergencyFirstName} ${profile.emergencyMiddleName || ""} ${profile.emergencyLastName}</p>
    <p>${profile.emergencyRelationship}</p>
    <p>${profile.emergencyContactNumber}</p>

    <hr>

    <h3>Medical Information</h3>
    <p>Allergies: ${profile.allergies}</p>
    <p>Medications: ${profile.medications}</p>
    <p>Conditions: ${profile.medicalConditions}</p>
    <p>Past Illness: ${profile.pastIllness || "N/A"}</p>
    <p>Family History: ${profile.familyHistory || "N/A"}</p>

    <hr>

    <h3>Insurance</h3>
    <p>PhilHealth: ${profile.philhealth || "N/A"}</p>
    <p>HMO: ${profile.hmo || "N/A"}</p>
  `);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running"));