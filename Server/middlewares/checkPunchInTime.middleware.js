const { getCurrentISTTime } = require("../utils/date.util");

module.exports = (req, res, next) => {
  const nowIST = getCurrentISTTime();

  const hour = nowIST.getHours();
  const minute = nowIST.getMinutes();

  // ⏰ Punch-in allowed ONLY till 11:00 AM
  if (hour > 11 || (hour === 11 && minute > 0)) {
    return res.status(403).json({
      success: false,
      message: "Punch-in not allowed , you are late",
    });
  }

  next();
};
