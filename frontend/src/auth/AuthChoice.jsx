export default function AuthChoice({ switchMode }) {
  return (
    <div className="auth-content auth-choice">
      <h2>Đăng nhập BERRY GOLD</h2>

      <p style={{ fontSize: 14, marginBottom: 20 }}>
        Vui lòng đăng nhập để xem ưu đãi và thanh toán nhanh hơn
      </p>

      <div className="choice-actions">
        <button
          className="auth-outline"
          onClick={() => switchMode("register")}
        >
          Đăng ký
        </button>

        <button
          className="auth-primary"
          onClick={() => switchMode("login")}
        >
          Đăng nhập
        </button>
      </div>
    </div>
  );
}
