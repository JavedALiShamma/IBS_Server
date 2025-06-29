const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const IBSSuperAdminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'please enter your name']
  },
  mobile: {
    type: String,
    required: [true, 'please enter your mobile number'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'please enter your password'],
    minlength: [6, 'password must be at least 6 characters'],
  },
  email: {
    type: String,
    unique: true,
    match: [/.+\@.+\..+/, 'Please fill a valid email address']
  },
  role: {
    type: String,
    default: 'superadmin',
    enum: ['user', 'admin', 'superadmin']
  },
  socketID: {
    type: String,
    default: null
  }
});

// Pre-save middleware to hash password
IBSSuperAdminSchema.pre('save', async function (next) {
  try {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (err) {
    console.error("Error hashing password:", err);
    next(err);
  }
});

// Instance method to compare passwords
IBSSuperAdminSchema.methods.comparePassword = async function (enteredPassword) {
  try {
    const isMatch = await bcrypt.compare(enteredPassword, this.password);
    return isMatch;
  } catch (err) {
    console.error("Error comparing password:", err);
    throw err;
  }
};

const IBSSuperAdmin = mongoose.model('IBSSuperAdmin', IBSSuperAdminSchema);
module.exports = IBSSuperAdmin;
