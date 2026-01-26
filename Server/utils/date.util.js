// utils/date.util.js
exports.getTodayIST = () =>
    new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Kolkata",
    });
  
  exports.getDayNameIST = () =>
    new Date().toLocaleDateString("en-US", {
      weekday: "long",
      timeZone: "Asia/Kolkata",
    });
  
  exports.isWeekendIST = () => {
    const day = new Date().toLocaleDateString("en-US", {
      weekday: "short",
      timeZone: "Asia/Kolkata",
    });
    return day === "Sat" || day === "Sun";
  };
  // utils/date.util.js (extend this file)

exports.getMonthDaysIST = (year, month) => {
  const days = [];
  const date = new Date(Date.UTC(year, month - 1, 1));

  while (date.getUTCMonth() === month - 1) {
    const istDate = new Date(
      date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );

    const dateStr = istDate.toISOString().split("T")[0];
    const dayName = istDate.toLocaleDateString("en-US", {
      weekday: "short",
      timeZone: "Asia/Kolkata",
    });

    days.push({
      date: dateStr,
      day: dayName,
    });

    date.setUTCDate(date.getUTCDate() + 1);
  }

  return days;
};

exports.isWeekendDay = (dayShort) => dayShort === "Sat" || dayShort === "Sun";
exports.getCurrentISTTime = () => {
  return new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );
};
