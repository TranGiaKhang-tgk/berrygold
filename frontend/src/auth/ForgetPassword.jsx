import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import "../style/ForgetPassword.css";

export default function ForgetPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Vui lòng nhập email!");
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);

      toast.success(
        "Email đặt lại mật khẩu đã được gửi! Vui lòng kiểm tra hộp thư (và cả thư rác)."
      );
      setEmail("");
    } catch (error) {
      console.error("Error sending reset email:", error);

      switch (error.code) {
        case "auth/invalid-email":
          toast.error("Email không hợp lệ!");
          break;
        case "auth/user-not-found":
          toast.error("Không tìm thấy tài khoản với email này!");
          break;
        case "auth/too-many-requests":
          toast.error("Bạn đã yêu cầu quá nhiều lần. Vui lòng thử lại sau!");
          break;
        case "auth/unauthorized-continue-uri":
          toast.error("Tên miền chưa được cho phép trong Firebase!");
          break;
        default:
          toast.error("Đã xảy ra lỗi, vui lòng thử lại!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Quên mật khẩu</h2>
        <p>Nhập email của bạn để nhận liên kết đặt lại mật khẩu.</p>

        <form onSubmit={handleReset}>
          <input
            type="email"
            placeholder="Nhập email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="auth-input"
            autoFocus
            required
          />
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? "Đang gửi..." : "Gửi liên kết đặt lại"}
          </button>
        </form>

        <div className="auth-footer">
          <Link to="/auth/login">← Quay lại đăng nhập</Link>
        </div>
      </div>
    </div>
  );
}
