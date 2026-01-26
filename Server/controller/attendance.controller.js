const Attendance = require("../models/attendance.model");
const Municipality = require("../models/municipality.model");
const Employee = require("../models/employee.model");
const GovtHoliday = require("../models/holiday.model");
const {
  getTodayIST,
  getDayNameIST,
  isWeekendIST,
  getMonthDaysIST,
  isWeekendDay
} = require("../utils/date.util");
// const getTodayIST = () =>
//   new Date().toLocaleDateString("en-CA", {
//     timeZone: "Asia/Kolkata",
//   });
const punchIn = async (req, res) => {
  try {
    const { latitude, longitude, selfieUrl } = req.body;
    const { attendanceMode } = req; // 👈 IMPORTANT
    const employeeId = req.user._id;
    const today = getTodayIST();
    
    let locationData = undefined;
    let remarks = undefined;

    // 🟢 OFFICE ATTENDANCE
    if (attendanceMode === "OFFICE") {
      const employee = await Employee.findById(employeeId).populate(
        "municipalityId"
      );

      if (!employee || !employee.municipalityId) {
        return res.status(400).json({
          success: false,
          message: "Employee municipality not assigned",
        });
      }
      const allowedMunicipalityIds = [employee.municipalityId._id];
      if(employee.extraCharge?.isAnyExtraCharge && 
        employee.extraCharge.extraMunicipalityId
      )
      {
       allowedMunicipalityIds.push(employee.extraCharge.extraMunicipalityId);
      }
      // const municipality = employee.municipalityId;

      // const isInside = await Municipality.findOne({
      //   _id: municipality._id,
      //   location: {
      //     $near: {
      //       $geometry: {
      //         type: "Point",
      //         coordinates: [longitude, latitude],
      //       },
      //       $maxDistance: municipality.radiusInMeters || 500,
      //     },
      //   },
      // });
      /// handling for the extra charge
      console.log(allowedMunicipalityIds , "Allowed muicipality ids are");
        const isInside = await Municipality.findOne({
          _id: { $in: allowedMunicipalityIds },
          location: {
            $near: {
              $geometry: {
                type: "Point",
                coordinates: [longitude, latitude],
              },
              $maxDistance: 500,
            },
          },
        });

      if (!isInside) {
        return res.status(403).json({
          success: false,
          message: "You are outside your assigned municipality",
        });
      }

      locationData = {
        type: "Point",
        coordinates: [longitude, latitude],
      };
    }

    // 🏠 REMOTE ATTENDANCE
    if (attendanceMode === "REMOTE") {
      remarks = "REMOTE";
      // ❌ NO geo-fence
      // ❌ NO location required
    }

    const attendance = new Attendance({
      employeeId,
      date: today,
      punchInTime: new Date(),
      location: locationData,
      selfieUrl,
      status: "PRESENT",
      remarks,
    });

    await attendance.save();

    res.status(200).json({
      success: true,
      message:
        attendanceMode === "REMOTE"
          ? "Remote attendance marked successfully"
          : "Attendance marked successfully",
    });
  } catch (error) {
    console.error("PunchIn error:", error);
    res.status(500).json({
      success: false,
      message: "Punch-in failed",
    });
  }
};
const punchOut = async (req, res) => {
  try {
    const { workSummary } = req.body;
    const employeeId = req.user._id;
    const today = getTodayIST();
    console.log("puchout" , today);
    if (!workSummary || workSummary.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: "Work summary is required (min 5 characters)",
      });
    }

    // 1️⃣ Find today's attendance
    const attendance = await Attendance.findOne({
      employeeId,
      date: today,
      status: "PRESENT",
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "No punch-in found for today",
      });
    }

    // 2️⃣ Prevent double punch-out
    if (attendance.punchOutTime) {
      return res.status(400).json({
        success: false,
        message: "Punch-out already recorded",
      });
    }

    // 3️⃣ Save punch-out
    attendance.punchOutTime = new Date();
    attendance.workSummary = workSummary;

    await attendance.save();

    res.status(200).json({
      success: true,
      message: "Punch-out recorded successfully",
    });
  } catch (error) {
    console.error("PunchOut error:", error);
    res.status(500).json({
      success: false,
      message: "Punch-out failed",
    });
  }
};


// Get Attendance for today

const getTodayAttendance = async (req, res) => {
  try {
    const employeeId = req.user._id;
    const today = getTodayIST();
    const dayName = getDayNameIST();

    // 1️⃣ Weekend check
    if (isWeekendIST()) {
      return res.status(200).json({
        date: today,
        day: dayName,
        status: "OFF",
        isWeekend: true,
        isHoliday: false,
        canPunchIn: false,
        canPunchOut: false,
      });
    }

    // 2️⃣ Govt holiday check
    const holiday = await GovtHoliday.findOne({ date: today });

    if (holiday) {
      return res.status(200).json({
        date: today,
        day: dayName,
        status: "HOLIDAY",
        holidayName: holiday.name,
        isWeekend: false,
        isHoliday: true,
        canPunchIn: false,
        canPunchOut: false,
      });
    }

    // 3️⃣ Fetch today attendance
    const attendance = await Attendance.findOne({
      employeeId,
      date: today,
    });

    // 4️⃣ No attendance yet (working day)
    if (!attendance) {
      return res.status(200).json({
        date: today,
        day: dayName,
        status: "NOT_MARKED",
        isWeekend: false,
        isHoliday: false,
        canPunchIn: true,
        canPunchOut: false,
      });
    }

    // 5️⃣ Punched in but not out
    if (attendance.punchInTime && !attendance.punchOutTime) {
      return res.status(200).json({
        date: today,
        day: dayName,
        status: "PRESENT",
        punchInTime: attendance.punchInTime,
        punchOutTime: null,
        isWeekend: false,
        isHoliday: false,
        canPunchIn: false,
        canPunchOut: true,
      });
    }

    // 6️⃣ Punched in & out
    return res.status(200).json({
      date: today,
      day: dayName,
      status: "PRESENT",
      punchInTime: attendance.punchInTime,
      punchOutTime: attendance.punchOutTime,
      workSummary: attendance.workSummary || "",
      isWeekend: false,
      isHoliday: false,
      canPunchIn: false,
      canPunchOut: false,
    });
  } catch (error) {
    console.error("getTodayAttendance error:", error);
    res.status(500).json({
      message: "Failed to fetch today's attendance",
    });
  }
};

/// Get attendance of the whole month 
const getMonthlyAttendance = async (req, res) => {
  try {
    const employeeId = req.user._id;
    const month = parseInt(req.query.month);
    const year = parseInt(req.query.year);
    console.log("respose is comming");
    if (!month || !year || month < 1 || month > 12) {
      return res.status(400).json({
        message: "Invalid month or year",
      });
    }

    // 1️⃣ Generate full calendar
    const calendarDays = getMonthDaysIST(year, month);

    const startDate = calendarDays[0].date;
    const endDate = calendarDays[calendarDays.length - 1].date;

    // 2️⃣ Fetch attendance records
    const attendanceRecords = await Attendance.find({
      employeeId,
      date: { $gte: startDate, $lte: endDate },
    });

    // 3️⃣ Fetch holidays
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

    // 4️⃣ Prepare response + summary
    const summary = {
      present: 0,
      absent: 0,
      off: 0,
      holiday: 0,
    };

    const days = calendarDays.map((d) => {
      // Holiday
      if (holidayMap[d.date]) {
        summary.holiday++;
        return {
          date: d.date,
          day: d.day,
          status: "HOLIDAY",
          holidayName: holidayMap[d.date],
        };
      }

      // Weekend
      if (isWeekendDay(d.day)) {
        summary.off++;
        return {
          date: d.date,
          day: d.day,
          status: "OFF",
        };
      }

      const attendance = attendanceMap[d.date];

      // Present
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

      // Absent (working day, no record)
      summary.absent++;
      return {
        date: d.date,
        day: d.day,
        status: "ABSENT",
      };
    });

    res.status(200).json({
      month,
      year,
      summary,
      days,
    });
  } catch (error) {
    console.error("getMonthlyAttendance error:", error);
    res.status(500).json({
      message: "Failed to fetch monthly attendance",
    });
  }
};

module.exports = { punchIn , punchOut , getTodayAttendance , getMonthlyAttendance };
