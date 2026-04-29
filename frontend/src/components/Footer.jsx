import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import {
  FaPhoneAlt,
  FaEnvelope,
  FaGlobe,
  FaMapMarkerAlt,
  FaFacebook,
  FaYoutube,
} from "react-icons/fa";
import "../style/Footer.css";

// ✅ thêm function để tránh href="#"
const handleClick = (e) => e.preventDefault();

export default function Footer() {
  return (
    <footer className="footer-area text-white">
      <div className="footer-main">
        <Container>
          <Row className="justify-content-between">
            {/* ==== CỘT 1: GIỚI THIỆU ==== */}
            <Col md={5} sm={12} className="mb-4">
              <h4 className="footer-logo">
                <span className="logo-icon">BERRY</span> <span>GOLD</span>
              </h4>
              <p className="footer-desc">
                Berrygold.vn tự hào mang đến những sản phẩm thông minh,
                bền bỉ và tiện lợi — giúp nâng tầm chất lượng cuộc sống hiện đại của
                mọi gia đình Việt.
              </p>
              <ul className="footer-contact list-unstyled">
                <li>
                  <FaMapMarkerAlt className="me-2 text-danger" />
                  <strong>TP. Hồ Chí Minh:</strong> 18A/1 Cộng Hòa , Phường Tân Sơn Nhất
                </li>
                <li>
                  <FaMapMarkerAlt className="me-2 text-danger" />
                  <strong>TP. Hồ Chí Minh:</strong> 104 Nguyễn Văn Trỗi , Phường Phú Nhuận
                </li>
                <li>
                  <FaPhoneAlt className="me-2 text-danger" />
                  <strong>Hotline:</strong>{" "}
                  <span className="hotline">0909090909</span>
                </li>
                <li>
                  <FaEnvelope className="me-2 text-danger" />
                  <strong>Email hỗ trợ:</strong> support@Berrygold.vn
                </li>
                <li>
                  <FaGlobe className="me-2 text-danger" />
                  <strong>Website:</strong> https://Berrygold.vn
                </li>
              </ul>
            </Col>

            {/* ==== CỘT 2 */}
            <Col md={3} sm={6} className="mb-4">
              <h5 className="footer-title">VỀ CHÚNG TÔI</h5>
              <ul className="footer-links list-unstyled">
                <li><a href="/" onClick={handleClick}>Giới thiệu doanh nghiệp</a></li>
                <li><a href="/" onClick={handleClick}>Cơ hội nghề nghiệp</a></li>
              </ul>

              <h5 className="footer-title mt-4">HƯỚNG DẪN MUA HÀNG</h5>
              <ul className="footer-links list-unstyled">
                <li><a href="/" onClick={handleClick}>Cách đặt hàng trực tuyến</a></li>
                <li><a href="/" onClick={handleClick}>Phương thức thanh toán</a></li>
                <li><a href="/" onClick={handleClick}>Chính sách giao hàng</a></li>
              </ul>
            </Col>

            {/* ==== CỘT 3 */}
            <Col md={4} sm={6} className="mb-4">
              <h5 className="footer-title">CHÍNH SÁCH KHÁCH HÀNG</h5>
              <ul className="footer-links list-unstyled">
                <li><a href="/policy/DeliveryPolicy">Chính sách bán hàng</a></li>
                <li><a href="/" onClick={handleClick}>Vận chuyển & giao nhận</a></li>
                <li><a href="/" onClick={handleClick}>Bảo hành & bảo trì</a></li>
                <li><a href="/" onClick={handleClick}>Bảo mật thông tin</a></li>
                <li><a href="/policy/refundPolicy">Đổi trả & hoàn tiền</a></li>
              </ul>

              <h5 className="footer-title mt-4">KẾT NỐI CÙNG CHÚNG TÔI</h5>
              <div className="social-links mb-3">
                <a href="/" onClick={handleClick}><FaFacebook /></a>
                <a href="/" onClick={handleClick}><FaYoutube /></a>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* ==== FOOTER BOTTOM ==== */}
      <div className="footer-bottom text-center">
        <Container>
          <p className="copyright">
            © {new Date().getFullYear()} Berrygold.vn — All rights reserved - Nhóm .
          </p>
        </Container>
      </div>
    </footer>
  );
}