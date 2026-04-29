import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../context/cartContext";
import { useRef } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../firebase";

export default function Success() {
  const hasSaved = useRef(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();

  const [paymentInfo, setPaymentInfo] = useState({
    amount: 0,
    receiver: "BERRYGOLD SHOP",
    method: "",
    time: new Date().toLocaleString(),
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    console.log("URL PARAMS:", location.search);

    const token = params.get("token");
    const payerId = params.get("PayerID");
    const vnpAmount = params.get("amount");

    // 🔥 Ưu tiên VNPAY
    if (vnpAmount && !isNaN(vnpAmount)) {
      setPaymentInfo({
        amount: Number(vnpAmount),
        receiver: "BERRYGOLD SHOP",
        method: "VNPAY",
        time: new Date().toLocaleString(),
      });
    } else {
      // 👉 fallback PayPal
      const savedPayment = JSON.parse(localStorage.getItem("payment_info") || "{}");

if (savedPayment?.amount) {
  setPaymentInfo({
    amount: savedPayment.amount,
    receiver: "BERRYGOLD SHOP",
    method: savedPayment.method || "PAYPAL",
    time: new Date().toLocaleString(),
  });
} else {
  // 🔥 FIX 0đ → lấy từ cart
  const cart = JSON.parse(localStorage.getItem("checkout_cart") || "[]");

  const total = cart.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );

  setPaymentInfo({
    amount: total,
    receiver: "BERRYGOLD SHOP",
    method: "PAYPAL",
    time: new Date().toLocaleString(),
  });
}
    }

    // 🔥 SAVE PAYPAL ORDER
    const saveOrder = async () => {
      try {
    if (hasSaved.current) return;
    hasSaved.current = true;
    if (token && localStorage.getItem("paid_" + token)) return;
    if (token) localStorage.setItem("paid_" + token, "true");
        // 👉 CHỈ chạy khi là PayPal
        if (!token || !payerId) return;

        console.log("🔥 PayPal detected:", token, payerId);

        const cart = JSON.parse(localStorage.getItem("checkout_cart") || "[]");
        const info = JSON.parse(localStorage.getItem("checkout_info") || "{}");

        if (cart.length === 0) {
          console.warn("⚠️ Cart rỗng, không lưu đơn");
          return;
        }

        // 👉 GỌI BACKEND
        const res = await fetch("http://localhost:5000/api/orders/paypal-success", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            payerId,
            cart,
            info,
          }),
        });

        if (res.ok) {
          console.log("✅ Saved via backend");
        } else {
          console.warn("⚠️ Backend fail → lưu trực tiếp Firebase");

          // 🔥 FALLBACK FIREBASE
          await addDoc(collection(db, "Orders"), {
            orderId: "DH" + Date.now(),
            payment: "paypal",
            paymentStatus: "Đã thanh toán",
            items: cart,
            ...info,
            createdAt: new Date().toISOString(),
          });

          console.log("✅ Saved directly to Firebase");
        }

        // 👉 clear data
        clearCart();
        localStorage.removeItem("checkout_cart");
        localStorage.removeItem("checkout_info");
        localStorage.removeItem("payment_info");

        window.dispatchEvent(new Event("cartUpdated"));
      } catch (err) {
        console.error("❌ Lỗi lưu đơn:", err);
      }
    };

    saveOrder();

    const timer = setTimeout(() => {
      navigate("/");
    }, 6000);

    return () => clearTimeout(timer);
  }, [location, navigate, clearCart]);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.icon}>✔</div>

        <h2>Giao dịch thành công</h2>

        <h1 style={styles.amount}>
          {paymentInfo.amount.toLocaleString()}đ
        </h1>

        <hr />

        <div style={styles.row}>
          <span>Người nhận</span>
          <b>{paymentInfo.receiver}</b>
        </div>

        <div style={styles.row}>
          <span>Phương thức</span>
          <b>{paymentInfo.method}</b>
        </div>

        <div style={styles.row}>
          <span>Thời gian</span>
          <b>{paymentInfo.time}</b>
        </div>

        <button style={styles.button} onClick={() => navigate("/")}>
          Về trang chủ
        </button>
      </div>
    </div>
  );
}
const styles = {
  container: {
    height: "100vh",
    background: "#fce4ec",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    background: "#fff",
    padding: "30px",
    borderRadius: "20px",
    width: "350px",
    textAlign: "center",
    boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
  },
  icon: {
    fontSize: "50px",
    color: "green",
  },
  amount: {
    color: "#e91e63",
    margin: "10px 0",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "10px",
  },
  button: {
    marginTop: "20px",
    padding: "10px",
    width: "100%",
    background: "#e91e63",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
  },
};