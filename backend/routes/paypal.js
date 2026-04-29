import express from "express";
import paypal from "@paypal/checkout-server-sdk";
import client from "../config/paypal.js";

import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebaseAdmin.js";

const router = express.Router();

// =============================
// 🔥 CREATE ORDER
// =============================
router.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    // 🔥 VNĐ → USD
    const usd = (amount / 24000).toFixed(2);

    const request = new paypal.orders.OrdersCreateRequest();

    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD",
            value: usd,
          },
        },
      ],
      application_context: {
        return_url: "http://localhost:3000/success",
        cancel_url: "http://localhost:3000/cancel",
      },
    });

    const order = await client.execute(request);

    const approveUrl = order.result.links.find(
      (link) => link.rel === "approve"
    );

    res.json({ url: approveUrl.href });

  } catch (err) {
    console.error("🔥 PayPal create error:", err);
    res.status(500).json({ error: "PayPal error" });
  }
});


// =============================
// 🔥 CAPTURE + SAVE FIREBASE
// =============================
router.post("/capture-paypal", async (req, res) => {
  try {
    const { token, cart, info } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Missing token" });
    }

    // ✅ FIX TÊN CLASS (QUAN TRỌNG)
    const request = new paypal.orders.OrdersCaptureRequest(token);
    request.requestBody({});

    const capture = await client.execute(request);

    console.log("✅ PAYPAL:", capture.result);

    if (capture.result.status === "COMPLETED") {

      // 🔥 LƯU ĐÚNG COLLECTION + FORMAT ADMIN
      await addDoc(collection(db, "Orders"), {
        fullname: info?.name || "Khách PayPal",
        email: info?.email || "",
        address: info?.address || "",
        commune: info?.commune || "",

        createdAt: new Date().toISOString(),

        items: cart.map(item => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),

        totalAmount: cart.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        ),

        isGuest: true,
        isRefunded: false,

        status: "Đang giao",
        paymentMethod: "PAYPAL",
        paymentStatus: "Đã thanh toán",
      });

      return res.json({ success: true });
    }

    res.status(400).json({ error: "Payment chưa hoàn tất" });

  } catch (err) {
    console.error("❌ Capture error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;