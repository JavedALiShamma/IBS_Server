const { generateReport } = require("../controller/excelReport.controller");
const { getMonthlyAttendanceData } = require("../utils/getMonthlyAttendanceData");
const reportRouter = require("express").Router();
// const generateReport = require("../utils/reportGenerator.util"); 
const auth = require("../middlewares/auth.middleware");
const Municipality = require("../models/municipality.model");
reportRouter.get('/download-report',auth, async (req, res) => {
  try {
    const { name , role , municipalityId} = req.user;
    const employeeId = req.user.id; // Assuming the token contains the employee ID as 'id'
    
    console.log("Employee ID from token:", req.user); // Log the employee ID to verify it's being extracted correctly
    const month = parseInt(req.query.month);
    const year = parseInt(req.query.year);
    // console.log("User details from token:", municipalityId);
    const municipality = await Municipality.findById(municipalityId);
    if (!municipality) {
      return res.status(404).json({ message: 'Municipality not found' });
    }
    console.log("Municipality details:", municipality); // Log the municipality details to verify it's being fetched correctly
    const municipalityName = municipality.name;
    const data = await getMonthlyAttendanceData(employeeId, month, year , name , role , municipalityName);

    const workbook = await generateReport(data);

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );

    res.setHeader(
      'Content-Disposition',
      `attachment; filename=Report-${month}-${year}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error(error);
    res.status(500).send('Error generating report');
  }
});

module.exports = reportRouter;