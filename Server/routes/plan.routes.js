const express = require("express");
const PlanRouter = express.Router();
const {
  createPlan,
  getActivePlans,
  getPlanById,
  updatePlan,
  deactivatePlan,
} = require("../controller/plan.controller");
    // We require them later
// const auth = require("../middlewares/");
// const isAdmin = require("../middlewares/isAdmin.middleware");

// Admin routes
PlanRouter.post("/addPlan", createPlan);
PlanRouter.put("/:id", updatePlan);
// PlanRouter.delete("/:id", auth, isAdmin, deactivatePlan);

// App routes
PlanRouter.get("/getAllPlans", getActivePlans);
// PlanRouter.get("/:id", auth, getPlanById);

module.exports = PlanRouter;
