const mongoose = require("mongoose");

const municipalitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    ulbcode :{
        type: Number,
        required:[ true , 'Municipality code is required'],
        trim :true
    },
    address: {
      type: String,
      required: true,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
      },
    },

    radiusInMeters: {
      type: Number,
      default: 500, // allowed distance
    },
    city: String,
    state: String,
    district : String,
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
  },
  { timestamps: true }
);

// Required for geo queries
municipalitySchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Municipality", municipalitySchema);
