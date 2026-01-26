const Subscription = require("../models/subscription.model");
const Plan = require("../models/plan.model");
const Employee = require("../models/employee.model");

const createSubscriptionForEmployee = async (req, res) => {
  try {
    const { employeeId, planId } = req.body;

    if (!employeeId || !planId) {
      return res.status(400).json({
        success: false,
        message: "employeeId and planId are required",
      });
    }

    // 1️⃣ Validate employee
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    // 2️⃣ Validate plan
    const plan = await Plan.findById(planId);
    if (!plan || plan.status !== "ACTIVE") {
      return res.status(400).json({
        success: false,
        message: "Invalid or inactive plan",
      });
    }

    // 3️⃣ Expire old subscriptions (optional but recommended)
    await Subscription.updateMany(
      { employeeId, paymentStatus: "ACTIVE" },
      { $set: { paymentStatus: "EXPIRED" } }
    );

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + plan.durationInDays);

    // 4️⃣ Create subscription
    const subscription = new Subscription({
      employeeId,
      planId,
      startDate,
      endDate,
      paymentStatus: "ACTIVE",
      remoteDaysUsedThisMonth: 0,
    });

    await subscription.save();

    // 5️⃣ 🔥 LINK subscription to employee (THIS WAS MISSING)
    employee.subscriptionId = subscription._id;
    await employee.save();

    res.status(201).json({
      success: true,
      message: "Subscription created and linked to employee",
      subscription,
    });
  } catch (error) {
    console.error("Create subscription error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create subscription",
    });
  }
};
const getSubscriptionStatus = async (req, res) => {
  try {
    const employeeId = req.user._id;

    // 1️⃣ Find latest subscription (if multiple exist)
    const subscription = await Subscription.findOne({ employeeId })
      .sort({ createdAt: -1 })
      .populate("planId");

    // 2️⃣ No subscription
    if (!subscription) {
      return res.status(200).json({
        hasSubscription: false,
        status: "NONE",
      });
    }

    const today = new Date();
    const endDate = new Date(subscription.endDate);

    // 3️⃣ Determine status
    let status = subscription.paymentStatus;

    if (endDate < today) {
      status = "EXPIRED";
    }

    // 4️⃣ Days remaining (only for ACTIVE)
    let daysRemaining = 0;
    if (status === "ACTIVE") {
      const diffTime = endDate.getTime() - today.getTime();
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // 5️⃣ Response
    return res.status(200).json({
      hasSubscription: true,
      status,
      planName: subscription.planId?.name || "",
      planId: subscription.planId?._id || null,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      daysRemaining,
      remoteDaysUsedThisMonth: subscription.remoteDaysUsedThisMonth,
      maxRemoteDaysPerMonth:
        subscription.planId?.features?.maxRemoteDaysPerMonth || 0,
    });
  } catch (error) {
    console.error("Subscription status error:", error);
    res.status(500).json({
      message: "Failed to fetch subscription status",
    });
  }
};
module.exports ={createSubscriptionForEmployee , getSubscriptionStatus}