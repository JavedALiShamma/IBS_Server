const express = require('express');
const mongoose = require('mongoose');
const QuranHadeesRouter = express.Router();
const QuranHadees = require('../models/QuranHadees.model');

QuranHadeesRouter.post("/addQuranHadees",async(req,res)=>{
    try{
        const{
            topic,
            content,
            translation,
            reference,
            sanad,
            category
        } = req.body;
        const newEntry = new QuranHadees({
            topic,
            content,
            translation,
            reference,
            sanad,
            category
        });
        await newEntry.save();
        return res.status(201).json({message:"Successfully Added", newEntry});
    }
    catch(err){
        return res.status(500).json({message:err.message || "Error in Server"})
    }
})

QuranHadeesRouter.get("/getQuraanHadees",async(req,res)=>{
    try {
        const count = await QuranHadees.countDocuments();
        if (count === 0) {
            return res.status(404).json({ message: "No entries found" });
        }
        const random = Math.floor(Math.random() * count);
        const randomEntry = await QuranHadees.findOne().skip(random);
        return res.status(200).json(randomEntry);
    } catch (err) {
        return res.status(500).json({ message: err.message || "Error in Server" });
    }
})
module.exports=QuranHadeesRouter;

