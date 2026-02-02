const express = require("express");
const MunicipalityRouter = express.Router();
const {
  createMunicipality,
  getMyMunicipalities
} = require("../controller/municipality.controller");
const auth = require("../middlewares/auth.middleware")
// Can be protected later with admin auth if needed
MunicipalityRouter.post("/addMunicipality", createMunicipality);
MunicipalityRouter.get("/getMyMunicipality", auth ,getMyMunicipalities)

module.exports = MunicipalityRouter;
