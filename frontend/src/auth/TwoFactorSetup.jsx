import { useState } from "react";

export default function TwoFactorSetup({ email, onSuccess }) {
  const [qrCode, setQrCode] = useState(null);
  const [token, setToken] = useState("");
  const [step, setStep] = useState("idle"); // idle | setup | verify
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // =====================
  // BƯỚC 1: Lấy QR Code
  // =====================
  const handleSetup = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("http://localhost:5000/api/totp/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.qrCode) {
        setQrCode(data.qrCode);
        setStep("verify");
      } else {
        setMessage("❌ " + data.error);
      }
    } catch (err) {
      setMessage("❌ Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  // =====================
  // BƯỚC 2: Xác minh mã 6 số
  // =====================
  const handleVerify = async () => {
    if (!token || token.length !== 6) {
      setMessage("Vui lòng nhập đủ 6 số");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("http://localhost:5000/api/totp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("✅ Bật 2FA thành công!");
        setStep("done");
        setTimeout(() => onSuccess?.(), 1500);
      } else {
        setMessage("❌ " + data.error);
      }
    } catch (err) {
      setMessage("❌ Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h3>🔐 Bật xác thực 2 lớp</h3>

      {step === "idle" && (
        <>
          <p style={{ color: "#666", marginBottom: "16px" }}>
            Dùng Google Authenticator để bảo vệ tài khoản của bạn
          </p>
          <button
            onClick={handleSetup}
            disabled={loading}
            style={{
              padding: "12px 24px",
              background: "#f97316",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "15px",
            }}
          >
            {loading ? "⏳ Đang tạo..." : "Bắt đầu thiết lập"}
          </button>
        </>
      )}

      {step === "verify" && (
        <>
          <p style={{ marginBottom: "12px" }}>
            Quét QR code bằng <strong>Google Authenticator</strong>
          </p>

          {qrCode && (
            <img
              src={qrCode}
              alt="QR Code"
              style={{ width: "200px", height: "200px", margin: "0 auto 16px" }}
            />
          )}

          <p style={{ color: "#666", marginBottom: "12px" }}>
            Sau khi quét, nhập mã 6 số từ app:
          </p>

          <input
            type="text"
            maxLength={6}
            value={token}
            onChange={(e) => setToken(e.target.value.replace(/\D/g, ""))}
            placeholder="000000"
            style={{
              width: "150px",
              padding: "10px",
              fontSize: "24px",
              textAlign: "center",
              letterSpacing: "8px",
              border: "2px solid #ddd",
              borderRadius: "8px",
              marginBottom: "12px",
              display: "block",
              margin: "0 auto 16px",
            }}
          />

          <button
            onClick={handleVerify}
            disabled={loading}
            style={{
              padding: "12px 24px",
              background: "#16a34a",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "15px",
            }}
          >
            {loading ? "⏳ Đang xác minh..." : "Xác minh"}
          </button>
        </>
      )}

      {step === "done" && (
        <p style={{ color: "green", fontSize: "18px" }}>
          ✅ 2FA đã được bật thành công!
        </p>
      )}

      {message && (
        <p style={{
          marginTop: "12px",
          color: message.includes("✅") ? "green" : "red",
        }}>
          {message}
        </p>
      )}
    </div>
  );
}