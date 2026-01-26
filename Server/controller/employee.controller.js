const Employee = require("../models/employee.model");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/JWTGenerator");

const registerEmployee = async (req, res) => {
  try {
    const {
      ulbcode,
      name,
      mobile,
      email,
      password,
      role,
      municipalityId,
      extraCharge
    } = req.body;

    // 1. Validation
    if (!ulbcode || !name || !mobile || !password || !municipalityId) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    // 2. Check existing employee
    const existingEmployee = await Employee.findOne({
      $or: [{ ulbcode }, { mobile }],
    });

    if (existingEmployee) {
      return res.status(409).json({ message: "Employee already exists" });
    }

    // 3. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    let employee;
    if(extraCharge && extraCharge.isAnyExtraCharge === true){
      employee = await Employee.create({
      ulbcode,
      name,
      mobile,
      email,
      password: hashedPassword,
      role,
      municipalityId,
      status: "ACTIVE",
      extraCharge:{
        isAnyExtraCharge : extraCharge.isAnyExtraCharge,
        extraMunicipalityId : extraCharge.extraMunicipalityId
      }
    });

    }
    else{
       employee = await Employee.create({
      ulbcode,
      name,
      mobile,
      email,
      password: hashedPassword,
      role,
      municipalityId,
      status: "ACTIVE",
    });
    }
    // 4. Create employee
   

    // 5. Generate token
    const token = generateToken(employee._id);

    res.status(201).json({
      message: "Employee registered successfully",
      token,
      employee,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const loginEmployee = async (req, res) => {
  try {
    const { mobile, password } = req.body;

    if (!mobile || !password) {
      return res.status(400).json({ message: "Mobile and password required" });
    }

    // 1. Find employee
    const employee = await Employee.findOne({ mobile }).select("+password");

    if (!employee) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 2. Check status
    if (employee.status !== "ACTIVE") {
      return res.status(403).json({ message: "Employee inactive" });
    }

    // 3. Compare password
    const isMatch = await bcrypt.compare(password, employee.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 4. Token
    const token = generateToken(employee._id);

    res.status(200).json({
      message: "Login successful",
      token,
      // employee: {
      //   id: employee._id,
      //   name: employee.name,
      //   mobile: employee.mobile,
      //   role: employee.role,
      //   municipalityId: employee.municipalityId,
      //   subscriptionId: employee.subscriptionId,
      // },
      employee
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
module.exports = {
  registerEmployee,
  loginEmployee
};