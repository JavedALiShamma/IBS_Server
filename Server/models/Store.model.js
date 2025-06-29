const mongoose = require('mongoose');
const IBSSuperAdmin = require('../models/superAdmin.model');
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