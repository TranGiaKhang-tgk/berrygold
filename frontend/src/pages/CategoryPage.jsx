import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProductsByCategory } from "../services/productService";

const CategoryPage = () => {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Slug:", slug); // 🔥 debug

    const fetchProducts = async () => {
      try {
        const data = await getProductsByCategory(slug);
        console.log("Products:", data); // 🔥 debug
        setProducts(data);
      } catch (err) {
        console.error("Lỗi lấy sản phẩm:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [slug]);

  if (loading)
    return <p style={{ padding: 20 }}>Đang tải sản phẩm...</p>;

  if (products.length === 0)
    return (
      <p style={{ padding: 20 }}>
        Không có sản phẩm nào trong danh mục này.
      </p>
    );

  return (
    <div className="container mt-4">
      <div className="row">
        {products.map((p) => (
          <div key={p.id} className="col-md-3 mb-4">
            <Link
              to={`/product/${p.id}`}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <div className="card h-100">

                {/* 🔥 FIX IMAGE */}
                <img
                  src={
                    p.image ||
                    p.images?.[0] ||
                    "/images/noimage.jpg"
                  }
                  className="card-img-top"
                  alt={p.name}
                />

                <div className="card-body">
                  <h6>{p.name}</h6>

                  <p className="text-danger fw-bold">
                    {Number(p.price).toLocaleString()} ₫
                  </p>
                </div>

              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryPage;