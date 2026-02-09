const Plan = require("../models/plan.model");

const createPlan = async (req, res) => {
  try {
    const plan = new Plan(req.body);
    await plan.save();

    res.status(201).json({
      success: true,
      message: "Plan created successfully",
      plan,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getActivePlans = async (req, res) => {
  try {
    const plans = await Plan.find({ status: "ACTIVE" })
      .sort({ sortOrder: 1 });

    res.status(200).json({
      success: true,
      plans,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch plans",
    });
  }
};
const updatePlan = async (req, res) => {
  try {
    const plan = await Plan.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({
      success: true,
      message: "Plan updated",
      plan,
    });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};
module.exports ={
    getActivePlans,
    createPlan,
    updatePlan
}