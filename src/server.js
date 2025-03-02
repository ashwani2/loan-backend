require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();
connectDB(); // Connect to MongoDB

// CORS Configuration
app.use(cors({
    origin: "http://localhost:5173", // Allow requests from your frontend
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  }));

app.use(express.json()); // Middleware for JSON parsing

// Routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/loans", require("./routes/loanRoutes"));

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app; // ✅ Export the app for testing
