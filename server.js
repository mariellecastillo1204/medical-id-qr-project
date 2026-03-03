const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

/* ==============================
   MONGODB CONNECTION
============================== */
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

/* ==============================
   MODELS
============================== */

// USER MODEL
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const User = mongoose.model("User", userSchema);

// MEDICAL PROFILE MODEL
const medicalProfileSchema = new mongoose.Schema({

  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // Personal Info
  firstName: { type: String, required: true },
  middleName: String,
  lastName: { type: String, required: true },
  sex: { type: String, required: true },
  dob: { type: Date, required: true },
  bloodType: { type: String, required: true },
  contactNumber: { type: String, required: true },
  religion: { type: String, required: true },

  // Emergency Contact
  emergencyFirstName: { type: String, required: true },
  emergencyMiddleName: String,
  emergencyLastName: { type: String, required: true },
  relationship: { type: String, required: true },
  emergencyContactNumber: { type: String, required: true },

  // Medical Info
  allergies: { type: String, required: true },
  medications: { type: String, required: true },
  medicalConditions: { type: String, required: true },

  pastIllness: String,
  familyHistory: String,

  philhealth: String,
  hmo: String

}, { timestamps: true });

const MedicalProfile = mongoose.model("MedicalProfile", medicalProfileSchema);


/* ==============================
   MIDDLEWARE
============================== */

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "client")));


/* ==============================
   AUTH MIDDLEWARE
============================== */

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};


/* ==============================
   ROUTES
============================== */

// HOME
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "pages", "login.html"));
});


/* ==============================
   AUTH ROUTES
============================== */

// SIGNUP
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword
    });

    await newUser.save();
    res.status(201).json({ message: "Account created successfully" });

  } catch (error) {
    res.status(500).json({ message: "Server error during signup" });
  }
});


// LOGIN
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.json({ token });

  } catch (error) {
    res.status(500).json({ message: "Server error during login" });
  }
});


/* ==============================
   PROFILE ROUTES
============================== */

// SAVE OR UPDATE PROFILE
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

    const profile = new MedicalProfile({
      ...req.body,
      user: req.user.id
    });

    await profile.save();
    res.json({ message: "Profile saved successfully" });

  } catch (error) {
    res.status(500).json({ message: "Error saving profile" });
  }
});


// GET PROFILE (PRIVATE)
app.get("/api/profile", authMiddleware, async (req, res) => {
  try {
    const profile = await MedicalProfile.findOne({ user: req.user.id });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: "Error fetching profile" });
  }
});


/* ==============================
   PUBLIC PROFILE (QR ACCESS)
============================== */

app.get("/public-profile/:id", async (req, res) => {
  try {
    const profile = await MedicalProfile.findById(req.params.id);

    if (!profile) {
      return res.send("<h2>Profile not found</h2>");
    }

    res.send(`
      <html>
      <head>
        <title>Medical Identity</title>
        <style>
          body {
            font-family: Arial;
            background: #1A1110;
            color: white;
            padding: 30px;
          }
          .card {
            max-width: 600px;
            margin: auto;
            background: #3D0C02;
            padding: 25px;
            border-radius: 10px;
          }
          h1 {
            color: #660000;
          }
          h3 {
            color: #660000;
            margin-top: 20px;
          }
          p {
            margin: 5px 0;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>${profile.firstName} ${profile.lastName}</h1>

          <h3>Medical Information</h3>
          <p><strong>Blood Type:</strong> ${profile.bloodType}</p>
          <p><strong>Allergies:</strong> ${profile.allergies}</p>
          <p><strong>Medications:</strong> ${profile.medications}</p>
          <p><strong>Medical Conditions:</strong> ${profile.medicalConditions}</p>

          <h3>Emergency Contact</h3>
          <p><strong>Name:</strong> ${profile.emergencyFirstName} ${profile.emergencyLastName}</p>
          <p><strong>Relationship:</strong> ${profile.relationship}</p>
          <p><strong>Contact:</strong> ${profile.emergencyContactNumber}</p>
        </div>
      </body>
      </html>
    `);

  } catch (error) {
    res.send("<h2>Error loading profile</h2>");
  }
});


/* ==============================
   START SERVER
============================== */

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});