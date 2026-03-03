const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

/* ================== DATABASE ================== */

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Error:", err));

/* ================== MODELS ================== */

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const User = mongoose.model("User", userSchema);

const medicalProfileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  firstName: { type: String, required: true },
  middleName: String,
  lastName: { type: String, required: true },
  sex: { type: String, required: true },
  dob: { type: Date, required: true },
  bloodType: { type: String, required: true },
  contactNumber: { type: String, required: true },
  religion: { type: String, required: true },

  emergencyFirstName: { type: String, required: true },
  emergencyMiddleName: String,
  emergencyLastName: { type: String, required: true },
  relationship: { type: String, required: true },
  emergencyContactNumber: { type: String, required: true },

  allergies: { type: String, required: true },
  medications: { type: String, required: true },
  medicalConditions: { type: String, required: true },

  pastIllness: String,
  familyHistory: String,

  philhealth: String,
  hmo: String
}, { timestamps: true });

const MedicalProfile = mongoose.model("MedicalProfile", medicalProfileSchema);

/* ================== MIDDLEWARE ================== */

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "client")));

/* ================== AUTH ================== */

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

/* ================== ROUTES ================== */

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "client/pages/login.html"));
});

/* ===== AUTH ===== */

app.post("/api/auth/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    await new User({ email, password: hashed }).save();

    res.json({ message: "Account created successfully" });
  } catch {
    res.status(500).json({ message: "Signup error" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "2h" });
    res.json({ token });
  } catch {
    res.status(500).json({ message: "Login error" });
  }
});

/* ===== PROFILE ===== */

app.post("/api/profile", authMiddleware, async (req, res) => {
  try {
    const existing = await MedicalProfile.findOne({ user: req.user.id });

    if (existing) {
      await MedicalProfile.findOneAndUpdate(
        { user: req.user.id },
        req.body,
        { new: true }
      );
      return res.json({ message: "Profile updated successfully" });
    }

    await new MedicalProfile({
      ...req.body,
      user: req.user.id
    }).save();

    res.json({ message: "Profile saved successfully" });

  } catch {
    res.status(500).json({ message: "Profile save error" });
  }
});

app.get("/api/profile", authMiddleware, async (req, res) => {
  const profile = await MedicalProfile.findOne({ user: req.user.id });
  res.json(profile);
});

/* ===== PUBLIC QR ROUTE ===== */

app.get("/public-profile/:id", async (req, res) => {
  try {
    const profile = await MedicalProfile.findById(req.params.id);
    if (!profile) return res.send("<h2>Profile not found</h2>");

    const formattedDOB = new Date(profile.dob).toLocaleDateString("en-US");

    res.send(`
    <html>
    <head>
      <style>
        body {
          background:#58111A;
          color:white;
          font-family:Arial;
          padding:30px;
        }
        .card {
          background:#3D0C02;
          padding:30px;
          border-radius:12px;
          max-width:700px;
          margin:auto;
        }
        h2,h3 { color:white; }
        hr { border:1px solid #660000; }
      </style>
    </head>
    <body>
      <div class="card">
        <h2>${profile.firstName} ${profile.middleName || ""} ${profile.lastName}</h2>
        <hr>
        <h3>Personal Info</h3>
        <p>Sex: ${profile.sex}</p>
        <p>DOB: ${formattedDOB}</p>
        <p>Blood Type: ${profile.bloodType}</p>
        <p>Contact: ${profile.contactNumber}</p>
        <p>Religion: ${profile.religion}</p>
        <hr>
        <h3>Emergency</h3>
        <p>${profile.emergencyFirstName} ${profile.emergencyLastName}</p>
        <p>${profile.relationship}</p>
        <p>${profile.emergencyContactNumber}</p>
        <hr>
        <h3>Medical</h3>
        <p>Allergies: ${profile.allergies}</p>
        <p>Medications: ${profile.medications}</p>
        <p>Conditions: ${profile.medicalConditions}</p>
        <p>Past Illness: ${profile.pastIllness || "N/A"}</p>
        <p>Family History: ${profile.familyHistory || "N/A"}</p>
        <hr>
        <h3>Insurance</h3>
        <p>PhilHealth: ${profile.philhealth || "N/A"}</p>
        <p>HMO: ${profile.hmo || "N/A"}</p>
      </div>
    </body>
    </html>
    `);

  } catch {
    res.send("<h2>Error loading profile</h2>");
  }
});

app.listen(PORT, () => console.log("Server running on port " + PORT));