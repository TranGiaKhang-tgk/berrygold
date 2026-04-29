import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Carousel } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import "../style/Home.css";

// 🔥 Compare
import CompareSidebar from "../components/CompareSidebar";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [scrollY, setScrollY] = useState(0);

  const categories = [
    { name: "Điện thoại, Tablet", icon: "📱", slug: "phone-tablet" },
    { name: "Laptop", icon: "💻", slug: "laptop" },
    { name: "Âm thanh", icon: "🎧", slug: "audio" },
    { name: "Đồng hồ", icon: "⌚", slug: "watch" },
    { name: "Phụ kiện", icon: "🔌", slug: "accessories" },
    { name: "Tivi", icon: "📺", slug: "tv-appliance" },
    { name: "Hàng cũ", icon: "📦", slug: "used-goods" },
    { name: "Khuyến mãi", icon: "🏷️", slug: "promotion" },
  ];

  const banners = [
    "banner1.jpg",
    "banner2.jpg",
    "banner3.jpg",
    "banner4.jpg",
    "banner5.jpg",
    "banner6.jpg",
    "banner7.jpg",
    "banner8.jpg",
    "banner9.jpg",
    "banner10.jpg",
  ];

  // ===== LOAD PRODUCT =====
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snapshot = await getDocs(collection(db, "Products"));
        const allProducts = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const randomProducts = allProducts
          .sort(() => 0.5 - Math.random())
          .slice(0, 70);

        setProducts(randomProducts);
      } catch (error) {
        console.error("Lỗi khi lấy sản phẩm:", error);
      }
    };

    fetchProducts();
  }, []);

  // 🔥 SCROLL EFFECT (QUAN TRỌNG)
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <Helmet>
        <title>BERRYGOLD - An tâm mua sắm</title>
      </Helmet>

      <div className="home-page py-4">
        <Container fluid="lg">
          <Row>

            {/* ===== LEFT ===== */}
            <Col md={3} lg={2} className="mb-4 mb-md-0">
              <div className="category-sidebar p-3 shadow-sm bg-white rounded">
                <h6 className="fw-bold text-danger text-uppercase mb-3">
                  Danh mục sản phẩm
                </h6>

                <ul className="list-unstyled m-0">
                  {categories.map((cat) => (
                    <li key={cat.slug} className="mb-2">
                      <Link
                        to={`/category/${cat.slug}`}
                        className="category-link d-flex align-items-center text-decoration-none"
                      >
                        <span className="me-2 fs-5">{cat.icon}</span>
                        {cat.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <CompareSidebar />
            </Col>

            {/* ===== RIGHT ===== */}
            <Col md={9} lg={10}>

              {/* ===== SLIDER + LOGO ===== */}
              <div className="banner-wrapper">

              <div className={`big-logo-banner ${scrollY > 0 ? "run" : ""}`}>
  BERRY GOLD
</div>
                <Carousel
                  interval={3000}
                  controls
                  indicators
                  ride="carousel"
                  pause={false}
                  className="mb-4 rounded-4 overflow-hidden shadow-sm"
                >
                  {banners.map((img, index) => (
                    <Carousel.Item key={index}>
                      <img
                        className="d-block w-100"
                        src={`/images/${img}`}
                        alt={`Slide ${index}`}
                        style={{ height: "300px", objectFit: "cover" }}
                        onError={(e) => (e.target.src = "/images/noimage.jpg")}
                      />
                      <Carousel.Caption>
                        <h3>BERRYGOLD {index + 1}</h3>
                        <p>Banner số {index + 1}</p>
                      </Carousel.Caption>
                    </Carousel.Item>
                  ))}
                </Carousel>

              </div>

              {/* ===== PRODUCT ===== */}
              <h5 className="fw-bold text-uppercase text-danger mb-3">
                Sản phẩm nổi bật
              </h5>

              <Row className="g-3">
                {products.map((p) => (
                  <Col key={p.id} xs={6} md={4} lg={3}>
                    <Link
                      to={`/product/${p.id}`}
                      className="text-decoration-none text-dark"
                    >
                      <Card className="product-card shadow-sm border-0 h-100">

                        <div className="product-img-wrapper">
                          <img
                            src={
                              p.image ||
                              p.images?.[0] ||
                              "/images/noimage.jpg"
                            }
                            alt={p.name}
                            className="img-fluid"
                            onError={(e) => {
                              e.target.src = "/images/noimage.jpg";
                            }}
                          />
                        </div>

                        <Card.Body className="text-center">
                          <Card.Title className="product-name">
                            {p.name}
                          </Card.Title>

                          <p className="product-price text-danger fw-bold mb-0">
                            {p.price?.toLocaleString("vi-VN")}₫
                          </p>
                        </Card.Body>

                      </Card>
                    </Link>
                  </Col>
                ))}
              </Row>

            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
}