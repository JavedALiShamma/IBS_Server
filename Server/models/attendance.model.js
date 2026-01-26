const mongoose = require("mongoose");
const attendanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    date: {
      type: String, // YYYY-MM-DD
      required: true,
    },

    punchInTime: Date,
    punchOutTime: Date,
    workSummary: {
    type: String,
    trim: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
      },
    },

    selfieUrl: String,

    status: {
      type: String,
      enum: ["PRESENT", "ABSENT", "LEAVE", "GOVT HOLIDAY"],
      default: "PRESENT",
    },

    remarks: String,

    isSystemGenerated: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Attendance", attendanceSchema);