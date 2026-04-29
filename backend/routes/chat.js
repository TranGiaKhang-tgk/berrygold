import express from "express";
import { chatWithAI } from "../controllers/chatController.js";

const router = express.Router();

// 🔥 Chatbot AI
router.post("/", chatWithAI);

// (tuỳ chọn) test nhanh API
router.get("/test", (req, res) => {
  res.json({ message: "Chat API OK" });
});

export default router;