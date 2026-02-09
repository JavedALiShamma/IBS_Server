const mongoose = require('mongoose');
const IBSSuperAdmin = require('../models/superAdmin.model');
const IBSuser = require('../models/user.model');
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

});

const monthLoanSchema = new mongoose.Schema({
    year:Number,
     month: {
    type: String,
    enum: [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ]
  },
  amountGiven :Number,
  noOfLoaner:Number,
  userTakenLoan: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'IBSuser'
    },
    name: String,
    loanAmount: Number
  }]

})

const StoreSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'IBSSuperAdmin',
        required: true
    },
    startsFrom: {
        type: String, // e.g., "2024-06"
        required: true
    },
    monthlyPayment:[MonthlyPaymentSchema],
    monthlyInstallment:[MonthlyPaymentSchema],
    totalInstallmentsCollected: {
        type: Number,
        required: true
    },
    monthlyLoanGiven:[monthLoanSchema],
    standingBalance: {
        type: Number,
        default: 0
    },
    balanceFromPreviousMonths: {
        type: Number,
        required: true
    },
    monthlyFees :{
        type:Number,
        required:[true, 'Please add the monthly amount']
    }
}, {
    timestamps: true,
    collection: 'storeDetails'
});

module.exports = mongoose.model('IBSstore', StoreSchema);