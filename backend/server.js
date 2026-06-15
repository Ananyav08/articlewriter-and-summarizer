const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const articleRoutes = require("./routes/articleRoutes");
const aiRoutes = require("./routes/aiRoutes");

const app = express();

// Configured CORS properly for production & development
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://articlewriter-and-summarizer.vercel.app" // Replace with your exact frontend URL
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/ai", aiRoutes);

// Base route to verify server deployment status
app.get("/", (req, res) => {
  res.status(200).json({ status: "Backend Running Successfully" });
});

// Database Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Export for Vercel Serverless environment
module.exports = app;
