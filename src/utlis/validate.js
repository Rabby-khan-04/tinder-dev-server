const { status } = require("http-status");
const validator = require("validator");
const AppError = require("./AppError");
const { Types } = require("mongoose");

const validateSignup = (req) => {
  const { firstName, lastName, email, age, gender, password, photo } = req.body;

  if (!firstName)
    throw new AppError(status.BAD_REQUEST, "First name is required!!");
  if (!lastName)
    throw new AppError(status.BAD_REQUEST, "Last name is required!!");
  if (!email) throw new AppError(status.BAD_REQUEST, "Email is required!!");
  if (!validator.isEmail(email))
    throw new AppError(status.BAD_REQUEST, "Invalid Eamil!!");
  if (!validator.isStrongPassword(password))
    throw new AppError(status.BAD_REQUEST, "Weak password!!");
  if (!age) throw new AppError(status.BAD_REQUEST, "Age is required!!");
  if (!gender) throw new AppError(status.BAD_REQUEST, "Gender is required!!");
  if (!validator.isURL(photo))
    throw new AppError(status.BAD_REQUEST, "Invalid photo URL!");

  return {
    firstName,
    lastName,
    email,
    password,
    age,
    gender,
    photo,
  };
};

const validateProfileUpdate = (req) => {
  const ALLOWED_UPDATES = [
    "firstName",
    "lastName",
    "age",
    "photo",
    "skills",
    "bio",
  ];

  const isAllowed = Object.keys(req.body).every((field) =>
    ALLOWED_UPDATES.includes(field)
  );

  return isAllowed;
};

const validateObjectId = (id, name = "Id") => {
  if (!Types.ObjectId.isValid(id))
    throw new AppError(status.BAD_REQUEST, `${id} is invalid ${name} format.`);
};

module.exports = { validateSignup, validateProfileUpdate, validateObjectId };
