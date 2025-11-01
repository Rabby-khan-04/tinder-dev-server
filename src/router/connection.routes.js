const { Router } = require("express");
const { verifyJwt } = require("../middlewares/auth");
const AppError = require("../utlis/AppError");
const { status } = require("http-status");
const User = require("../models/user");
const Connection = require("../models/connection");
const { validateObjectId } = require("../utlis/validate");

const router = Router();

router.use(verifyJwt);

router.route("/request/send/:status/:userId").post(async (req, res) => {
  const user = req.user;
  const fromUserId = user._id;
  const toUserId = req.params?.userId;
  const incomingStatus = req.params.status;

  validateObjectId(toUserId, "User Id");

  const ALLOWED_STATUS = ["interested", "ignored"];
  if (!ALLOWED_STATUS.includes(incomingStatus))
    throw new AppError(
      status.BAD_REQUEST,
      "Invalid status value. Allowed values are 'interested' or 'ignored'."
    );

  const toUser = await User.findById(toUserId);
  if (!toUser) throw new AppError(status.NOT_FOUND, "Receiver not found!!");

  const existingRequest = await Connection.findOne({
    $or: [
      { fromUserId, toUserId },
      { fromUserId: toUserId, toUserId: fromUserId },
    ],
  });

  if (existingRequest)
    throw new AppError(status.CONFLICT, "Connection request already exists.");

  const connection = await Connection.create({
    fromUserId,
    toUserId,
    status: incomingStatus,
  });

  return res.status(status.CREATED).json({
    success: true,
    data: connection,
    message:
      incomingStatus === "interested"
        ? `${user.firstName} is interested in ${toUser.firstName}`
        : `${user.firstName} ignored ${toUser.firstName}`,
  });
});

router.route("/request/review/:status/:requestId").post(async (req, res) => {
  const loggedInUser = req.user;
  const incomingStatus = req.params.status;
  const requestId = req.params.requestId;
  validateObjectId(requestId, "request ID");

  const ALLOWED_STATUS = ["accepted", "rejected"];
  if (!ALLOWED_STATUS.includes(incomingStatus))
    throw new AppError(
      status.BAD_REQUEST,
      "Invalid status value. Allowed values are 'accepted' or 'rejected'."
    );

  const existingRequest = await Connection.findOne({
    _id: requestId,
    toUserId: loggedInUser._id,
    status: "interested",
  });

  if (!existingRequest)
    throw new AppError(status.NOT_FOUND, "Connection request not found!");

  existingRequest.status = incomingStatus;

  await existingRequest.save({ validateBeforeSave: true });

  return res.status(status.OK).json({
    success: true,
    data: existingRequest,
    message: `Request is ${incomingStatus}`,
  });
});

module.exports = router;
