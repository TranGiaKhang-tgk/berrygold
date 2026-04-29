import axios from "axios";
import moment from "moment";
import * as crypto from "crypto"; // ✅ FIX crypto

export const refundVNPay = async (order) => {
  const date = new Date();

  const vnp_TmnCode = "W3QZD5JH";
  const vnp_HashSecret = "3IBIP8MMRR0Q5TXV3XT4URK781NYL0AE";

  // ✅ FIX 1: tránh trùng RequestId
  const vnp_RequestId =
    moment(date).format("HHmmss") + Math.floor(Math.random() * 1000);

  const vnp_Version = "2.1.0";
  const vnp_Command = "refund";

  const vnp_TxnRef = order.orderId;

  // ⚠️ Đảm bảo total là VND (chưa *100 trước đó)
  const vnp_Amount = order.total * 100;

  const vnp_TransactionType = "02";

  const vnp_TransactionNo = order.vnpayTransactionNo;

  // ✅ FIX 2: chỉ dùng đúng paymentDate từ VNPAY
  const rawTransactionDate = order.paymentDate;

  if (!rawTransactionDate) {
    throw new Error("Missing vnp_PayDate for refund");
  }

  // ✅ FIX 3: parse đúng format VNPAY
  const vnp_TransactionDate = moment(
    rawTransactionDate,
    "YYYYMMDDHHmmss"
  ).format("YYYYMMDDHHmmss");

  const vnp_CreateDate = moment(date).format("YYYYMMDDHHmmss");

  // 🔥 DEBUG (rất quan trọng)
  console.log("REFUND DATA:", {
    vnp_TxnRef,
    vnp_Amount,
    vnp_TransactionNo,
    vnp_TransactionDate,
  });

  const signData =
    vnp_RequestId +
    "|" +
    vnp_Version +
    "|" +
    vnp_Command +
    "|" +
    vnp_TmnCode +
    "|" +
    vnp_TransactionType +
    "|" +
    vnp_TxnRef +
    "|" +
    vnp_Amount +
    "|" +
    vnp_TransactionNo +
    "|" +
    vnp_TransactionDate +
    "|" +
    "admin" +
    "|" +
    vnp_CreateDate +
    "|" +
    "127.0.0.1" +
    "|" +
    "Hoan tien";

  const vnp_SecureHash = crypto
    .createHmac("sha512", vnp_HashSecret)
    .update(signData)
    .digest("hex");

  const payload = {
    vnp_RequestId,
    vnp_Version,
    vnp_Command,
    vnp_TmnCode,
    vnp_TransactionType,
    vnp_TxnRef,
    vnp_Amount,
    vnp_TransactionNo,
    vnp_OrderInfo: "Hoan tien",
    vnp_TransactionDate,
    vnp_CreateBy: "admin",
    vnp_CreateDate,
    vnp_IpAddr: "127.0.0.1",
    vnp_SecureHash,
  };

  const response = await axios.post(
    "https://sandbox.vnpayment.vn/merchant_webapi/api/transaction",
    payload,
    {
      headers: {
        "Content-Type": "application/json",
      },
      validateStatus: () => true,
    }
  );

  console.log("VNPAY REFUND RESPONSE:", response.data);

  return response.data;
};