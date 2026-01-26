const express = require("express");
const MunicipalityRouter = express.Router();
const {
  createMunicipality
} = require("../controller/municipality.controller");

// Can be protected later with admin auth if needed
MunicipalityRouter.post("/addMunicipality", createMunicipality);

module.exports = MunicipalityRouter;
