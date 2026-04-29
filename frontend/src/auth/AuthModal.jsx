import { useState } from "react";
import "./auth.css";
import AuthChoice from "./AuthChoice";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import ForgetPassword from "./ForgetPassword";
import TwoFactorSetup from "./TwoFactorSetup";
import TwoFactorVerify from "./TwoFactorVerify";

export default function AuthModal({ mode, onClose, switchMode }) {
  const [step, setStep] = useState("form"); // "form" | "totp_verify" | "totp_setup"
  const [userEmail, setUserEmail] = useState("");

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="auth-close" onClick={onClose}>✕</button>

        {/* ===== LEFT ===== */}
        <div className="auth-left">
          <h3 className="berrygold-title">BERRY GOLD</h3>
          <div className="berrygold-mascot">
            <img src="/images/mascot.png" alt="Berry Gold Mascot" />
          </div>
          <ul className="berrygold-benefits">
            <li>🎁 Ưu đãi độc quyền cho thành viên</li>
            <li>🚚 Miễn phí giao hàng đơn từ 500K</li>
            <li>🎂 Voucher sinh nhật hấp dẫn</li>
            <li>💳 Thanh toán nhanh & tiện lợi</li>
          </ul>
        </div>

        {/* ===== RIGHT ===== */}
        <div className="auth-right">

          {/* BƯỚC 1: Form thường */}
          {step === "form" && (
            <>
              {mode === "choice" && <AuthChoice switchMode={switchMode} />}

              {mode === "login" && (
                <LoginForm
                  switchMode={switchMode}
                  onClose={onClose}
                  onLoginSuccess={(email, totpEnabled) => {
                    setUserEmail(email);
                    if (totpEnabled) {
                      // ✅ User đã bật 2FA → yêu cầu nhập mã
                      setStep("totp_verify");
                    } else {
                      // ✅ Chưa bật 2FA → vào app bình thường
                      onClose();
                    }
                  }}
                />
              )}

              {mode === "register" && (
                <RegisterForm
                  switchMode={switchMode}
                  onRegisterSuccess={(email) => {
                    setUserEmail(email);
                    // ✅ Sau đăng ký → gợi ý bật 2FA
                    setStep("totp_setup");
                  }}
                />
              )}

              {mode === "forget" && <ForgetPassword switchMode={switchMode} />}
            </>
          )}

          {/* BƯỚC 2A: Nhập mã 6 số khi đăng nhập */}
          {step === "totp_verify" && (
            <TwoFactorVerify
              email={userEmail}
              onSuccess={() => {
                // ✅ Xác thực 2FA OK → vào app
                onClose();
              }}
              onCancel={() => setStep("form")}
            />
          )}

          {/* BƯỚC 2B: Setup 2FA sau đăng ký */}
          {step === "totp_setup" && (
            <TwoFactorSetup
              email={userEmail}
              onSuccess={() => {
                // ✅ Setup xong → vào app
                onClose();
              }}
              onSkip={() => {
                // ✅ Bỏ qua → vào app luôn
                onClose();
              }}
            />
          )}

        </div>
      </div>
    </div>
  );
}