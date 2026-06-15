const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const articleRoutes = require("./routes/articleRoutes");
const aiRoutes = require("./routes/aiRoutes");

const app = express();

app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://your-vercel-domain.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/articles", articleRoutes);
app.use("/api/ai", aiRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.send("Backend Running Successfully");
});

module.exports = app;   // ✅ IMPORTANT (REMOVE app.listen)
