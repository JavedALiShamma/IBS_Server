const mongoose=require('mongoose');
const IBSuser =require('./user.model');
const MonthlyPaymentSchema = new mongoose.Schema({
  year: Number,
  month: {
    type: String,
    enum: [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ]
  },
  
  amount: Number,
  status: {
    type: String,
    enum: ["Paid", "Unpaid", "Pending"],
    default: "Unpaid"
  },
  paidOn: Date ,
  usersPaid:[]
});

const LoanSchema= new mongoose.Schema({
    userId: 
    { type: mongoose.Schema.Types.ObjectId,
         ref: 'IBSuser' ,
         required :[true,'Only IBS user can take loan'] },
  amount: {
    type:Number,
    required:[true,'Please add the amount']
  }, // total amount given as loan
  name:{
    type:String,
    required:[true, 'Please Enter the name of the user'],
  },
  startMonth: String,
  startYear: Number,
  installmentAmount: Number,
  totalInstallments: Number,
  loanAmountLeft:Number,
  installmentsPaid: [MonthlyPaymentSchema],
  isCompleted: Boolean,
   witness1:{
    type:String,
    default:null
  },
  witness2:{
    type:String,
    default:null
  },
  outstandingBalance:Number,
  installmentLeft:Number,
},{
    timestamps:true
});

module.exports= mongoose.model('IBSloaner',LoanSchema);