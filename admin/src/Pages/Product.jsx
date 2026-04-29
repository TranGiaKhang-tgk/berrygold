import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import "../Style/Product.css";

import AddProduct from "../Components/AddProduct";
import {
  getProducts,
  deleteProduct,
} from "../services/productService";

const Product = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  // 📥 Load sản phẩm
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 🔍 SEARCH
  const filteredProducts = products.filter((p) =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 🗑️ XOÁ
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xoá sản phẩm này?")) return;

    try {
      setDeletingId(id);
      await deleteProduct(id);
      toast.success("Đã xoá sản phẩm");
      fetchProducts();
    } catch (err) {
      console.error(err);
      toast.error("Xoá thất bại");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="product-container">

      {/* HEADER */}
      <div className="product-header">
        <h3>Quản lý sản phẩm</h3>

        <div style={{ display: "flex", gap: "10px" }}>
          {/* SEARCH */}
          <input
            type="text"
            placeholder="🔍 Tìm sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: "6px 10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          />

          <button
            onClick={() => {
              setEditingProduct(null);
              setShowForm(true);
            }}
          >
            ➕ Thêm sản phẩm
          </button>
        </div>
      </div>

      {/* LOADING */}
      {loading ? (
        <p>Đang tải sản phẩm...</p>
      ) : filteredProducts.length === 0 ? (
        <p>Không tìm thấy sản phẩm</p>
      ) : (
        <table className="product-table">
          <thead>
            <tr>
              <th>Tên</th>
              <th>Danh mục</th>
              <th>Giá</th>
              <th>Số lượng</th> {/* 🔥 */}
              <th>Cấu hình</th>
              <th>Hành động</th>
            </tr>
          </thead>

          <tbody>
            {filteredProducts.map((p) => {
              const quantity = p.quantity ?? 0; // 🔥 tránh undefined

              return (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.category}</td>
                  <td>{Number(p.price).toLocaleString()} ₫</td>

                  {/* 🔥 HIỂN THỊ SỐ LƯỢNG */}
                  <td>
                    {quantity > 0 ? (
                      <span style={{ color: "green", fontWeight: "bold" }}>
                        {quantity}
                      </span>
                    ) : (
                      <span style={{ color: "red", fontWeight: "bold" }}>
                        Hết hàng
                      </span>
                    )}
                  </td>

                  <td>
                    <div>RAM: {p.ram || "—"}</div>
                    <div>Chip: {p.chip || "—"}</div>
                    <div>ROM: {p.storage || "—"}</div>
                  </td>

                  <td>
                    <button
                      onClick={() => {
                        setEditingProduct(p);
                        setShowForm(true);
                      }}
                    >
                      ✏️ Sửa
                    </button>

                    <button
                      className="danger"
                      disabled={deletingId === p.id}
                      onClick={() => handleDelete(p.id)}
                    >
                      {deletingId === p.id
                        ? "Đang xoá..."
                        : "🗑️ Xoá"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* MODAL */}
      {showForm && (
        <div
          className="modal-overlay"
          onClick={() => setShowForm(false)}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <AddProduct
              product={editingProduct}
              onClose={() => {
                setShowForm(false);
                fetchProducts();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Product;