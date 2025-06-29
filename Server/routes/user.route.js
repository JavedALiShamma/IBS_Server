const express=require('express');
const userRouter=express.Router();
const mongoose = require("mongoose");
const IBSuser =require('../models/user.model');
const { auth, createToken } = require('../auth/auth.middleware');

const IBSstore =require('../models/Store.model');
userRouter.post("/registerUser",auth,async(req, res)=>{
    try{
        let user = req.body;
      
        let existingUser= await IBSuser.findOne({mobile:user.mobile});
        console.log(existingUser);
        if(existingUser){
             return res.status(400).json({ message: "User already exists", success: false });
        }

        existingUser= new IBSuser(user);
        await existingUser.save();
        return res.status(201).json({
             message: "User registration successful",
           user: existingUser,
            success: true
        })
    }
    catch(err){
        // console.error("Registration error:", err);
        return res.status(500).json({ message: `${err}` });

    }
})
userRouter.get("/getAllUsers",async(req,res)=>{
    try{
        let users= await IBSuser.find({role:'user'});
        // console.log(users ,"users are");
        return res.status(200).json({users,success:true});
    }
    catch(err){
         return res.status(500).json({ message: `${err}` });
    }
})
// Here we wanted to get all the users of the particular admin
userRouter.get("/getUsersByAdmin/:superAdmin",auth,async(req,res)=>{
    try{
        const superAdmin=req.params.superAdmin;
        // console.log("Super Admin is",superAdmin);
        // console.log(superAdmin._id);
        let users=await IBSuser.find({superAdmin:superAdmin});
       
        res.status(200).json({users,success:true});
    }
    catch(err){
         return res.status(500).json({ message: `${err}` });
    }
})
userRouter.put("/updateMonthlyFees/:id", auth, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { month, year, status, isAppliedLoan, superAdmin } = req.body;
    const id = req.params.id;

    // Step 1: Find User
    const user = await IBSuser.findOne({ _id: id }).session(session);
    if (!user) {
      throw new Error("User not found");
    }

    // Step 2: Find Store
    const store = await IBSstore.findOne({ userId: superAdmin }).session(session);
    if (!store) {
      throw new Error("Store not found");
    }

    const amount = store.monthlyFees;

    // Step 3: Update Payment in User
    let payment = user.payments.find(p => p.month == month && p.year == year);
    if (!payment) {
      user.payments.push({
        month,
        year,
        status,
        amount,
        paidOn: new Date(),
        isAppliedLoan,
      });
    } else {
      payment.status = status;
      payment.paidOn = new Date();
      payment.isAppliedLoan = isAppliedLoan;
    }

    await user.save({ session });

    // Step 4: Update Store
    if (!store.monthlyPayment) {
      store.monthlyPayment = [];
    }

    const existingPayment = store.monthlyPayment.find(
      (p) => p.year === year && p.month === month
    );

    if (existingPayment) {
      existingPayment.amount += amount;
    } else {
      store.monthlyPayment.push({ year, month, amount });
    }

    store.standingBalance += amount;

    await store.save({ session });

    // ✅ Commit all changes
    await session.commitTransaction();
    session.endSession();

    return res
      .status(201)
      .json({ success: true, message: "Payment Updated & Store Updated" });
  } catch (err) {
    // ❌ Rollback on any error
    await session.abortTransaction();
    session.endSession();
    console.error("Transaction error:", err);
    return res
      .status(500)
      .json({ success: false, message: err.message || "Transaction failed" });
  }
});
// userRouter.put("/updateMonthlyFees/:id",auth, async(req,res)=>{
//     const {month , year , status,isAppliedLoan ,superAdmin}=req.body;
//     const id=req.params.id;
//     const user= await IBSuser.findOne({_id:id});
//     if(!user){
//         return res.status(404).json({message:"User not Found"});
//     }
//     let store = await IBSstore.findOne({ userId: superAdmin });
//        if (!store) {
//                return res.status(404).json({ message: "Store not found" });
//         }
//         let amount =store.monthlyFees;
//     let payment =user.payments.find(p=>p.month==month && p.year == year);
//     if(!payment){
//         user.payments.push({month,year, status , amount,paidOn: new Date(), isAppliedLoan});

//     }
//     else{
//         payment.status=status;
//         payment.paidOn = new Date();
//         payment.isAppliedLoan =isAppliedLoan;
//     }
//     /// Here we need to call Store Also to be updated 
    
//     await user.save();
//     /// Here we will Update the store also

//         // STORE STARTS FROM HERE 
 
   
//            if (!store.monthlyPayment) {
//                store.monthlyPayment = [];
//            }
   
//            // Add the payment for the given month and year
//            // Check if a payment for the given year and month already exists
//            const existingPayment = store.monthlyPayment.find(
//                (payment) => payment.year === year && payment.month === month
//            );
   
//            if (existingPayment) {
//                // If exists, add the new amount to the existing amount
//                existingPayment.amount += amount;
//            } else {
//                // If not, add a new payment entry
//                store.monthlyPayment.push({ year, month, amount });
//            }
   
//            // Update the totalInstallmentsCollected by adding the new amount
//            // store.totalInstallmentsCollected += amount;
//            store.standingBalance +=amount;
//            await store.save();

//     res.status(201).json({success:true, message:"Payment Updated & store Updated"});
// })

module.exports=userRouter;