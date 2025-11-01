const { Router } = require("express");
const { status } = require("http-status");
const Connection = require("../models/connection");
const { verifyJwt } = require("../middlewares/auth");
const { USER_SAFE_DATA } = require("../constant");
const User = require("../models/user");

const router = Router();

router.use(verifyJwt);

router.route("/requests/received").get(async (req, res) => {
  const loggedInUser = req.user;

  const requests = await Connection.find({
    toUserId: loggedInUser._id,

    status: "interested",
  }).populate({
    path: "fromUserId",
    select: USER_SAFE_DATA,
  });

  return res.status(status.OK).json({
    success: true,
    data: requests,
    message: "Requests fetched successfully!",
  });
});

router.route("/connections").get(async (req, res) => {
  const loggedInUser = req.user;
  const connections = await Connection.find({
    $or: [{ toUserId: loggedInUser?._id }, { fromUserId: loggedInUser?._id }],
    status: "accepted",
  })
    .populate({ path: "toUserId", select: USER_SAFE_DATA })
    .populate({ path: "fromUserId", select: USER_SAFE_DATA });

  const data = connections.map((con) => {
    if (con.fromUserId._id.equals(loggedInUser._id)) return con.toUserId;
    return con.fromUserId;
  });

  return res.status(status.OK).json({
    success: true,
    data: data,
    message: "Connections fetched successfully!",
  });
});

router.route("/feed").get(async (req, res) => {
  const loggedInUser = req.user;
  const page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit) || 10;
  limit = limit > 50 ? 50 : limit;
  const skip = (page - 1) * limit;

  const usersConnection = await Connection.find({
    $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
  }).select("fromUserId toUserId -_id");

  const hideUsers = usersConnection.map((con) => {
    if (con.fromUserId.equals(loggedInUser._id)) return con.toUserId;
    return con.fromUserId;
  });

  const users = await User.find({
    $and: [{ _id: { $ne: loggedInUser._id } }, { _id: { $nin: hideUsers } }],
  })
    .select(USER_SAFE_DATA)
    .skip(skip)
    .limit(limit);

  return res.status(status.OK).json({
    success: true,
    data: users,
    message: "Feed fetched successfully!",
  });
});

module.exports = router;
