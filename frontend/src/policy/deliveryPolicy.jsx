import React from "react";
import "../style/Policy.css";

export default function DeliveryPolicy() {
  return (
    <div className="policy-page">
      <div className="policy-container">
        <h2 className="policy-title">Chính sách giao hàng</h2>

        <div className="policy-content">
          <p>
            BERRYGOLD cam kết giao hàng tận nơi trên toàn quốc, đảm bảo sản phẩm được
            đóng gói cẩn thận và giao đúng thời gian dự kiến.
          </p>

          <h5>1. Phạm vi giao hàng</h5>
          <p>Chúng tôi hỗ trợ giao hàng đến tất cả các tỉnh thành tại Việt Nam.</p>

          <h5>2. Thời gian giao hàng</h5>
          <ul>
            <li>Nội thành TP.HCM & Hà Nội: 1 - 2 ngày làm việc</li>
            <li>Các tỉnh thành khác: 3 - 5 ngày làm việc</li>
          </ul>

          <h5>3. Phí giao hàng</h5>
          <p>
            - Miễn phí giao hàng với đơn hàng từ 500.000đ trở lên.  
            - Đơn hàng dưới 500.000đ: phí giao hàng 30.000đ.
          </p>
        </div>
      </div>
    </div>
  );
}
