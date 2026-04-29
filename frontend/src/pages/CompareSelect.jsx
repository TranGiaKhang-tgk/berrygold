import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate, useLocation } from "react-router-dom";

function CompareSelect() {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const { index, firstProduct } = location.state || {};

  // 🔥 CHUẨN HÓA CATEGORY
  const mapCategory = (cat) => {
    if (!cat) return "";

    if (typeof cat === "object") {
      return cat.slug || cat.name || "";
    }

    const map = {
      "Điện thoại, Tablet": "phone-tablet",
      "Laptop": "laptop",
      "Âm thanh": "audio",
      "Đồng hồ": "watch",
      "Phụ kiện": "accessories",
      "Tivi": "tv-appliance",
      "Hàng cũ": "used-goods",
      "Khuyến mãi": "promotion",
    };

    return map[cat] || cat;
  };

  // 🔥 LOAD DATA
  useEffect(() => {
    const fetch = async () => {
      try {
        const snap = await getDocs(collection(db, "Products"));
        const data = snap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetch();
  }, []);

  // 🔥 CHỌN SP
  const handleSelect = (product) => {
    if (index === 1 && firstProduct) {
      const cat1 = mapCategory(product.category);
      const cat2 = mapCategory(firstProduct.category);

      if (cat1 !== cat2) {
        alert("Phải cùng danh mục!");
        return;
      }
    }

    navigate("/compare", {
      state: {
        selectedProduct: product,
        index,
      },
    });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h4>Chọn sản phẩm để so sánh</h4>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))",
          gap: "15px",
          marginTop: "20px",
        }}
      >
        {products.map((p) => (
          <div
            key={p.id}
            onClick={() => handleSelect(p)}
            style={{
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "10px",
              cursor: "pointer",
              background: "#fff",
            }}
          >
            {/* 🔥 GIỐNG HOME */}
            <img
              src={
                p.image ||           // ✅ giống Home
                p.images?.[0] ||     // fallback
                "/images/noimage.jpg"
              }
              alt={p.name}
              style={{
                width: "100%",
                height: "150px",
                objectFit: "contain",
              }}
              onError={(e) => {
                e.target.src = "/images/noimage.jpg";
              }}
            />

            <p style={{ fontSize: "14px", marginTop: "10px" }}>
              {p.name}
            </p>

            <p style={{ color: "red", fontWeight: "bold" }}>
              {p.price?.toLocaleString("vi-VN")}₫
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CompareSelect;
