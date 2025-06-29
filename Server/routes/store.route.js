const express = require('express');

const IBSstore = require('../models/Store.model');
const storeRouter = express.Router();

const {auth} = require('../auth/auth.middleware');


storeRouter.post("/getStoreBalance",async(req,res)=>{
    try{
        const {userId}= req.body;
        console.log("USER IN STORE", req.body);
        let store =await IBSstore.findOne({userId:userId});
        console.log("STORE IS", store);
        if(!store){
             res.status(404).json({message:"No Store Availble"});
        }
         return res.status(200).json({message:"Store successful" ,store , success : true})
    }
    catch(err){
         return res.status(500).json({message:`${err}`})
    }
})

storeRouter.put("/updateMonthlyFees", async(req,res)=>{
    try{
        const { userId, year, month, amount } = req.body;
        if (!userId || !year || !month || !amount) {
            return res.status(400).json({ message: "userId, year, month, and amount are required" });
        }

        let store = await IBSstore.findOne({ userId: userId });
        if (!store) {
            return res.status(404).json({ message: "Store not found" });
        }

        if (!store.monthlyPayment) {
            store.monthlyPayment = [];
        }

        // Add the payment for the given month and year
        // Check if a payment for the given year and month already exists
        const existingPayment = store.monthlyPayment.find(
            (payment) => payment.year === year && payment.month === month
        );

        if (existingPayment) {
            // If exists, add the new amount to the existing amount
            existingPayment.amount += amount;
        } else {
            // If not, add a new payment entry
            store.monthlyPayment.push({ year, month, amount });
        }

        // Update the totalInstallmentsCollected by adding the new amount
        // store.totalInstallmentsCollected += amount;

        await store.save();

        return res.status(200).json({ message: "Monthly fee updated", store, success: true });
    }
    catch(err){
          return res.status(500).json({message:`${err}`})
    }
})

storeRouter.post("/createStore" , async(req,res)=>{
    try{
        const{userId}= req.body;
        const store=req.body;
        let existingStore = await IBSstore.findOne({userId:userId});
        if(existingStore){
            return res.status(400).json({message:"Store already exist"});
        }
        const newStore= new IBSstore(store);
        await newStore.save();
        return res.status(201).json({message:"Store registration successfully", newStore,success:true});
    }
    catch(err){
        return res.status(500).json({message:`${err}`})
    }
})
module.exports=storeRouter;