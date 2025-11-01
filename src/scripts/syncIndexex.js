const mongoose = require("mongoose");
const User = require("../models/user");
const Connection = require("../models/connection");

const MONGO_URI =
  "mongodb+srv://rabby:$Rabby12345@cluster0.alhobab.mongodb.net";

(async () => {
  try {
    console.log("⌛ Connecting to database...");
    await mongoose.connect(MONGO_URI, {
      autoIndex: false,
      dbName: "devTinder",
    });

    const result = await User.syncIndexes();
    const connectionIndex = await Connection.syncIndexes();
    console.log("👀 Indexes synced successfully: ", result);
    console.log(
      "👀 Connection Indexes created successfully: ",
      connectionIndex
    );

    process.exit(0);
  } catch (error) {
    console.log("❌ ERROR syncing indexes,", error);
    process.exit(1);
  }
})();
