import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import "../style/Product.css";
import CompareSidebar from "../components/CompareSidebar";
import { getProducts } from "../services/productService";

export default function Products() {
  const { slug } = useParams();

  const [products, setProducts] = useState([]);
  const [displayed, setDisplayed] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { name: "Điện thoại, Tablet", slug: "phone-tablet" },
    { name: "Laptop", slug: "laptop" },
    { name: "Âm thanh", slug: "audio" },
    { name: "Đồng hồ", slug: "watch" },
    { name: "Phụ kiện", slug: "accessories" },
    { name: "Tivi", slug: "tv-appliance" },
    { name: "Hàng cũ", slug: "used-goods" },
    { name: "Khuyến mãi", slug: "promotion" },
  ];

  const slugMap = {
    "Điện thoại, Tablet": "phone-tablet",
    Laptop: "laptop",
    "Âm thanh": "audio",
    "Đồng hồ": "watch",
    "Phụ kiện": "accessories",
    "Tivi, Điện máy": "tv-appliance",
    "Hàng cũ": "used-goods",
    "Khuyến mãi": "promotion",
  };

  const currentCategory =
    categories.find((c) => c.slug === slug)?.name || "Danh mục sản phẩm";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const allProducts = await getProducts();

        console.log("🔥 DATA:", allProducts);

        const filtered = slug
          ? allProducts.filter((p) => slugMap[p.category] === slug)
          : allProducts;

        setProducts(filtered);
        setDisplayed(filtered);
      } catch (err) {
        console.error("Lỗi load sản phẩm:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [slug]);

  return (
    <div className="product-page container py-3">
      <Helmet>
        <title>{currentCategory}</title>
      </Helmet>

      <div className="row">

        {/* SIDEBAR */}
        <div className="col-md-3">
          <CompareSidebar />
        </div>

        {/* MAIN */}
        <div className="col-md-9">
          <h5>{currentCategory}</h5>

          {loading ? (
            <p>Đang tải...</p>
          ) : displayed.length === 0 ? (
            <p>Không có sản phẩm</p>
          ) : (
            <div className="category-grid">

              {displayed.map((p) => {

                // 🔥 FIX 100% IMAGE
                let img = "/images/no-image.png";

                if (p.image && p.image.startsWith("http")) {
                  img = p.image;
                } else if (typeof p.images === "string") {
                  img = p.images;
                } else if (Array.isArray(p.images) && p.images.length > 0) {
                  img = p.images[0];
                }

                return (
                  <div key={p.id} className="product-card">

                    <Link to={`/product/${p.id}`}>
                      <div className="product-img-wrapper">
                        <img
                          src={img}
                          alt={p.name}
                          onError={(e) => {
                            console.log("❌ Lỗi ảnh:", img);
                            e.target.src = "/images/no-image.png";
                          }}
                        />
                      </div>

                      <div className="product-info">
                        <p>{p.name}</p>
                        <p>{Number(p.price).toLocaleString()}₫</p>
                      </div>
                    </Link>

                  </div>
                );
              })}

            </div>
          )}
        </div>

      </div>
    </div>
  );
}