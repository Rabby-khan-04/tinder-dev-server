const jwt = require("jsonwebtoken");
const User = require("../models/user");
const AppError = require("../utlis/AppError");
const { status } = require("http-status");

const verifyJwt = async (req, res, next) => {
  const { token } = req.signedCookies;

  if (!token) throw new AppError(status.UNAUTHORIZED, "Unauthorized access!!");

  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  const { _id } = decoded;
  const user = await User.findById(_id);

  if (!user) throw new AppError(status.UNAUTHORIZED, "Unauthorized access!!");

  req.user = user;
  next();
};

module.exports = { verifyJwt };
