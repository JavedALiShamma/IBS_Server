const express = require("express");
const SubscribeRouter = express.Router();
const {
  createSubscriptionForEmployee,
  getSubscriptionStatus,
} = require("../controller/subscrption.controller");
const auth = require("../middlewares/auth.middleware");
// ⚠️ TEMP: protect later with admin auth
SubscribeRouter.post("/subscription/test-create", createSubscriptionForEmployee);
SubscribeRouter.get("/subscription/status",auth ,getSubscriptionStatus);
module.exports = SubscribeRouter;
