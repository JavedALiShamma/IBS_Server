
const Attendance = require("../models/attendance.model");
const GovtHoliday = require("../models/holiday.model");
const { getMonthDaysIST, isWeekendDay } = require("./date.util");
const getMonthlyAttendanceData = async (employeeId, month, year , name , role , municipalityName) => {
  const calendarDays = getMonthDaysIST(year, month);

  const startDate = calendarDays[0].date;
  const endDate = calendarDays[calendarDays.length - 1].date;

  const attendanceRecords = await Attendance.find({
    employeeId,
    date: { $gte: startDate, $lte: endDate },
  });

  const holidays = await GovtHoliday.find({
    date: { $gte: startDate, $lte: endDate },
  });

  const attendanceMap = {};
  attendanceRecords.forEach((a) => {
    attendanceMap[a.date] = a;
  });

  const holidayMap = {};
  holidays.forEach((h) => {
    holidayMap[h.date] = h.name;
  });

  const summary = {
    present: 0,
    absent: 0,
    off: 0,
    holiday: 0,
  };

  const days = calendarDays.map((d) => {
    if (holidayMap[d.date]) {
      summary.holiday++;
      return {
        date: d.date,
        day: d.day,
        status: "HOLIDAY",
        holidayName: holidayMap[d.date],
      };
    }

    if (isWeekendDay(d.day)) {
      summary.off++;
      return {
        date: d.date,
        day: d.day,
        status: "OFF",
      };
    }

    const attendance = attendanceMap[d.date];

    if (attendance) {
      summary.present++;
      return {
        date: d.date,
        day: d.day,
        status: "PRESENT",
        punchInTime: attendance.punchInTime,
        punchOutTime: attendance.punchOutTime,
        workSummary: attendance.workSummary || "",
      };
    }

    summary.absent++;
    return {
      date: d.date,
      day: d.day,
      status: "ABSENT",
    };
  });

  return { month, year, summary, days , name , role , municipalityName};
};

module.exports = {
  getMonthlyAttendanceData,
};