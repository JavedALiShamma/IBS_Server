const express= require('express');
const auth = require('../middlewares/auth.middleware');
const checkSubscription = require("../middlewares/checkSubscription.middleware");
const validatePunchIn = require("../middlewares/validatePunchIn.middleware");
const checkEligibility = require("../middlewares/checkPunchEligibility.middleware");
const checkAttendanceMode = require("../middlewares/checkAttendanceMode.middleware");

const { punchIn, punchOut, getTodayAttendance, getMonthlyAttendance } = require('../controller/attendance.controller');

const attendanceRouter = express.Router();
// Here we need to add the time middleware at the last 
//checkPunchInTime
attendanceRouter.post("/punch-in", auth , checkEligibility, checkSubscription,validatePunchIn, checkAttendanceMode,punchIn);
attendanceRouter.post("/punch-out" ,auth ,punchOut);
attendanceRouter.get("/today" , auth , getTodayAttendance);
attendanceRouter.get("/monthlyAttendance" , auth , getMonthlyAttendance);
module.exports=attendanceRouter;