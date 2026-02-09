const express=require('express');
const userRouter=express.Router();
const mongoose = require("mongoose");
const IBSuser =require('../models/user.model');

const { auth, createToken } = require('../auth/auth.middleware');

const IBSstore =require('../models/Store.model');
userRouter.post("/registerUser",auth,async(req, res)=>{
    try{
        let user = req.body;
        return res.status(400).json({message:"100 Users are added with this scheme wait for another scheme"});
        let existingUser= await IBSuser.findOne({mobile:user.mobile});
        console.log(existingUser);
        
        // if(existingUser){
        //      return res.status(400).json({ message: "User already exists", success: false });
        // }

        existingUser= new IBSuser(user);
          const password =user.mobile+`@123`;
        console.log("Password is", password);
        existingUser.password = password; // Set the default password
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
userRouter.post("/loginUser", async(req,res)=>{
  try{
    let {mobile , password}= req.body;
    let user = await IBSuser.findOne({mobile:mobile});
    if(!user){
      return res.status(400).json({meassage:"User not found"});
    }
    // console.log("user is", user);
    // console.log("REQUEST>BODY USER", req.body);
    const isMatch = user.password == password;
    if(isMatch === false){
      return res.status(400).json({message : "Mobile or password is incorrect"});
    }
    const token = await createToken(user);
    return res.status(200).json({message:"Login Sucessful", user ,token:token}); 
  
  }
  catch(err){
      return res.status(500).json({ message: `${err}` });
  }
})
userRouter.get("/getAllUsers",async(req,res)=>{
    try{
        // console.log("request in get all users",req.body);
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
      //  console.log("WE ARE INDISE OF IT" , req.params);
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
userRouter.put("/changeUserPassword/:id",async(req,res)=>{
  try{
   
    const {id} = req.params;
    const {currentPassword , newPassword} = req.body;
 
    const user = await IBSuser.findOne({_id:id});
  
    if(!user){
      return res.status(404).json({mesage:"User not found"});
    }
    console.log(user.password ,"and the",currentPassword);
    const isMatch = user.password == currentPassword;
    if(!isMatch){
      return res.status(400).json({message:"Current password is incorrect"});
    }
    console.log("isMatch is ",isMatch);
    user.password = newPassword;
    await user.save();
    return res.status(201).json({message:"Password changed successfully", success:true});
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
    if(year < 2025 || (year == 2025 && month =='July') ){
    // throw new Error("आपकी योजना अगस्त से शुरू होगी, तब तक प्रतीक्षा करें");
      return res.status(400).json({message:"आपकी योजना 2025 के अगस्त महीने में शुरू हुई है, आप पिछले महीने की प्रविष्टि नहीं जोड़ सकते"})
    }
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
    user.totalMonthlypayment +=amount;
    // HERE WE WILL IMPLEMENT CIBIL SCORE OF THE USER 
    const currentDate = new Date();
    const date = currentDate.getDate();
    if(date > 5 && date<= 15){
        user.cibilScore=user.cibilScore-5 
    }
    else{
      user.cibilScore+=2;
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


module.exports=userRouter;
