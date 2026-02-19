const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    ulbcode: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    ulbEmail:{
      type: String,
      lowercase: true,
    },
    password: {
    type: String,
    required: true,
    minlength: 6,
    select: false, // IMPORTANT
    },
    mobile: {
      type: String,
      required: true,
      match: /^[6-9]\d{9}$/,
    },
    email: {
      type: String,
      lowercase: true,
    },
    role: {
      type: String,
      enum: ["MIS Engineer", "Computer Operator", "Other"],
      default: "MIS Engineer",
    },
    department: {
      type: String,
    },

    designation: {
      type: String,
    },
   
    municipalityId :{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Municipality",
        required: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
    extraCharge:{
        isAnyExtraCharge : {
            type:Boolean,
            default:false,
        },
        extraMunicipalityId :{
           type: mongoose.Schema.Types.ObjectId,
            ref: "Municipality",
           default :null
        }
    },
    subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subscription",
    default: null,
    }

  },
  { timestamps: true }
);

module.exports = mongoose.model("Employee", employeeSchema);
