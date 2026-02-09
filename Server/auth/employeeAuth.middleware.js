const jwt = require("jsonwebtoken");
const Employee = require("../models/Employee");

exports.protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.employee = await Employee.findById(decoded.employeeId);
    next();
  } catch (error) {
    res.status(401).json({ message: "Token invalid" });
  }
};
