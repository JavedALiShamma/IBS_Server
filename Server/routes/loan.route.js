const express =require('express');
const mongoose = require("mongoose");
const loanRouter=express.Router();

const IBSloaner = require('../models/Loan.model');
const IBSuser = require('../models/user.model');
const {auth} = require('../auth/auth.middleware');
const IBSstore = require('../models/Store.model');
loanRouter.get("/getLoaners" ,auth ,async(req, res)=>{
    try{
        let loaners=await IBSloaner.find();
        if(!loaners){
            res.status(404).json({message:"No Loaner Availble"});
        }
        return res.status(200).json({message:"Loaners successful" ,users:loaners , success : true})
    }
    catch(err){
        return res.status(500).json({message:`${err}`})
    }
})
loanRouter.get(("/getLoaner/:id"),async(req,res)=>{
  try{
    // we will get the loaner by id
    const {id} = req.params;
    const Loaner = await IBSloaner.findOne({_id:id});
    if(!Loaner){
      return res.status(404).json({message:"No user with this ID" , success:false})
    }
    return res.status(200).json({success:true , Loaner});
  }
  catch(err){
     return res.status(500).json({message:`${err}`})
  }
})
loanRouter.get(("/getThisMonthLoaner/:month/:year"), async(req,res)=>{
  try{
    const {month , year} =req.params;
    // We will get the loaners for this month
    const loaners = await IBSloaner.find({ startMonth: month, startYear: year });
    if (!loaners || loaners.length === 0) {
      return res.status(404).json({ message: "No loaners found for this month", success: false });
    }
    
    return res.status(200).json({ message: "Loaners found for this month", loaners, success: true });

  }
  catch(err){
     return res.status(500).json({message:`${err}`})
  }
})
loanRouter.post("/getLoanerForAdmin" , async(req,res)=>{
  try{
      const userIds=req.body.userIds;
      console.log(req.body , "REQUESR BODY IS",typeof userIds);
        if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: "userIds array is required" });
    }
    const activeLoaners=await IBSloaner.find({
      userId: { $in: userIds },
       // adjust this condition as per your schema
    })
    if(!activeLoaners){
      return res.status(404).json({message:"आप के अंतर्गत कोई सक्रिय लोन (Loan) नहीं है"})
    }
    return res.status(200).json({message:"successful" ,activeLoaners, success:true});

  }
  catch(err){
     return res.status(500).json({message:`${err}`})
  }
})
loanRouter.post("/addLoaner", async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      userId,
      name,
      witness1,
      witness2,
      amount,
      installmentAmount,
      startMonth,
      startYear,
      superAdminId,
      monthlyLoanGiven
    } = req.body;

    const date = new Date();
    const year = date.getFullYear();
    const month = date.toLocaleString("default", { month: "long" });

    // Step 1: Find user
    const existingUser = await IBSuser.findById(userId).session(session);
    if (!existingUser) {
      throw new Error("User not found");
    }

    if (existingUser.activeLoanId) {
      return res
        .status(400)
        .json({ message: "User already has a loan", success: false });
    }

    // Step 2: Create Loan
    const newLoaner = new IBSloaner({
      userId,
      name,
      witness1,
      witness2,
      amount,
      installmentAmount,
      startMonth,
      startYear,
      monthlyLoanGiven
    });
    // Here we will calculate the installment 
    let totalInstallment = Math.ceil(amount/installmentAmount);
    newLoaner.totalInstallments= totalInstallment;
    newLoaner.loanAmountLeft=amount;
    newLoaner.isCompleted=false;
    newLoaner.installmentLeft=totalInstallment;
    newLoaner.outstandingBalance =amount;
    await newLoaner.save({ session });

    // Step 3: Update User
    existingUser.hasLoan = true;
    existingUser.activeLoanId = newLoaner._id;
    existingUser.loanAmount =amount;
    await existingUser.save({ session });

    // Step 4: Update Store
    const store = await IBSstore.findOne({ userId: superAdminId }).session(session);
    if (!store) {
      throw new Error("खाता नहीं पाया गया");
    }

    if (store.standingBalance < newLoaner.amount) {
      throw new Error("खाते में पैसा कम है");
    }
    // let monthStore =loan.monthlyLoanGiven.find((p)=>p.month && p.year==year);
    
    // if(!monthStore){
    //   loan.monthlyLoanGiven.push({month , year , paidOn : new Date(),amountGiven :amount ,noOfLoaner :1 ,userTakenLoan :push(name)})
    // }
    // else if(monthStore.userTakenLoan.includes(name)){
    //   return res.status(400).json({message:"पहले ही जोड़ा जा चुका है", success:false});
    // }

    // const userTakenLoan = loan.monthlyLoanGiven.userTakenLoan.find((name))
   let monthLoan = store.monthlyLoanGiven.find(item => item.month === month && item.year === year);
   if (!monthLoan) {
  // If not present, create a new entry
  store.monthlyLoanGiven.push({
    month,
    year,
    amountGiven: amount,
    noOfLoaner: 1,
    userTakenLoan: [{
      userId,
      name,
      loanAmount: amount
    }]
  });
  }else {
  // Check if user already exists in this month's loan list
  const alreadyExists = monthLoan.userTakenLoan.some(
    entry => entry.userId.toString() === userId
  );
   if (alreadyExists) {
    throw new Error("इस उपयोगकर्ता को पहले ही इस महीने के लोन में जोड़ा जा चुका है");
  }
  monthLoan.userTakenLoan.push({
    userId,
    name,
    loanAmount: amount
  });

  // Update totals
  monthLoan.amountGiven += amount;
  monthLoan.noOfLoaner = monthLoan.userTakenLoan.length;
}


    store.standingBalance -= newLoaner.amount;

    await store.save({ session });

    // ✅ Commit the transaction
    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      message: "Loaner registration successful",
      user: newLoaner,
      success: true,
    });
  } catch (err) {
    // ❌ Abort and rollback on error
    await session.abortTransaction();
    session.endSession();
    return res.status(500).json({ message: err.message || "Transaction failed" });
  }
});

/// Monthly installment from the loaners



loanRouter.post("/addLoanInstallment" ,async(req,res)=>{
 try{
   const {id ,month,year,amount,status,superAdmin} = req.body;
  // Here we call the user 

  const loan = await IBSloaner.findOne({userId:id});
  
  if(!loan){
    return res.status(404).json({message:"No loan for this user"});
  }
  // Here we will update loan.installmentsPaid 

   let installment =loan.installmentsPaid.find((p)=>p.month && p.year==year);
    
   if(!installment){
    loan.installmentsPaid.push({month , year ,amount , paidOn : new Date(), status})
   }
   else if(installment.amount >0){
    return res.status(201).json({message :"उपयोगकर्ता पहले ही अपडेट हो चुका है"});
   }
   else{
    installment.status = status;
    installment.paidOn = new Date();
    installment.amount =amount;
   }
   if(loan.installmentLeft == 1 && loan.loanAmountLeft <= amount){
      /// Here we need to call the USER and clear it 
      const loanUser = await IBSuser.findOne({_id:id});
      if(!loanUser){
      res.status(404).json({message :"Error Something went wrong", success:false})
    }
    loanUser.loanAmountTaken =loan.amount;
    loanUser.hasLoan =false;
      loan.isCompleted =true;
      // loan.activeLoanId=null;
      await loanUser.save();
   }
   loan.installmentLeft -=1;
   loan.loanAmountLeft -=amount;
   loan.outstandingBalance -=amount;
 
   
   await loan.save();
   

   // Now we will update the store 
   // Now we need user admin
   const store = await IBSstore.findOne({userId:superAdmin})
  // We have to update the store now 
   if (!store) {
               return res.status(404).json({ message: "Store not found" });
           }
          
    if(!store.monthlyInstallment){
      store.monthlyInstallment =[]
    }
     const existingPayment = store.monthlyInstallment.find(
               (payment) => payment.year === year && payment.month === month
           );
   
           if (existingPayment) {
               // If exists, add the new amount to the existing amount
               existingPayment.amount += amount;
           } else {
               // If not, add a new payment entry
               store.monthlyInstallment.push({ year, month, amount });
           }
          
           // Update the totalInstallmentsCollected by adding the new amount
           // store.totalInstallmentsCollected += amount;
            store.standingBalance += amount;
           
           await store.save();

           return res.status(201).json({message:"मासिक किस्त सफलतापूर्वक अपडेट की गई" , success:true});
 }
 catch(err){
   return  res.status(500).json({message :`${err}`, success:false})
 }


})
module.exports=loanRouter;