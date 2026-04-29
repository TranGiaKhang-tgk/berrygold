import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { Helmet } from "react-helmet-async";
import { useCart } from "../context/cartContext";
import { useNavigate } from "react-router-dom";
import {
  getCart,
  updateQuantity,
  removeFromCart,
} from "../utils/cartUtils";
import "../style/Cart.css";

export default function Cart() {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();
  const { refreshCartCount } = useCart();

  useEffect(() => {
    const data = getCart();

    // 🔥 FIX: đảm bảo mỗi item luôn có image
    const fixed = data.map((item) => ({
      ...item,
      image:
        item.image ||
        item.images?.[0] ||
        "https://via.placeholder.com/300?text=No+Image",
    }));

    setCart(fixed);
  }, []);

  const handleQuantityChange = (id, delta) => {
    const updated = updateQuantity(
      id,
      Math.max(
        1,
        (cart.find((item) => item.id === id)?.quantity || 1) + delta
      )
    );
    setCart(updated);
    refreshCartCount();
  };

  const handleRemove = (id) => {
    const updated = removeFromCart(id);
    setCart(updated);
    refreshCartCount();
  };

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleCheckout = () => {
    if (cart.length === 0) return alert("Giỏ hàng đang trống!");

    localStorage.setItem("checkout_cart", JSON.stringify(cart));
    navigate("../pages/Checkout");
  };

  return (
    <>
      <Helmet>
        <title>Giỏ hàng - BERRYGOLD</title>
      </Helmet>

      <div className="cart-page">
        <Container>
          <h3 className="text-center mb-4 fw-bold text-danger">
            Giỏ hàng của bạn
          </h3>

          {cart.length === 0 ? (
            <Card className="text-center py-5 border-0 shadow-sm">
              <h5>Giỏ hàng của bạn đang trống!</h5>
              <p className="text-muted small">
                Hãy thêm sản phẩm để tiếp tục mua sắm nhé.
              </p>
              <Button variant="danger" href="/">
                Tiếp tục mua sắm
              </Button>
            </Card>
          ) : (
            <Row>
              {/* ===== LIST ===== */}
              <Col md={8}>
                {cart.map((item) => (
                  <Card
                    key={item.id}
                    className="mb-3 p-3 shadow-sm border-0"
                  >
                    <Row className="align-items-center">
                      {/* IMAGE */}
                      <Col md={3}>
                        <img
                          src={item.image}
                          alt={item.name}
                          className="img-fluid rounded cart-main-img"
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/300?text=Error";
                          }}
                        />
                      </Col>

                      {/* INFO */}
                      <Col md={4}>
                        <h6 className="fw-bold">{item.name}</h6>
                        <p className="text-muted small mb-1">
                          {item.price.toLocaleString("vi-VN")}₫
                        </p>
                      </Col>

                      {/* QUANTITY */}
                      <Col md={3}>
                        <div className="qty-controls d-flex align-items-center">
                          <Button
                            variant="light"
                            size="sm"
                            onClick={() =>
                              handleQuantityChange(item.id, -1)
                            }
                          >
                            −
                          </Button>

                          <span className="mx-2">
                            {item.quantity}
                          </span>

                          <Button
                            variant="light"
                            size="sm"
                            onClick={() =>
                              handleQuantityChange(item.id, 1)
                            }
                          >
                            +
                          </Button>
                        </div>
                      </Col>

                      {/* TOTAL + REMOVE */}
                      <Col md={2} className="text-end">
                        <div className="fw-bold text-danger">
                          {(
                            item.price * item.quantity
                          ).toLocaleString("vi-VN")}
                          ₫
                        </div>

                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="mt-2"
                          onClick={() => handleRemove(item.id)}
                        >
                          Xóa
                        </Button>
                      </Col>
                    </Row>
                  </Card>
                ))}
              </Col>

              {/* ===== SUMMARY ===== */}
              <Col md={4}>
                <Card className="cart-summary shadow-sm border-0 p-3">
                  <h5 className="fw-bold mb-3">Tóm tắt đơn hàng</h5>

                  <div className="d-flex justify-content-between mb-2">
                    <span>Tạm tính</span>
                    <span>{total.toLocaleString("vi-VN")}₫</span>
                  </div>

                  <div className="d-flex justify-content-between fw-semibold">
                    <span>Tổng cộng</span>
                    <span className="text-danger fs-5">
                      {total.toLocaleString("vi-VN")}₫
                    </span>
                  </div>

                  <hr />

                  <Button
                    variant="danger"
                    className="w-100 fw-semibold mb-2"
                    onClick={handleCheckout}
                  >
                    Tiến hành đặt hàng
                  </Button>
                </Card>
              </Col>
            </Row>
          )}
        </Container>
      </div>
    </>
  );
}