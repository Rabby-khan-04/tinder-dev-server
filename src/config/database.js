const mongoose = require("mongoose");

let attempts = 0;
let MAX_RETRIES = 5;

const URI = process.env.MONGODB_URI;
// const URI = "mongodb://localhost:27017";

async function connectDB() {
  try {
    const instance = await mongoose.connect(URI, {
      appName: "DevTinder",
      dbName: "devTinder",
      autoIndex: false,
    });

    return instance;
  } catch (error) {
    attempts++;
    console.log(error);
    if (attempts >= MAX_RETRIES) process.exit(1);
    console.error("🚨 Initial MongoDB connection failed:", error.message);

    setTimeout(connectDB, 5000);
  }
}

module.exports = connectDB;
