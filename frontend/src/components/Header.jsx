import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  InputGroup,
  FormControl,
  Button,
  Dropdown,
} from "react-bootstrap";
import {
  FaPhoneAlt,
  FaShoppingCart,
  FaUser,
  FaSearch,
  FaClipboardList,
} from "react-icons/fa";
import { useCart } from "../context/cartContext";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { useUser } from "../context/UserContext";
import "../style/Header.css";

export default function Header({ onLoginClick }) {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);

useEffect(() => {
  const handleScroll = () => {
    setIsScrolled(window.scrollY > 100);
  };

  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, []);
  const { cartCount } = useCart();

  const handleLogout = () => {
    Swal.fire({
      title: "Bạn có chắc muốn đăng xuất không?",
      text: "Phiên đăng nhập hiện tại sẽ bị kết thúc.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#656565",
      cancelButtonColor: "#c4d6e5",
      confirmButtonText: "Đăng xuất",
      cancelButtonText: "Hủy",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await logout();
        Swal.fire({
          icon: "success",
          title: "Đã đăng xuất!",
          text: "Hẹn gặp lại bạn 👋",
          timer: 1500,
          showConfirmButton: false,
        });
        navigate("/");
      }
    });
  };

  const handleSearch = () => {
    const trimmed = keyword.trim();
    if (trimmed !== "") {
      navigate(`/search?q=${encodeURIComponent(trimmed)}`);
      setKeyword("");
    }
  };

  return (
    <header className={`header-area ${isScrolled ? "scrolled" : ""}`}>

      <div className="promo-bar">
  <div className="promo-content">
        🔥 Giảm giá đến 50% |BERRY GOLD là địa chỉ uy tín chuyên cung cấp điện thoại chính hãng và máy like new với mức giá cực kỳ cạnh tranh, phù hợp cho sinh viên và dân văn phòng. Với cam kết chất lượng rõ ràng, bảo hành minh bạch và nhiều ưu đãi hấp dẫn mỗi tuần, BERRY GOLD mang đến cho khách hàng cơ hội sở hữu những dòng smartphone hot như iPhone, Samsung với giá tốt nhất thị trường. Truy cập ngay website BERRY GOLD để săn deal sốc, trải nghiệm mua sắm dễ dàng và chọn cho mình chiếc điện thoại ưng ý nhất! Miễn phí vận chuyển toàn quốc 🚚
      </div>
      </div>
      
      {/* ===== TOP BAR ===== */}
      <div className="top-bar">
        <Container className="d-flex justify-content-between align-items-center">
          <span className="text-white">
            <FaPhoneAlt className="me-2" />
            <strong>Hotline:</strong> 0909.090.909
          </span>

          <div className="top-links d-flex align-items-center gap-3">
            <Link to="#">Liên hệ</Link>
            <Link to="#">Tuyển dụng</Link>

            {!user ? (
              <button
                className="login-link btn btn-link text-white p-0"
                onClick={onLoginClick}
              >
                <FaUser className="me-1" /> Đăng nhập
              </button>
            ) : (
              <Dropdown align="end">
                <Dropdown.Toggle
                  variant="link"
                  className="text-white text-decoration-none fw-semibold"
                >
                  👤 {user.fullname}
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => navigate("/profile")}>
                    Thông tin cá nhân
                  </Dropdown.Item>
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout}>
                    Đăng xuất
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}
          </div>
        </Container>
      </div>

      {/* ===== MIDDLE BAR ===== */}
      <div className="middle-bar">
        <Container>
          <Row className="align-items-center">
            
            {/* LOGO */}
            <Col md={3} sm={12} className="text-center text-md-start mb-2 mb-md-0">
              <Link to="/" className="logo text-decoration-none">
                <h2 className="m-0">
                  <span className="logo-icon"></span> <span></span>
                </h2>
              </Link>
            </Col>

            {/* SEARCH */}
            <Col md={6} sm={12}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSearch();
                }}
              >
                <InputGroup className="search-box">
                  <FormControl
                    placeholder="Bạn cần tìm sản phẩm gì?"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                  />
                  <Button type="submit" variant="dark">
                    <FaSearch className="me-2" />
                    Tìm kiếm
                  </Button>
                </InputGroup>
              </form>
            </Col>

            {/* ICONS */}
            <Col md={3} sm={12} className="icons text-center text-md-end mt-3 mt-md-0">
              <Link to="/pages/cart" className="icon-item position-relative">
                <FaShoppingCart size={22} />
                <span>Giỏ hàng</span>
                {cartCount > 0 && (
                  <span className="cart-badge">{cartCount}</span>
                )}
              </Link>

              <Link to="/pages/trackorder" className="icon-item">
                <FaClipboardList />
                <span>Đơn hàng</span>
              </Link>
            </Col>

          </Row>
        </Container>
      </div>

    </header>
  );
}