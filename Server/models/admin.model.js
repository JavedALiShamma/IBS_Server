const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const IBSSuperAdmin = require('./superAdmin.model');


const IBSadminSchema =new mongoose.Schema({
    name:{
        type:String,
        required:[true, 'please enter your name']
    },
    mobile:{
        type:Number,
        required:[true, 'please enter your mobile number'],
        unique:true,
    },
    password:{
        type:String,
        required:[true, 'please enter your password'],
        minlength:[6, 'password must be at least 6 characters'],
    },
    email:{
        type:String,
        
        unique:true,
    },
    role:{
        type:String,
        default:'admin',
        enum:['user', 'admin','superadmin']
    },
    address:{
        type:String,
        default:"null",
    },
    // Here we wil usr refrence to the user model
    IBSSuperAdmin:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'IBSSuperAdmin',
        required: true // Ensure that every admin is associated with a super admin
    },
    socketID:{
        type:String,
        default:null
    }
},{
    timestamps: true,
    collection: 'ibssuperadmins'
}
)

// Hash the password before saving the user
IBSadminSchema.pre('save',async function(next){
    try{
        if(!this.isModified('password')){
            return next();
        }
        this.password= await bcrypt.hash(this.password, 10); // Hash the password with a salt round of 10
        next();
    }
    catch(err){
        console.log("Error hashing password:", err);
        next(err);
    }
})


IBSadminSchema.methods.comparePassword = async function(enteredPassword ,next){
        try{
            isMatch = await bcrypt.compare(enteredPassword, this.password);
            return isMatch; // Return true if the password matches, false otherwise
        }
        catch(err){
            console.log("Error comparing password:", err);
            next(err);
        }
} 

const IBSadmin = mongoose.model('IBSadmin', IBSadminSchema);   

module.exports = IBSadmin; // Export the model for use in other parts of the application

