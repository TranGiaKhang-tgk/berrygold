import crypto from "crypto";
import moment from "moment";
import axios from "axios";
import { db } from "../firebaseAdmin.js";

const tmnCode = "W3QZD5JH"; 
const secretKey = "3IBIP8MMRR0Q5TXV3XT4URK781NYL0AE"; 
const vnpUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
const returnUrl = "http://localhost:5000/api/vnpay/vnpay_return";


// ================== CREATE PAYMENT ==================
const createPaymentUrl = (req, res) => {
    try {
        const date = new Date();
        const createDate = moment(date).format("YYYYMMDDHHmmss");

        const orderId = req.body.orderId;
        const amount = Math.floor(Number(req.body.amount));

        let vnp_Params = {
            vnp_Version: "2.1.0",
            vnp_Command: "pay",
            vnp_TmnCode: tmnCode,
            vnp_Locale: "vn",
            vnp_CurrCode: "VND",
            vnp_TxnRef: orderId,
            vnp_OrderInfo: "Thanh toan don hang " + orderId,
            vnp_OrderType: "other",
            vnp_Amount: amount * 100,
            vnp_ReturnUrl: returnUrl,
            vnp_IpAddr: "127.0.0.1",
            vnp_CreateDate: createDate,
        };

        const sortedParams = Object.keys(vnp_Params).sort().reduce((obj, key) => {
            obj[key] = vnp_Params[key];
            return obj;
        }, {});

        const signData = Object.keys(sortedParams)
            .map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(sortedParams[key]).replace(/%20/g, "+"))
            .join("&");

        const signed = crypto
            .createHmac("sha512", secretKey)
            .update(Buffer.from(signData, "utf-8"))
            .digest("hex");

        const finalUrl = vnpUrl + "?" + signData + "&vnp_SecureHash=" + signed;

        return res.json({ url: finalUrl });

    } catch (err) {
        console.error("VNPAY ERROR:", err);
        res.status(500).json({ error: "Lỗi tạo link thanh toán" });
    }
};


// ================== RETURN ==================
const vnpayReturn = async (req, res) => {
    try {
        const vnp_Params = req.query;

        const responseCode = vnp_Params["vnp_ResponseCode"];
        const orderId = vnp_Params["vnp_TxnRef"];
        const transactionNo = vnp_Params["vnp_TransactionNo"];
        const amount = Number(vnp_Params["vnp_Amount"] || 0) / 100;
        const paymentDate = vnp_Params["vnp_PayDate"];

        if (responseCode !== "00") {
            return res.redirect("http://localhost:3000/payment-fail");
        }

        // 🔥 DÙNG FIREBASE ADMIN (ĐÚNG)
        const snapshot = await db.collection("Orders")
            .where("orderId", "==", orderId)
            .get();

        if (snapshot.empty) {
            console.log("❌ Không tìm thấy đơn hàng");
            return res.redirect("http://localhost:3000/payment-fail");
        }

        const orderDoc = snapshot.docs[0];
        const orderRef = orderDoc.ref;
        const orderData = orderDoc.data();

        // tránh trừ kho 2 lần
        if (orderData.paymentStatus === "Đã thanh toán") {
            return res.redirect("http://localhost:3000/payment-success");
        }

        // 🔥 TRỪ KHO
        for (const item of orderData.items || []) {
            await db.collection("Products").doc(item.id).update({
                quantity: (item.quantity * -1)
            });
        }

        // 🔥 UPDATE ORDER
        await orderRef.update({
            paymentStatus: "Đã thanh toán",
            status: "Đang xử lý",
            vnpayTransactionNo: transactionNo,
            paymentDate: paymentDate || "",
        });

        return res.redirect(
            `http://localhost:3000/payment-success?amount=${amount}&method=VNPAY`
        );

    } catch (err) {
        console.error("❌ VNPAY ERROR:", err);
        return res.redirect("http://localhost:3000/payment-fail");
    }
};


// ================== REFUND (OPTIONAL) ==================
const refundVNPay = async (order) => {
    try {
        console.log("Mock refund:", order.orderId);
        return { vnp_ResponseCode: "00" };
    } catch (err) {
        console.error("Refund error:", err);
        return null;
    }
};

export default { createPaymentUrl, vnpayReturn, refundVNPay };