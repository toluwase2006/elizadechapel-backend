const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const contentRoutes = require("../routes/contentRoutes");

dotenv.config();

const app = express();

// Allowed frontend origins
const clientOrigins = [
  "http://localhost:5173",
  "http://192.168.1.22:8080",
  process.env.CLIENT_ORIGIN,
].filter(Boolean);

app.use(
  cors({
    origin: clientOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  })
);

// Middleware
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    message: "Elizade Chapel Backend is running",
  });
});

// Routes
app.use("/api/content", contentRoutes);

// Error handler
app.use((error, _req, res, _next) => {
  if (error.status) {
    return res.status(error.status).json({
      message: error.message,
    });
  }

  if (error.name === "ValidationError") {
    return res.status(400).json({
      message: error.message,
    });
  }

  console.error(error);

  res.status(500).json({
    message: "Internal server error.",
  });
});

// MongoDB connection
let isConnected = false;

async function connectDB() {
  if (isConnected) {
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);

    isConnected = true;

    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}

// Vercel serverless handler
module.exports = async (req, res) => {
  await connectDB();

  return app(req, res);
};