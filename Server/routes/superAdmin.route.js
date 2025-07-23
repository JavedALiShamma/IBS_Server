const express = require('express');
const router = express.Router();

const IBSSuperAdmin = require("../models/superAdmin.model");
const { auth, createToken } = require('../auth/auth.middleware');
const IBSadmin = require('../models/admin.model');

router.post("/registerSuperAdmin", async (req, res) => {
    try {
        const superAdmin = req.body;
        
        // Check by mobile or email (not _id)
        let user = await IBSSuperAdmin.findOne({ mobile: superAdmin.mobile });
        if (user) {
            return res.status(400).json({ message: "Super admin already exists", success: false });
        }

        user = new IBSSuperAdmin(superAdmin);
      

        await user.save();
      

        // const token = await createToken(user);

        res.status(201).json({
            message: "SuperAdmin registered successfully",
            user,
            success: true
        });

    } catch (err) {
        console.error("Registration error:", err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
});
// Login as a super admin
router.post("/loginSuperAdmin",async(req,res)=>{
    try{
       
        const{ email,password,mobile}=req.body;
       
        const user=await IBSSuperAdmin.findOne({mobile:mobile}) || await IBSadmin.findOne({mobile:mobile});
        ////////
        ///
        console.log("User is",user);
        if(!user){
            return res.status(404).json('User not found');
        }
       
        const isMatch=await user.comparePassword(password);
        if(!isMatch){
            return res.status(400).json('Invalid Username or password');
        }
        
        const token =await createToken(user);
       return res.status(200).json({message:"Login Sucessful", user ,token:token});          
    }
    catch(err){
        return res.status(500).json({error:err , success:false});
    }
})
/// Here we need to add Auth
router.get("/getAllAdmins",auth,async(req,res)=>{
    try{
        const users=await IBSSuperAdmin.find({role:'admin'});
        res.status(200).json({users,success:true});
    }
    catch(err){
         return res.status(500).json({error:err , success:false});
    }
})
module.exports = router;
