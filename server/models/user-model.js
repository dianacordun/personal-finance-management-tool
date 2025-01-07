const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    profilePicture: {
      type: String,
      default: "",
    },
    isAdmin: {
      type: Boolean,
      required: false,
      default: false,
    },
    isActive: {
      type: Boolean,
      required: false,
      default: true,
    },
    googleAuthSecret: { 
      type: String 
    },
    twoFactorEnabled: { 
      type: Boolean, 
      default: false 
    },

    llmUsage: {
      monthlyRequests: {
        type: Number,
        default: 0,
      },
      lastReset: {
        type: Date,
        default: null,
      },
    },
  },
  { timestamps: true }
);

const UserModel = mongoose.model("users", userSchema);

module.exports = UserModel;
