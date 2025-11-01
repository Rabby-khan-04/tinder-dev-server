const mongoose = require("mongoose");
const AppError = require("../utlis/AppError");
const { status } = require("http-status");

const { Schema, Types } = mongoose;

const connectionSchema = new Schema(
  {
    fromUserId: {
      type: Types.ObjectId,
      required: [true, "Sender's Id is required!"],
      ref: "User",
    },
    toUserId: {
      type: Types.ObjectId,
      required: [true, "Receiver's Id is required!"],
      ref: "User",
    },
    status: {
      type: String,
      enum: {
        values: ["interested", "ignored", "accepted", "rejected"],
        message: "{VALUE} is not right status!",
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret, options) => {
        delete ret.__v;
        delete ret.id;
        return ret;
      },
    },
  }
);

connectionSchema.index(
  { fromUserId: 1, toUserId: 1 },
  { unique: true, background: true }
);

connectionSchema.pre("save", function () {
  if (this.fromUserId.equals(this.toUserId))
    throw new AppError(status.BAD_REQUEST, "Cannot sent request to yourself");
});

const Connection = mongoose.model("Connection", connectionSchema);

module.exports = Connection;
