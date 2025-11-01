const { Router } = require("express");
const User = require("../models/user");
const { status } = require("http-status");
const { validateSignup } = require("../utlis/validate");
const AppError = require("../utlis/AppError");
const { cookieOptions } = require("../constant");
const { verifyJwt } = require("../middlewares/auth");
const validator = require("validator");
const sendMail = require("../helper/sendMail");

const router = Router();

router.route("/signup").post(async (req, res) => {
  const newDoc = validateSignup(req);

  // const existingUser = await User.findOne({ email });
  // if (existingUser)
  //   throw new AppError(status.CONFLICT, "User already exists!!");

  const user = await User.create(newDoc);
  // const savedUser = await user.save();

  if (!user)
    throw new AppError(status.INTERNAL_SERVER_ERROR, "Failed to create user!!");

  sendMail(
    user.email,
    "Welcome, my unsuspecting test subject! 🧪",
    ``,
    `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #007bff;">Hey there!</h2>
      <p>You’ve been randomly chosen by my chaotic code for a very important mission: helping me test emails I barely understand. Don’t worry, there are no side effects… probably.</p>

      <p>If you got this by mistake, please ignore this message and carry on with your glorious life. Otherwise, brace yourself for more nonsense</p>
      
      <p>Consider this your official <strong>“ignore warning.”</strong> . Sit back, relax, and enjoy being part of my totally scientific, definitely professional experiment. 😎</p>
    </div>
  `
  );

  const token = await user.issueJWT();

  return res.status(status.CREATED).cookie("token", token, cookieOptions).json({
    success: true,
    data: user,
    message: "User registered successfully!!",
  });
});

router.route("/login").post(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw new AppError(status.UNAUTHORIZED, "Unauthorized access!!");
  const isValid = await user.isPasswordValid(password);
  if (!isValid)
    throw new AppError(status.UNAUTHORIZED, "Unauthorized access!!");

  const token = await user.issueJWT();

  return res
    .status(status.OK)
    .cookie("token", token, cookieOptions)
    .json({ success: true, data: user, message: "Successfully login!!" });
});

router.route("/logout").post(async (req, res) => {
  return res.clearCookie("token", cookieOptions).sendStatus(status.OK);
});

router.route("/change-credential").patch(verifyJwt, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword)
    throw new AppError(status.BAD_REQUEST, "Current password is required");
  if (!newPassword)
    throw new AppError(status.BAD_REQUEST, "New password is required");

  const user = req.user;
  const validPass = await user.isPasswordValid(currentPassword);

  if (!validPass)
    throw new AppError(status.UNAUTHORIZED, "Unauthorize access!!");

  if (!validator.isStrongPassword(newPassword))
    throw new AppError(status.BAD_REQUEST, "Must use a strong password!");

  user.password = newPassword;
  await user.save({ validateBeforeSave: true });

  const token = await user.issueJWT();

  return res
    .cookie("token", token, cookieOptions)
    .json({ success: true, message: "Password updated successfylly!" });
});

module.exports = router;
