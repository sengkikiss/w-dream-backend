require("dotenv").config();
const app = require("./app");
const connectDB = require("./config/Database");

const PORT = process.env.PORT || 5000;

console.log("");
console.log("========================================");
console.log("🚀 W-Dream Backend Starting...");
console.log("========================================");
console.log("");
console.log("Environment Check:");
console.log(`✓ NODE_ENV: ${process.env.NODE_ENV || "development"}`);
console.log(`✓ PORT: ${PORT}`);
console.log(
  `✓ CLIENT_URL: ${process.env.CLIENT_URL || "http://localhost:5173"}`,
);
console.log(
  `✓ MongoDB URI configured: ${process.env.MONGODB_URI ? "✓" : "✗ MISSING"}`,
);
console.log(
  `✓ JWT_SECRET configured: ${process.env.JWT_SECRET ? "✓" : "✗ MISSING"}`,
);
console.log("");

// Connect to database
connectDB()
  .then(() => {
    // Start server only after DB connection
    const server = app.listen(PORT, () => {
      console.log("");
      console.log("✅ Server is running!");
      console.log(`📍 Port: ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`📡 API URL: http://localhost:${PORT}`);
      console.log(
        `🔗 Client URL: ${process.env.CLIENT_URL || "http://localhost:5173"}`,
      );
      console.log("");
      console.log("Endpoints:");
      console.log("  🏠 GET  http://localhost:5000/");
      console.log("  💚 GET  http://localhost:5000/health");
      console.log("  📝 POST http://localhost:5000/api/auth/register");
      console.log("  🔓 POST http://localhost:5000/api/auth/login");
      console.log("  👤 GET  http://localhost:5000/api/auth/me");
      console.log("  🚪 POST http://localhost:5000/api/auth/logout");
      console.log("");
      console.log("Ready to accept requests! 🎉");
      console.log("");
    });
     const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (err) => {
      console.log(`❌ Unhandled Rejection: ${err.message}`);
      server.close(() => process.exit(1));
    });

    // Handle server errors
    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(`❌ Port ${PORT} is already in use`);
        console.error("   Try: lsof -ti:5000 | xargs kill -9");
        process.exit(1);
      }
      console.error(err);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to start server - Database connection failed");
    process.exit(1);
  });

// Handle process termination
process.on("SIGTERM", () => {
  console.log("📴 SIGTERM signal received: closing HTTP server");
  process.exit(0);
});
