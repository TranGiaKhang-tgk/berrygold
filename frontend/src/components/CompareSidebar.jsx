import { useNavigate } from "react-router-dom";

function CompareSidebar() {
  const navigate = useNavigate();

  return (
    <div className="compare-sidebar">

      <h6 className="fw-bold text-uppercase mb-3 text-danger">
        So sánh sản phẩm
      </h6>

      {/* 🔥 KHUNG CLICK */}
      <div
        className="compare-start-box"
        onClick={() => navigate("/compare")}
      >
        <div style={{ fontSize: "30px", marginBottom: "5px" }}>⚖️</div>

        <p style={{ fontWeight: "600", marginBottom: "5px" }}>
          Bắt đầu so sánh
        </p>

        <span style={{ fontSize: "13px", color: "#777" }}>
          Chọn sản phẩm để so sánh
        </span>
      </div>

    </div>
  );
}

export default CompareSidebar;