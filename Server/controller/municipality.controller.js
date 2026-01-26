const Municipality = require("../models/municipality.model");

exports.createMunicipality = async (req, res) => {
  try {
    const {
      name,
      ulbcode,
      address,
      city,
      district,
      state,
      latitude,
      longitude,
      radiusInMeters
    } = req.body;

    // Basic validation
    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: "Latitude and Longitude are required"
      });
    }

    // Check duplicate ULB code
    const exists = await Municipality.findOne({ ulbcode });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Municipality with this ULB code already exists"
      });
    }

    const municipality = new Municipality({
      name,
      ulbcode,
      address,
      city,
      district,
      state,
      radiusInMeters,
      location: {
        type: "Point",
        coordinates: [longitude, latitude] // IMPORTANT ORDER
      }
    });

    await municipality.save();

    res.status(201).json({
      success: true,
      message: "Municipality added successfully",
      municipality
    });

  } catch (error) {
    console.error("Create Municipality Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};
