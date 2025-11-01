const { Router } = require("express");
const { verifyJwt } = require("../middlewares/auth");
const { status } = require("http-status");
const { validateProfileUpdate } = require("../utlis/validate");
const AppError = require("../utlis/AppError");
const validator = require("validator");

const router = Router();

router.route("/view").get(verifyJwt, async (req, res) => {
  const user = req.user;

  res.status(status.OK).json({ success: true, data: user });
});

router.route("/edit").patch(verifyJwt, async (req, res) => {
  const isAllowed = validateProfileUpdate(req);
  if (!isAllowed)
    throw new AppError(status.BAD_REQUEST, "Invalid update request!!");

  const user = req.user;

  const { skills, photo, ...otherFields } = req.body;

  if (photo && validator.isURL(photo)) {
    user.photo = photo;
  } else throw new AppError(status.BAD_REQUEST, "Invalid photo url!!");

  if (skills && Array.isArray(skills) && skills.length > 0) {
    let combineSkills = Array.from(new Set([...user.skills, ...skills]));

    combineSkills = combineSkills.slice(0, 10);
    user.skills = combineSkills;
  }

  Object.keys(otherFields).forEach((field) => {
    user[field] = otherFields[field];
  });

  await user.save({ validateModifiedOnly: true });

  res.status(status.OK).json({
    success: true,
    data: user,
    message: `${user.firstName}, your profile updated successfully`,
  });
});

module.exports = router;
