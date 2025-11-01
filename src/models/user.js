const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const saltRounds = 10;

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required!"],
      trim: true,
      maxLength: [80, "First name is too long!!"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required!"],
      trim: true,
      maxLength: [80, "Last name is too long!!"],
    },
    email: {
      type: String,
      required: [true, "Email is required!"],
      trim: true,
      maxLength: [100, "Email is too long!!"],
      unique: true,
      validate: {
        validator: function (val) {
          return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(val);
        },
        message: (props) => `${props.value} is not a valid email!!`,
      },
    },
    password: {
      type: String,
      required: [true, "Password is required!"],
      minLength: [6, "Must use at lest 6 character!!"],
      maxLength: [32, "Password is too long!!"],
    },
    age: {
      type: Number,
      required: [true, "Age is required!"],
      min: [18, "You must be at least 18 years old!"],
      max: [150, "Enter a valid age!!"],
    },
    gender: {
      type: String,
      required: [true, "Gender is required!"],
      enum: {
        values: ["male", "female", "other"],
        message: "Gender {VALUE} is not supported",
      },
    },
    photo: {
      type: String,
      default: "https://i.ibb.co.com/YFNqc4S2/images.png",
      validate: {
        validator: function (val) {
          return validator.isURL(val);
        },
        message: (props) => `${props.value} is not a valid url!`,
      },
    },
    skills: {
      type: [String],
      validate: {
        validator: (v) => v.length <= 10,
        message: "You can have at most 10 skills",
      },
    },
    bio: {
      type: String,
      default: "",
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true }, timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, saltRounds);
});

userSchema.methods.isPasswordValid = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.issueJWT = async function () {
  return jwt.sign({ _id: this._id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "7d",
  });
};

userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret, options) => {
    delete ret.__v;
    delete ret.id;
    delete ret.password;
    return ret;
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
