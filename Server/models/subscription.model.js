const mongoose = require("mongoose");
const subscriptionSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["ACTIVE", "EXPIRED", "UNPAID", "CANCELLED"],
      default: "ACTIVE",
    },

    remoteDaysUsedThisMonth: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subscription", subscriptionSchema);
