const mongoose = require('mongoose');
const IBSadmin =require('./admin.model');
const IBSloaner =require('./Loan.model');
const MonthlyPaymentSchema = new mongoose.Schema({
  year: Number,
  month: {
    type: String,
    enum: [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ]
  },
  isAppliedLoan:Boolean,
  amount: Number,
  status: {
    type: String,
    enum: ["Paid", "Unpaid", "Pending"],
    default: "Unpaid"
  },
  paidOn: Date
});

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter your name']
  },
  fatherName: {
    type: String,
    required: [true, 'Please enter your father\'s name']
  },
  address: {
    type: String,
    required: [true, 'Please enter your address']
  },
  mobile: {
    type: String,
    required: [true, 'Please enter your mobile number'],
    unique: true,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit mobile number']
  },
  totalMonthlypayment:{
    type:Number,
    default:0
  },
  role:{
    type:String,
    default:'user'
  },
  cibilScore:{
    type:Number,
    default:700
  },
  // Monthly payments
  payments: [MonthlyPaymentSchema],

  // Loan related info
  hasLoan: {
    type: Boolean,
    default: false,
  },
  loanAmount: {
    type: Number,
    default: 0,
  },
  loanAmountTaken:{
    type: Number,
    default: 0,
  },
 
  borrowedMonth: {
    type: String, // e.g., "May 2025"
  },
  downPayment: {
    type: Number,
    default: 0,
  },
  socketID:{
    type:String,
    default:null
  },
  superAdmin:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'IBSadmin',
    required:[true,'Please add superadmin']
  },
 
  password:{
    type:String,
    default:null
  },
  role:{
    type:String,
  },
   activeLoanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Loan', default: null },
}, {
  timestamps: true
});

module.exports = mongoose.model('IBSuser', UserSchema);
