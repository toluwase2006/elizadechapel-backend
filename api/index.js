const dotenv = require("dotenv");

dotenv.config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const contentRoutes = require("../routes/contentRoutes");

const app = express();

// Allowed frontend origins
const clientOrigins = [
  "http://localhost:8080",
  "http://192.168.1.22:8080",
  "https://elizade-chapel-connect.vercel.app",
  process.env.CLIENT_ORIGIN,
].filter(Boolean);

const corsOptions = {
  origin: clientOrigins,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true,
};

app.use(
  cors(corsOptions)
);
app.options(/.*/, cors(corsOptions));

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
app.use("/api/content", async (_req, _res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    error.status = 503;
    next(error);
  }
});

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

  if (error.name === "MongooseServerSelectionError" || error.name === "MongoServerError") {
    return res.status(503).json({
      message: "Database service is temporarily unavailable.",
    });
  }

  console.error(error);

  res.status(500).json({
    message: "Internal server error.",
  });
});

// MongoDB connection
let isConnected = false;
let connectionPromise;

async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(process.env.MONGO_URI)
      .then(() => {
        isConnected = true;
        console.log("MongoDB connected");
      })
      .catch((error) => {
        console.error("MongoDB connection error:", error);
        throw error;
      })
      .finally(() => {
        connectionPromise = undefined;
      });
  }

  return connectionPromise;
}

// Local development server
if (require.main === module) {
  const port = Number(process.env.PORT) || 5000;

  app.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
  });

  connectDB().catch((error) => {
    console.error("MongoDB connection error:", error);
  });
}

// Vercel serverless handler
module.exports = async (req, res) => {
  return app(req, res);
};