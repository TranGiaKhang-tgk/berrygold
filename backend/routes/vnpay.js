import express from "express";
import vnpayController from "../controllers/vnpayController.js";

const router = express.Router();

router.post("/create_payment_url", vnpayController.createPaymentUrl);
router.get("/vnpay_return", vnpayController.vnpayReturn);

export default router;