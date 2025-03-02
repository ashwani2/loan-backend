require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");

const app = express();
connectDB(); // Connect to MongoDB

app.use(express.json()); // Middleware for JSON parsing

// Routes
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/loans", require("./routes/loanRoutes"));

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app; // ✅ Export the app for testing
