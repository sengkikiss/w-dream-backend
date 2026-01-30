const mongoose = require("mongoose");

const connectTo = async (uri, name) => {
  const conn = await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
    retryWrites: true,
    w: "majority",
  });
  console.log(`✅ MongoDB Connected (${name}): ${conn.connection.host}`);
  console.log(`📊 Database: ${conn.connection.name}`);
  return conn;
};

const connectDB = async () => {
  try {
    console.log("🔌 Attempting to connect to MongoDB...");

    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in .env file");
    }

    console.log(
      `📍 Trying URI: ${process.env.MONGODB_URI.substring(0, 50)}...`,
    );
    const conn = await connectTo(process.env.MONGODB_URI, "primary");
    console.log("🎉 Ready to accept requests!");
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // If SRV/DNS issue or ECONNREFUSED, try local fallback
    const isSrvDnsIssue = /querySrv|ENOTFOUND|ECONNREFUSED|EAI_AGAIN/i.test(
      error.message || "",
    );

    if (isSrvDnsIssue) {
      const fallback =
        process.env.MONGODB_LOCAL_URI || "mongodb://127.0.0.1:27017/wdream";
      console.warn(
        "⚠️ Detected DNS/SRV/connection error. Attempting fallback to local MongoDB:",
      );
      console.warn(`   ${fallback}`);
      try {
        const conn = await connectTo(fallback, "fallback-local");
        console.log(
          "🎉 Connected to fallback local MongoDB - continuing startup",
        );
        return conn;
      } catch (fallbackErr) {
        console.error(`❌ Fallback connection failed: ${fallbackErr.message}`);
      }
    }

    console.error("");
    console.error("Troubleshooting steps:");
    console.error(
      "1. Check your MONGODB_URI in .env (ensure password and user are correct).",
    );
    console.error(
      "2. If using Atlas, ensure your cluster is running and your IP is whitelisted.",
    );
    console.error(
      "3. Some networks block SRV DNS lookups — try the local fallback or use a standard mongodb:// connection string.",
    );
    console.error(
      "4. To run locally, install/start MongoDB and set MONGODB_LOCAL_URI=mongodb://127.0.0.1:27017/wdream",
    );
    console.error("");
    console.error(`Error Details: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
