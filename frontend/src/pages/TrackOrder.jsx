import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Spinner,
  Alert,
  Button,
} from "react-bootstrap";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "../style/TrackOrder.css";

export default function TrackOrder() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [openOrderId, setOpenOrderId] = useState(null); // 🔥 NEW

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          setOrders([]);
          setLoading(false);
          return;
        }

        const snapshot = await getDocs(collection(db, "Orders"));

        const data = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        const filtered = data.filter((o) => {
          const emailDB = o.email?.trim().toLowerCase();
          const emailUser = user.email?.trim().toLowerCase();
          return emailDB === emailUser || o.userID === user.uid;
        });

        const sorted = filtered.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        );

        setOrders(sorted);
      } catch (err) {
        setError("Không thể tải đơn hàng!");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // 🔥 HỦY ĐƠN
  const handleCancel = async (order) => {
    const confirm = window.confirm("Bạn có chắc muốn hủy đơn này không?");
    if (!confirm) return;

    try {
      const res = await fetch("http://localhost:5000/api/orders/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: order.orderId,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message);

        setOrders((prev) =>
          prev.map((o) =>
            o.orderId === order.orderId
              ? {
                  ...o,
                  status: "Đã hủy",
                  paymentStatus:
                    o.paymentStatus === "Đã thanh toán"
                      ? "Đã hoàn tiền"
                      : o.paymentStatus,
                  isRefunded:
                    o.paymentStatus === "Đã thanh toán",
                }
              : o
          )
        );
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Lỗi khi hủy đơn!");
    }
  };

  const currentOrders = orders.filter(
    (o) =>
      o.status === "Chờ xử lý" ||
      o.status === "Đang xử lý" ||
      o.status === "Đang giao"
  );

  const pastOrders = orders.filter(
    (o) => o.status === "Hoàn thành" || o.status === "Đã hủy"
  );

  // 🔥 COMPONENT HIỂN THỊ ITEM
  const renderItems = (order) => {
    if (!order.items || order.items.length === 0) {
      return (
        <p className="text-muted small mt-2">
          Không có dữ liệu sản phẩm
        </p>
      );
    }

    return (
      <div className="order-items mt-3">
        {order.items.map((item, index) => (
          <div
            key={index}
            className="d-flex align-items-center gap-3 mb-2 border-bottom pb-2"
          >
            <img
              src={
                item.image ||
                "https://via.placeholder.com/80?text=No+Image"
              }
              alt={item.name}
              style={{
                width: "60px",
                height: "60px",
                objectFit: "cover",
                borderRadius: "6px",
              }}
            />

            <div className="flex-grow-1">
              <div className="fw-semibold">{item.name}</div>
              <div className="text-muted small">
                x{item.quantity}
              </div>
            </div>

            <div className="text-danger fw-semibold">
              {(item.price * item.quantity).toLocaleString("vi-VN")}₫
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="track-order-page">
      <Container className="py-4">
        <h2 className="text-center mb-4 fw-bold text-danger">
          Đơn hàng của bạn
        </h2>

        {loading && (
          <div className="text-center">
            <Spinner animation="border" />
          </div>
        )}

        {error && (
          <Alert variant="danger" className="text-center">
            {error}
          </Alert>
        )}

        {!loading && orders.length > 0 && (
          <div className="mt-4">
            {/* ===== ĐƠN HIỆN TẠI ===== */}
            {currentOrders.map((order) => (
              <Card key={order.id} className="p-4 mb-4 shadow-sm">
                <div className="d-flex justify-content-between">
                  <h5>Mã đơn: {order.orderId}</h5>
                  <span>{order.status}</span>
                </div>

                <p>
                  <strong>Ngày:</strong>{" "}
                  {new Date(order.createdAt).toLocaleString("vi-VN")}
                </p>

                <p className="fw-bold">
                  Tổng: {order.total?.toLocaleString("vi-VN")}₫
                </p>

                <p>
                  <strong>Thanh toán:</strong> {order.paymentStatus}
                </p>

                {/* 🔥 NÚT */}
                <div className="d-flex gap-2">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() =>
                      setOpenOrderId(
                        openOrderId === order.id ? null : order.id
                      )
                    }
                  >
                    {openOrderId === order.id
                      ? "Ẩn chi tiết"
                      : "Xem chi tiết"}
                  </Button>

                  {(order.status === "Chờ xử lý" ||
                    order.status === "Đang xử lý") && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleCancel(order)}
                    >
                      Hủy đơn
                    </Button>
                  )}
                </div>

                {/* 🔥 HIỂN THỊ ITEM */}
                {openOrderId === order.id && renderItems(order)}
              </Card>
            ))}

            {/* ===== LỊCH SỬ ===== */}
            {pastOrders.map((order) => (
              <Card key={order.id} className="p-4 mb-4 bg-light">
                <div className="d-flex justify-content-between">
                  <h5>Mã đơn: {order.orderId}</h5>
                  <span>{order.status}</span>
                </div>

                <p>
                  <strong>Ngày:</strong>{" "}
                  {new Date(order.createdAt).toLocaleString("vi-VN")}
                </p>

                <p className="fw-bold">
                  Tổng: {order.total?.toLocaleString("vi-VN")}₫
                </p>

                <p>
                  <strong>Thanh toán:</strong> {order.paymentStatus}
                </p>

                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() =>
                    setOpenOrderId(
                      openOrderId === order.id ? null : order.id
                    )
                  }
                >
                  {openOrderId === order.id
                    ? "Ẩn chi tiết"
                    : "Xem chi tiết"}
                </Button>

                {openOrderId === order.id && (
  <>
    {/* 🔥 THÔNG TIN HOÀN TIỀN (HIỂN THỊ TRÊN) */}
    {order.paymentStatus === "Đã hoàn tiền" && (
      <div className="mb-3 p-3 border rounded bg-success-subtle">
        <h6 className="fw-bold text-success mb-2">
          💸 Thông tin hoàn tiền
        </h6>

        <p>
          <strong>Trạng thái:</strong>{" "}
          <span className="text-success">✔ Đã hoàn tiền</span>
        </p>

        <p>
          <strong>Số tiền hoàn:</strong>{" "}
          {order.refundInfo?.vnp_Amount
            ? (Number(order.refundInfo.vnp_Amount) / 100).toLocaleString("vi-VN") + "₫"
            : order.total.toLocaleString("vi-VN") + "₫"}
        </p>

        <p>
          <strong>Thời gian hoàn:</strong>{" "}
          {order.refundedAt
            ? new Date(order.refundedAt).toLocaleString("vi-VN")
            : "Đang xử lý"}
        </p>

        <p>
          <strong>Mã giao dịch:</strong>{" "}
          {order.refundInfo?.vnp_TransactionNo || "-"}
        </p>

        <p>
          <strong>Phương thức:</strong> VNPAY
        </p>

        <p>
          <strong>Lý do:</strong> Hủy đơn hàng
        </p>
      </div>
    )}

    {/* 🔽 DANH SÁCH SẢN PHẨM */}
    {renderItems(order)}
  </>
)}
              </Card>
            ))}
          </div>
        )}

        {!loading && orders.length === 0 && (
          <p className="text-center">Không có đơn hàng nào</p>
        )}
      </Container>
    </div>
  );
}