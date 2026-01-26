const Attendance = require("../models/attendance.model");
const GovtHoliday = require("../models/holiday.model");

module.exports = async (req, res, next) => {
  const employeeId = req.user._id;
  // const today = new Date().toISOString().split("T")[0];
  // console.log("TODAY IN MIDDLEWARE", today);
  const today = new Date().toLocaleDateString("en-CA", {
  timeZone: "Asia/Kolkata",
  });

  // Govt holiday
  const holiday = await GovtHoliday.findOne({ date: today });
  if (holiday) {
    return res.status(403).json({
      success: false,
      message: `Today is a holiday: ${holiday.name}`,
    });
  }

  // Approved leave
  const leave = await Attendance.findOne({
    employeeId,
    date: today,
    status: "LEAVE",
  });

  if (leave) {
    return res.status(403).json({
      success: false,
      message: "You are on approved leave today",
    });
  }

  // Already punched
  const existing = await Attendance.findOne({
    employeeId,
    date: today,
  });

  if (existing) {
    return res.status(400).json({
      success: false,
      message: "Attendance already marked for today",
    });
  }

  next();
};
