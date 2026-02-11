const razorpay = require("../config/razorPay.config");

const Plan = require("../models/plan.model");
const crypto = require("crypto");
const Payment = require("../models/payment.model");
const Subscription = require("../models/subscription.model");


 const createOrder = async (req, res) => {
  try {
    console.log("Create order request body:", req.body);
    // Here we need the user from the auth middleware
    const user = req.user;

    const { planId } = req.body;

    if (!planId) {
      return res.status(400).json({ message: "Plan ID is required" });
    }

    // 1️⃣ Fetch plan
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    // 2️⃣ Create Razorpay order
    const options = {
      amount: plan.pricePerMonth * 100, // ₹ → paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    // 3️⃣ Save payment (created state)
    const payment = await Payment.create({
      user: user._id,
      plan: plan._id,
      razorpayOrderId: order.id,
      amount: order.amount,
      currency: order.currency,
      status: "created",
    });

    // 4️⃣ Send data to frontend
    res.status(201).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      paymentId: payment._id,
      planName: plan.name,
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ message: "Unable to create order" });
  }
};

const verifyPayment = async (req, res) => {
  try {
    console.log("Verify payment request body:", req.body);
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      paymentId,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !paymentId
    ) {
      return res.status(400).json({ message: "Invalid payment data" });
    }

    // 1️⃣ Fetch payment record
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    // Check if already verified
    if (payment.status === "success") {
      return res
        .status(400)
        .json({ message: "Payment already verified successfully" });
    }
    // 2️⃣ Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      payment.status = "failed";
      await payment.save();

      return res.status(400).json({ message: "Payment verification failed" });
    }

    // 3️⃣ Mark payment success
    payment.status = "success";
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.paidAt = new Date();
    await payment.save();

    // 4️⃣ Activate / update subscription
    const startDate = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    const subscription =await Subscription.findOneAndUpdate(
      { user: payment.user },
      {
        user: payment.user,
        planId: payment.plan,
       
        startDate,
        endDate :expiryDate,
        paymentStatus: "ACTIVE",
      },
      { upsert: true, new: true }
    );
    await Employee.findByIdAndUpdate(payment.user, {
    subscriptionId: subscription._id,
    });
    res.json({
      success: true,
      message: "Payment verified & subscription activated",
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    res.status(500).json({ message: "Payment verification failed" });
  }
};
module.exports ={
    createOrder,
    verifyPayment
}
