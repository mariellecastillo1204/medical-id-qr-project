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

/* =======================
   DATABASE
======================= */

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
   AUTH MIDDLEWARE (FIXED)
======================= */

const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header)
    return res.status(401).json({ message: "No token provided" });

  if (!header.startsWith("Bearer "))
    return res.status(401).json({ message: "Invalid token format" });

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

/* =======================
   ROOT
======================= */

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "client/index.html"));
});

/* =======================
   AUTH ROUTES
======================= */

app.post("/api/auth/signup", async (req, res) => {
  const { email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing)
    return res.status(400).json({ message: "User already exists" });

  const hashed = await bcrypt.hash(password, 10);

  await new User({ email, password: hashed }).save();

  res.status(201).json({ message: "Account created successfully" });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user)
    return res.status(400).json({ message: "Invalid credentials" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid)
    return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({ token });
});

/* =======================
   CREATE OR UPDATE PROFILE
======================= */

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

/* =======================
   GET PROFILE
======================= */

app.get("/api/profile", authMiddleware, async (req, res) => {
  const profile = await MedicalProfile.findOne({ user: req.user.id });

  if (!profile)
    return res.status(404).json({ message: "Profile not found" });

  res.json(profile);
});

/* =======================
   REGENERATE QR
======================= */

app.post("/api/profile/regenerate-qr", authMiddleware, async (req, res) => {

  const newToken = crypto.randomBytes(16).toString("hex");

  const profile = await MedicalProfile.findOneAndUpdate(
    { user: req.user.id },
    { qrToken: newToken },
    { new: true }
  );

  if (!profile)
    return res.status(404).json({ message: "Profile not found" });

  res.json({ message: "QR regenerated", qrToken: newToken });
});

/* =======================
   PUBLIC PROFILE (STYLED)
======================= */

app.get("/public-profile/:token", async (req, res) => {

  const profile = await MedicalProfile.findOne({
    qrToken: req.params.token
  });

  if (!profile)
    return res.send("<h2>Invalid or expired QR Code</h2>");

  res.send(`
  <!DOCTYPE html>
  <html>
  <head>
    <title>Medical Identification</title>
    <style>
      body {
        margin:0;
        padding:0;
        background:#58111A;
        font-family:Arial;
        color:white;
        display:flex;
        justify-content:center;
        align-items:center;
        min-height:100vh;
      }

      .card {
        background:#3D0C02;
        padding:40px;
        border-radius:12px;
        width:500px;
        box-shadow:0 0 20px rgba(0,0,0,0.6);
      }

      h2 {
        text-align:center;
        margin-bottom:25px;
      }

      p {
        margin:8px 0;
      }

      strong {
        color:#ffcccc;
      }

      hr {
        border:0;
        height:1px;
        background:#660000;
        margin:20px 0;
      }
    </style>
  </head>
  <body>

  <div class="card">
    <h2>Medical Identification Profile</h2>

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
    <p><strong>Allergies:</strong> ${profile.allergies}</p>
    <p><strong>Medications:</strong> ${profile.medications}</p>
    <p><strong>Conditions:</strong> ${profile.medicalConditions}</p>
    <p><strong>Past Illness:</strong> ${profile.pastIllness || "N/A"}</p>
    <p><strong>Family History:</strong> ${profile.familyHistory || "N/A"}</p>

    <hr>

    <h3>Insurance</h3>
    <p><strong>PhilHealth:</strong> ${profile.philhealth || "N/A"}</p>
    <p><strong>HMO:</strong> ${profile.hmo || "N/A"}</p>
  </div>

  </body>
  </html>
  `);
});

/* =======================
   START SERVER
======================= */

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running on port " + PORT));