const express = require('express');

const paymentRouter = express.Router();

const auth = require('../middlewares/auth.middleware');

const {createOrder, verifyPayment}  = require('../controller/payment.controller');
paymentRouter.post("/create-order" , auth , createOrder);
paymentRouter.post("/verify-payment" , auth , verifyPayment);

module.exports = paymentRouter;