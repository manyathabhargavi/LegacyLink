
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authenticateToken = require("./middleware/authMiddleware");

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
}));

app.use(express.json({ limit: "10kb" }));

app.get("/", (req, res) => {
  res.json({
    message: "Digital LegacyLink API is running",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    project: "Digital LegacyLink",
  });
});

app.use("/api/auth", require("./routes/auth"));

app.get("/api/auth/me", authenticateToken, (req, res) => {
  res.json({
    message: "Authentication successful",
    user: req.user,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Digital LegacyLink API running on port ${PORT}`);
});



