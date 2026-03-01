require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const QRCode = require("qrcode");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const path = require("path");

const User = require("./models/User");
const Medical = require("./models/Medical");
const ScanLog = require("./models/ScanLog");

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));

// ✅ SERVE FRONTEND FILES
app.use(express.static(path.join(__dirname, "client")));

// ================= DATABASE =================
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.log("❌ MongoDB Error:", err));

// ================= AUTH MIDDLEWARE =================
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// ================= SIGNUP =================
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email exists" });

    const hashed = await bcrypt.hash(password, 10);

    await User.create({ email, password: hashed });

    res.json({ message: "Signup successful" });
  } catch {
    res.status(500).json({ message: "Signup error" });
  }
});

// ================= LOGIN =================
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token });
  } catch {
    res.status(500).json({ message: "Login error" });
  }
});

// ================= SAVE PROFILE =================
app.post("/api/medical", authMiddleware, async (req, res) => {
  try {
    let medical = await Medical.findOne({ userId: req.user.id });

    if (!medical) {
      medical = new Medical({ ...req.body, userId: req.user.id });
    } else {
      Object.assign(medical, req.body);
    }

    if (!medical.publicToken) {
      medical.publicToken = crypto.randomBytes(32).toString("hex");
    }

    const publicUrl = `${process.env.BASE_URL}/public/${medical.publicToken}`;
    medical.qrCode = await QRCode.toDataURL(publicUrl);

    await medical.save();

    res.json(medical);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Save error" });
  }
});

// ================= GET PROFILE =================
app.get("/api/medical", authMiddleware, async (req, res) => {
  try {
    const medical = await Medical.findOne({ userId: req.user.id });
    res.json(medical);
  } catch {
    res.status(500).json({ message: "Fetch error" });
  }
});

// ================= PUBLIC PROFILE =================
app.get("/public/:token", async (req, res) => {
  try {
    const medical = await Medical.findOne({ publicToken: req.params.token });

    if (!medical || medical.status !== "active")
      return res.send("Profile unavailable");

    await ScanLog.create({
      medicalId: medical._id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"]
    });

    res.send(`
      <h2>${medical.firstName} ${medical.lastName}</h2>
      <p>Blood Type: ${medical.bloodType}</p>
      <p>Contact: ${medical.contactNumber}</p>
      <hr/>
      <h3>Emergency Contact</h3>
      <p>${medical.emergencyFirstName} ${medical.emergencyLastName}</p>
      <p>${medical.emergencyNumber}</p>
      <hr/>
      <h3>Medical Info</h3>
      <p>Allergies: ${medical.allergies}</p>
      <p>Medications: ${medical.medications}</p>
      <p>Conditions: ${medical.medicalConditions}</p>
    `);
  } catch {
    res.send("Error loading profile");
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("🚀 Server running on port", PORT));