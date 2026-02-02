const Municipality = require("../models/municipality.model");

const createMunicipality = async (req, res) => {
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
const getMyMunicipalities = async (req, res) => {
  try {
    const employee = req.user;
    // console.log("CALLING IN GET MUNICIPALITY");
    if (!employee.municipalityId) {
      return res.status(400).json({
        success: false,
        message: "Municipality not assigned to employee",
      });
    }

    // 1️⃣ Always fetch primary municipality
    const municipalityIds = [employee.municipalityId];

    // 2️⃣ Add extra-charge municipality if exists
    if (
      employee.extraCharge?.isAnyExtraCharge === true &&
      employee.extraCharge?.extraMunicipalityId
    ) {
      municipalityIds.push(employee.extraCharge.extraMunicipalityId);
    }

    // 3️⃣ Fetch municipalities
    const municipalities = await Municipality.find({
      _id: { $in: municipalityIds },
      status: "ACTIVE",
    }).select(
      "name ulbcode address city district state radiusInMeters location"
    );

    return res.status(200).json({
      success: true,
      count: municipalities.length,
      municipalities,
    });
  } catch (error) {
    console.error("Get employee municipalities error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch municipality details",
    });
  }
};
module.exports ={ createMunicipality ,getMyMunicipalities}