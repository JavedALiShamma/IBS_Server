const jwt = require("jsonwebtoken");

const generateToken = (employeeId) => {
  return jwt.sign(
    { employeeId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

module.exports = generateToken;
