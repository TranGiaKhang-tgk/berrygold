import { useState } from "react";

export default function TwoFactorVerify({ email, onSuccess, onCancel }) {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async () => {
    if (!token || token.length !== 6) {
      setError("Vui lòng nhập đủ 6 số");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/totp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token }),
      });

      const data = await res.json();

      if (data.success) {
        onSuccess();
      } else {
        setError("❌ Mã không đúng hoặc đã hết hạn");
      }
    } catch (err) {
      setError("❌ Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h3>🔐 Xác thực 2 lớp</h3>

      <p style={{ color: "#666", marginBottom: "20px" }}>
        Nhập mã 6 số từ <strong>Google Authenticator</strong>
      </p>

      <input
        type="text"
        maxLength={6}
        value={token}
        onChange={(e) => setToken(e.target.value.replace(/\D/g, ""))}
        placeholder="000000"
        autoFocus
        style={{
          width: "160px",
          padding: "12px",
          fontSize: "28px",
          textAlign: "center",
          letterSpacing: "10px",
          border: "2px solid #ddd",
          borderRadius: "8px",
          display: "block",
          margin: "0 auto 20px",
        }}
        onKeyDown={(e) => e.key === "Enter" && handleVerify()}
      />

      {error && (
        <p style={{ color: "red", marginBottom: "12px" }}>{error}</p>
      )}

      <button
        onClick={handleVerify}
        disabled={loading}
        style={{
          width: "100%",
          padding: "12px",
          background: loading ? "#ccc" : "#16a34a",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: loading ? "not-allowed" : "pointer",
          fontSize: "15px",
          marginBottom: "10px",
        }}
      >
        {loading ? "⏳ Đang xác minh..." : "Xác minh"}
      </button>

      <button
        onClick={onCancel}
        style={{
          width: "100%",
          padding: "10px",
          background: "transparent",
          color: "#666",
          border: "1px solid #ddd",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "14px",
        }}
      >
        ← Quay lại đăng nhập
      </button>
    </div>
  );
}