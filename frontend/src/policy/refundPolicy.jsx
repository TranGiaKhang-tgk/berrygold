import React from "react";
import "../style/Policy.css";

export default function RefundPolicy() {
  return (
    <div className="policy-page">
      <div className="policy-container">
        <h2 className="policy-title">Chính sách đổi trả & hoàn tiền</h2>
        <div className="policy-content">
          <p>
            Chúng tôi mong muốn mang lại trải nghiệm mua sắm tốt nhất cho khách hàng.
            Nếu sản phẩm gặp lỗi hoặc không đúng mô tả, bạn có thể yêu cầu đổi trả.
          </p>

          <h5>1. Thời hạn đổi trả</h5>
          <p>Khách hàng có thể đổi hoặc trả sản phẩm trong vòng 7 ngày kể từ khi nhận hàng.</p>

          <h5>2. Điều kiện đổi trả</h5>
          <ul>
            <li>Sản phẩm còn nguyên tem, nhãn, chưa qua sử dụng.</li>
            <li>Có hóa đơn mua hàng hoặc mã đơn hàng.</li>
          </ul>

          <h5>3. Quy trình hoàn tiền</h5>
          <p>
            Sau khi nhận và kiểm tra sản phẩm, BERRYGOLD sẽ hoàn tiền trong 3–5 ngày làm việc
            qua hình thức thanh toán ban đầu.
          </p>
        </div>
      </div>
    </div>
  );
}
