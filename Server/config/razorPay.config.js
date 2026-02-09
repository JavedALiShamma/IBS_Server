const Razorpay = require("razorpay");
const dotenv = require('dotenv');
dotenv.config(); // Load environment variables from .env file

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

module.exports = razorpay;