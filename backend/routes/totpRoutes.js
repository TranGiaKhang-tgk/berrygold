import express from "express";
import { setupTOTP, verifyTOTP, checkTOTP } from "../controllers/totpController.js";

const router = express.Router();

router.post("/setup", setupTOTP);
router.post("/verify", verifyTOTP);
router.post("/check", checkTOTP);

export default router;