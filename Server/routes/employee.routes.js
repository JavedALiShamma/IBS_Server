const express = require("express");
const {
  registerEmployee,
  loginEmployee,
} = require("../controller/employee.controller");

const employeeRouter = express.Router();

employeeRouter.post("/registerEmployee", registerEmployee);
employeeRouter.post("/loginEmployee", loginEmployee);

module.exports = employeeRouter;
