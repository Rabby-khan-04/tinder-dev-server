require("dotenv").config();
const express = require("express");
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser");
const globalErrorHandler = require("./middlewares/globalErrorHandler");
const notFoundRouteHandler = require("./middlewares/notFoundRouteHandler");
const cors = require("cors");
require("./utlis/cornJob");

const app = express();
const port = 3000;

app.use(cors({ origin: process.env.CROSS_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET));

const authRouter = require("./router/auth.routes");
const profileRouter = require("./router/profile.routes");
const userRouter = require("./router/user.routes");
const connectionRouter = require("./router/connection.routes");

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/profile", profileRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/connection", connectionRouter);

app.use(notFoundRouteHandler);
app.use(globalErrorHandler);

connectDB()
  .then((instance) => {
    console.log(
      `✅ DATABASE Is Connected Successfully!! HOST: ${instance.connection.host}`
    );
    console.log(`📦 Using database: ${instance.connection.name}`);
    app.listen(port, () => {
      console.log(`🚀 SERVER is successfully listening on PORT: ${port}`);
    });
  })
  .catch((err) => {
    console.error("❌ DATABASE Connection ERROR!!");
    console.log(err);
  });
