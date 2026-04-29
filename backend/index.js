import dotenv from "dotenv";
dotenv.config();
import totpRoutes from "./routes/totpRoutes.js";
console.log("Chatbot AI Key (OpenAI):", process.env.OPENAI_API_KEY ? "Đã nạp" : "Chưa có");
console.log("CRYPTO_SECRET:", process.env.CRYPTO_SECRET);
import express from "express";
import cors from "cors";
import fileUpload from "express-fileupload";

// Routes
import productRoutes from "./routes/product.js";
import orderRoutes from "./routes/order.js";
import chatRoutes from "./routes/chat.js";
import paypalRoutes from "./routes/paypal.js";
import vnpayRoutes from "./routes/vnpay.js";

// Firebase
import { db } from "./firebaseAdmin.js";
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload());

// Routes
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/chat", chatRoutes); // Chatbot OpenAI của bạn sẽ nằm ở đây
app.use("/api/paypal", paypalRoutes);
app.use("/api/vnpay", vnpayRoutes);

app.get("/", (req, res) => res.send("Server OK - OpenAI Chatbot Active"));
app.use("/api/totp", totpRoutes);
// Test Firebase
const testFirebase = async () => {
  try {
    const snapshot = await db.collection("Products").get();
    console.log(`Firebase connected. Products count: ${snapshot.size}`);
  } catch (err) {
    console.error("Firebase connection error:", err.message);
  }
};

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", async () => {
  console.log(`Backend running on port ${PORT}`);
  await testFirebase();
});