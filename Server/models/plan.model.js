const mongoose = require("mongoose");

const planSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true, // BASIC, PRO, PREMIUM
    },

    name: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      trim: true,
    },

    pricePerMonth: {
      type: Number,
      required: true,
      min: 0,
    },

    durationInDays: {
      type: Number,
      required: true,
      default: 30,
    },

    currency: {
      type: String,
      default: "INR",
    },

    features: {
      allowRemoteAttendance: {
        type: Boolean,
        default: false,
      },

      allowLocationOverride: {
        type: Boolean,
        default: false,
      },

      maxRemoteDaysPerMonth: {
        type: Number,
        default: 0,
      },

      allowOfflineAttendance: {
        type: Boolean,
        default: false,
      },
    },

    sortOrder: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Plan", planSchema);
