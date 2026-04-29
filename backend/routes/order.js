import express from "express";
import { db } from "../firebaseAdmin.js";
import { refundVNPay } from "../services/vnpayRefund.js";

const router = express.Router();

/// ===== TẠO ĐƠN HÀNG =====
router.post("/", async (req, res) => {
  try {
    const {
      userID,
      role,
      fullname,
      phone,
      email,
      address,
      province,
      commune,
      note,
      payment,
      items,
      total,
      orderId,
      status,
      paymentStatus,
      createdAt,
      isGuest,
    } = req.body;

    if (!fullname || !phone || !address || !province || !items || items.length === 0) {
      return res.status(400).json({ message: "Thiếu thông tin đơn hàng." });
    }

    const newOrder = {
      userID: userID || null,
      role: role || (isGuest ? "Guest" : "Customer"),
      fullname,
      phone,
      email: email || "",
      address,
      province,
      commune,
      note: note || "",
      payment: payment || "cod",
      paymentStatus: paymentStatus || "Chưa thanh toán",
      items,
      total,
      orderId: orderId || "ORD_" + Date.now(),
      status: status || "Chờ xử lý",
      createdAt: createdAt || new Date().toISOString(),
      isGuest: !!isGuest,

      isRefunded: false,
      refundedAt: null,
    };

    const docRef = await db.collection("Orders").add(newOrder);

    res.status(201).json({
      message: "Tạo đơn hàng thành công!",
      id: docRef.id,
      ...newOrder,
    });

  } catch (err) {
    console.error("❌ Lỗi tạo đơn:", err);
    res.status(500).json({ message: "Server error" });
  }
});


/// ===== LẤY TẤT CẢ ĐƠN =====
router.get("/", async (req, res) => {
  try {
    const snapshot = await db.collection("Orders").get();

    const orders = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(orders);

  } catch (err) {
    console.error("❌ Lỗi get orders:", err);
    res.status(500).json({ message: "Server error" });
  }
});


/// ===== CẬP NHẬT TRẠNG THÁI =====
router.patch("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const ref = db.collection("Orders").doc(id);
    const snap = await ref.get();

    if (!snap.exists) {
      return res.status(404).json({ message: "Không tìm thấy đơn." });
    }

    const data = snap.data();

    const updateData = { status };

    if (status === "Hoàn thành") {
      updateData.paymentStatus = "Đã thanh toán";
      updateData.shipping = {
        ...(data.shipping || {}),
        currentStatus: "delivered",
      };
    }

    if (status === "Đang giao") {
      updateData.shipping = {
        ...(data.shipping || {}),
        currentStatus: "in_transit",
      };
    }

    if (status === "Đã hủy") {
      updateData.paymentStatus = "Chưa thanh toán";
    }

    await ref.update(updateData);

    res.json({ message: "Cập nhật thành công" });

  } catch (err) {
    console.error("❌ Lỗi update status:", err);
    res.status(500).json({ message: "Server error" });
  }
});


/// ===== HỦY ĐƠN =====
router.post("/cancel", async (req, res) => {
  try {
    const orderId = req.body.orderId?.trim();

    const snapshot = await db
      .collection("Orders")
      .where("orderId", "==", orderId)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ message: "Không tìm thấy đơn hàng." });
    }

    const orderDoc = snapshot.docs[0];
    const orderData = orderDoc.data();

    if (
      orderData.status !== "Chờ xử lý" &&
      orderData.status !== "Đang xử lý"
    ) {
      return res.status(400).json({
        message: "Chỉ được hủy khi đơn đang xử lý",
      });
    }

    if (orderData.isRefunded) {
      return res.status(400).json({
        message: "Đơn đã được hoàn tiền trước đó",
      });
    }

    let isRefunded = false;
    let paymentStatus = orderData.paymentStatus;
    let responseMessage = "Hủy đơn thành công";

    if (orderData.paymentStatus === "Đã thanh toán") {
      if (orderData.payment === "vnpay" && orderData.vnpayTransactionNo) {
        const refundResult = await refundVNPay(orderData);

        if (refundResult?.vnp_ResponseCode !== "00") {
          return res.status(500).json({
            message: "Hoàn tiền VNPAY thất bại",
          });
        }

        paymentStatus = "Đã hoàn tiền";
        isRefunded = true;
        responseMessage = "Hủy đơn & hoàn tiền thành công";
      }
    }

    await orderDoc.ref.update({
      status: "Đã hủy",
      paymentStatus,
      isRefunded,
      refundedAt: isRefunded ? new Date().toISOString() : null,
    });

    res.json({ message: responseMessage });

  } catch (err) {
    console.error("❌ Lỗi hủy đơn:", err);
    res.status(500).json({ message: "Server error" });
  }
});


/// ===== XÓA ĐƠN =====
router.delete("/:id", async (req, res) => {
  try {
    await db.collection("Orders").doc(req.params.id).delete();
    res.json({ message: "Đã xóa" });

  } catch (err) {
    console.error("❌ Lỗi delete:", err);
    res.status(500).json({ message: "Server error" });
  }
});


/// ===== TẠO SHIPPING =====
router.patch("/:id/shipping", async (req, res) => {
  try {
    const { id } = req.params;

    const ref = db.collection("Orders").doc(id);

    await ref.update({
      status: "Đang giao",
      shipping: {
        carrier: "Giao Hàng Nhanh",
        trackingCode: "GHN" + Date.now(),
        currentStatus: "picked_up",
      },
    });

    res.json({ message: "Đã tạo vận chuyển" });

  } catch (err) {
    console.error("❌ Lỗi shipping:", err);
    res.status(500).json({ message: "Server error" });
  }
});


/// ===== PAYPAL =====
router.post("/paypal-success", async (req, res) => {
  try {
    const { cart, info } = req.body;

    const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

    const newOrder = {
      userID: null,
      role: "Guest",
      fullname: info?.fullname || "Khách",
      phone: info?.phone || "",
      email: info?.email || "",
      address: info?.address || "",
      payment: "paypal",
      paymentStatus: "Đã thanh toán",
      items: cart,
      total,
      orderId: "PP_" + Date.now(),
      status: "Chờ xử lý",
      createdAt: new Date().toISOString(),
      isGuest: true,

      isRefunded: false,
      refundedAt: null,
    };

    await db.collection("Orders").add(newOrder);

    res.json({ message: "Thanh toán PayPal OK" });

  } catch (err) {
    console.error("❌ PayPal error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;