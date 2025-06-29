const express= require('express');

const adminRouter = express.Router();

const IBSadmin = require('../models/admin.model');
adminRouter.post("/registerAdmin", async(req,res)=>{
    try{
          const user = req.body;
       
    let existingAdmin = await IBSadmin.findOne({mobile:user.mobile});
    
    if(existingAdmin){
        return res.status(401).json({message:'User already exist', success :false});
    }
     let newAdmin = new IBSadmin(user);
    console.log(newAdmin, "New Admin is");
        await newAdmin.save();
      return res.status(201).json({message:"Admin registered successfully" ,newAdmin , success:true})
    }
    catch(err){
        res.status(500).json({message:"Server Error"});
    }
  

})




module.exports=adminRouter;