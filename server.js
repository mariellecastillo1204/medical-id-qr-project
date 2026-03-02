const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();

// ======================
// MIDDLEWARE
// ======================
app.use(cors());
app.use(express.json());

// ======================
// SERVE FRONTEND (client folder)
// ======================
app.use(express.static(path.join(__dirname, "client")));

// When opening root URL, show login page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "pages", "login.html"));
});

// ======================
// KEEP YOUR API ROUTES HERE
// ======================

// If you already have routes like:
// app.use("/api/auth", require("./routes/auth"));
// app.use("/api/profile", require("./routes/profile"));
// make sure they are still in your project files.
// If they are in other files, they will still work.

// ======================
// START SERVER
// ======================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});