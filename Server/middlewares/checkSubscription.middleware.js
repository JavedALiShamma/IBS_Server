const Subscription = require("../models/subscription.model");

module.exports = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({
      user: req.user._id,
      paymentStatus: "ACTIVE",
      endDate: { $gte: new Date() },
    }).populate("planId");

    if (!subscription) {
      return res.status(403).json({
        success: false,
        message: "No active subscription found",
      });
    }

    req.subscription = subscription;
    req.plan = subscription.planId;

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Subscription validation failed",
    });
  }
};
