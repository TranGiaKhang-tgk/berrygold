export const printInvoice = (order) => {
  if (!order) return alert("❌ Không có dữ liệu đơn hàng!");

  const printWindow = window.open("", "_blank");

  // ✅ Dùng fallback cho dữ liệu
  const products = order.products || order.items || [];
  if (!Array.isArray(products) || products.length === 0) {
    return alert("Đơn hàng này không có sản phẩm để in!");
  }

  const totalFormatted = (order.total || 0).toLocaleString("vi-VN");
  const orderDate =
    order.date ||
    (order.createdAt
      ? new Date(order.createdAt).toLocaleString("vi-VN")
      : "Không rõ");

  const html = `
  <html>
    <head>
      <title>Hóa đơn ${order.code || order.orderId}</title>
      <style>
        body {
          font-family: "Segoe UI", Arial, sans-serif;
          padding: 20px 30px;
          color: #222;
          font-size: 13px;
          max-width: 800px;
          margin: auto;
          background: #fff;
        }

        .header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          border-bottom: 2px solid #dc3545;
          padding-bottom: 6px;
          margin-bottom: 10px;
        }

        .header img {
          width: 70px;
          height: 70px;
          object-fit: contain;
        }

        .shop-info {
          text-align: right;
          font-size: 12px;
          line-height: 1.3;
        }

        .shop-info h3 {
          margin: 0;
          color: #dc3545;
          font-size: 16px;
        }

        h2 {
          text-align: center;
          font-size: 17px;
          margin: 10px 0 14px;
          text-transform: uppercase;
          color: #333;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 8px;
        }

        th, td {
          border: 1px solid #ddd;
          padding: 6px 8px;
          text-align: left;
          font-size: 12px;
        }

        th {
          background: #f4f4f4;
          text-align: center;
        }

        .summary {
          margin-top: 10px;
          text-align: right;
          font-weight: bold;
          font-size: 13px;
        }

        .footer {
          text-align: center;
          margin-top: 15px;
          font-style: italic;
          color: #555;
          font-size: 12px;
        }

        .sign-section {
          display: flex;
          justify-content: space-between;
          margin-top: 25px;
          text-align: center;
        }

        .sign-section div {
          width: 45%;
        }

        .sign-section p {
          margin-top: 40px;
          border-top: 1px solid #333;
          display: inline-block;
          padding-top: 2px;
          width: 120px;
        }

        .qr-code {
          text-align: right;
          margin-top: 10px;
        }

        .qr-code img {
          width: 70px;
          height: 70px;
        }

        @page {
          size: A4;
          margin: 10mm;
        }

        @media print {
          body {
            -webkit-print-color-adjust: exact;
          }
        }
      </style>
    </head>

    <body>
      <div class="header">
        <img src="/admin/src/Components/logo2.jpg" alt="Logo"/>
        <div class="shop-info">
          <h3>BERRYGOLD</h3>
          <p>Hotline: 0909.090.909</p>
          <p>Website: www.berrygold.vaa.vn</p>
          <p>CN1: 18A/1 Cộng Hòa, Tân Bình, TP.HCM</p>
          <p>CN2: 104 Nguyễn Văn Trỗi, Phú Nhuận, TP.HCM</p>
        </div>
      </div>

      <h2>HÓA ĐƠN BÁN HÀNG</h2>

      <p><strong>Mã đơn:</strong> ${order.code || order.orderId}</p>
      <p><strong>Khách hàng:</strong> ${order.customer || order.fullname}</p>
      <p><strong>Địa chỉ:</strong> ${order.address}</p>
      <p><strong>Ngày đặt:</strong> ${orderDate}</p>
      ${
        order.shipping
          ? `<p><strong>Đơn vị vận chuyển:</strong> ${order.shipping.carrier} (${order.shipping.trackingCode})</p>`
          : ""
      }

      <table>
        <thead>
          <tr>
            <th>Sản phẩm</th>
            <th>SL</th>
            <th>Đơn giá</th>
            <th>Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          ${products
            .map(
              (p) => `
              <tr>
                <td>${p.name || p.productName || "Không rõ"}</td>
                <td style="text-align:center;">${p.qty || p.quantity || 1}</td>
                <td style="text-align:right;">${(p.price || 0).toLocaleString(
                  "vi-VN"
                )} ₫</td>
                <td style="text-align:right;">${(
                  (p.qty || p.quantity || 1) * (p.price || 0)
                ).toLocaleString("vi-VN")} ₫</td>
              </tr>`
            )
            .join("")}
        </tbody>
      </table>

      <p class="summary">Tổng cộng: ${totalFormatted} ₫</p>
      <p><strong>Thanh toán:</strong> ${
        order.paid || order.paymentStatus === "Đã thanh toán"
          ? "✅ Đã thanh toán"
          : "❌ Chưa thanh toán"
      }</p>

      <div class="qr-code">
        <img src="https://api.qrserver.com/v1/create-qr-code/?data=${
          order.code || order.orderId
        }&size=80x80" alt="QR"/>
      </div>

      <div class="sign-section">
        <div>
          <strong>Khách hàng</strong>
          <p>(Ký tên)</p>
        </div>
        <div>
          <strong>Nhân viên</strong>
          <p>(Ký tên)</p>
        </div>
      </div>

      <div class="footer">
        <p>Cảm ơn quý khách đã mua hàng tại <strong>BERRYGOLD</strong>!</p>
      </div>
    </body>
  </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.print();
};
