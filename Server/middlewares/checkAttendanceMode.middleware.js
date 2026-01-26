const Attendance = require("../models/attendance.model");

module.exports = async (req, res, next) => {
  const { attendanceType, latitude, longitude } = req.body;
  const plan = req.plan;
  const employeeId = req.user._id;

  // 1️⃣ attendanceType is mandatory
  if (!attendanceType || !["OFFICE", "REMOTE"].includes(attendanceType)) {
    return res.status(400).json({
      success: false,
      message: "Attendance should be marked from the municipality",
    });
  }

  // 🟢 OFFICE ATTENDANCE
  if (attendanceType === "OFFICE") {
    // Location MUST be present
    if (
      !Number.isFinite(Number(latitude)) ||
      !Number.isFinite(Number(longitude))
    ) {
      return res.status(400).json({
        success: false,
        message: "Location is required for office attendance",
      });
    }

    req.attendanceMode = "OFFICE";
    return next();
  }

  // 🟡 REMOTE ATTENDANCE
  if (attendanceType === "REMOTE") {
    if (!plan.features.allowRemoteAttendance) {
      return res.status(403).json({
        success: false,
        message: "Remote attendance not allowed in your plan",
      });
    }

    // remote limit check (as before)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const remoteCount = await Attendance.countDocuments({
      employeeId,
      createdAt: { $gte: startOfMonth },
      remarks: "REMOTE",
    });

    if (
      plan.features.maxRemoteDaysPerMonth > 0 &&
      remoteCount >= plan.features.maxRemoteDaysPerMonth
    ) {
      return res.status(403).json({
        success: false,
        message: "Monthly remote attendance limit reached",
      });
    }

    req.attendanceMode = "REMOTE";
    return next();
  }
};
