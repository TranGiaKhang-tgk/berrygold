import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import "../Style/AddProduct.css";
import { addProduct, updateProduct } from "../services/productService";

const AddProduct = ({ onClose, product }) => {
  const isEdit = !!product;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = {
    "Điện thoại, Tablet": "phone-tablet",
    Laptop: "laptop",
    "Âm thanh": "audio",
    "Đồng hồ": "watch",
    "Phụ kiện": "accessories",
    Tivi: "tv-appliance",
    "Hàng cũ": "used-goods",
    "Khuyến mãi": "promotion",
  };

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    category: "",
    price: "",
    quantity: "", // 🔥 thêm số lượng
    description: "",
    ram: "",
    chip: "",
    storage: "",
    color: "",
    material: "",
    size: "",
    image: "",
  });

  useEffect(() => {
    if (isEdit && product) {
      setFormData({
        id: product.id || "",
        name: product.name || "",
        category: product.category || "",
        price: product.price || "",
        quantity: product.quantity || "", // 🔥 load khi edit
        description: product.description || "",
        ram: product.ram || "",
        chip: product.chip || "",
        storage: product.storage || "",
        color: product.color || "",
        material: product.material || "",
        size: product.size || "",
        image: product.image || "",
      });
    }
  }, [isEdit, product]);

  const handleChange = (e) => {
  const { name, value } = e.target;

  setFormData((prev) => ({
    ...prev,
    [name]:
      name === "price" || name === "quantity"
        ? value === "" 
          ? "" 
          : Number(value)
        : value,
  }));
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formData.ram || !formData.chip || !formData.storage) {
      toast.error("Nhập đủ RAM / Chip / Bộ nhớ");
      return;
    }

    setIsSubmitting(true);

    try {
      const data = {
        name: formData.name,
        category: formData.category,
        price: formData.price,
        quantity: formData.quantity, // 🔥 gửi lên backend
        description: formData.description,

        ram: formData.ram,
        chip: formData.chip,
        storage: formData.storage,

        color: formData.color,
        material: formData.material,
        size: formData.size,

        image: formData.image,
      };

      console.log("SAVE:", data);

      if (isEdit && formData.id) {
        await updateProduct(formData.id, data);
        toast.success("Cập nhật thành công");
      } else {
        await addProduct(data);
        toast.success("Thêm thành công");
      }

      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Lỗi lưu");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>{isEdit ? "Chỉnh sửa" : "Thêm sản phẩm"}</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-left">
            <input name="name" placeholder="Tên" value={formData.name} onChange={handleChange} />

            <select name="category" value={formData.category} onChange={handleChange}>
              <option value="">Danh mục</option>
              {Object.entries(categories).map(([n, s]) => (
                <option key={s} value={s}>{n}</option>
              ))}
            </select>

            <input type="number" name="price" placeholder="Giá" value={formData.price} onChange={handleChange} />

            {/* 🔥 Ô SỐ LƯỢNG */}
            <input
              type="number"
              name="quantity"
              placeholder="Số lượng"
              value={formData.quantity}
              onChange={handleChange}
            />

            <input name="ram" placeholder="RAM" value={formData.ram} onChange={handleChange} />
            <input name="chip" placeholder="Chip" value={formData.chip} onChange={handleChange} />
            <input name="storage" placeholder="Bộ nhớ" value={formData.storage} onChange={handleChange} />

            <input name="color" placeholder="Màu sắc" value={formData.color} onChange={handleChange} />
            <input name="material" placeholder="Chất liệu" value={formData.material} onChange={handleChange} />
            <input name="size" placeholder="Kích thước" value={formData.size} onChange={handleChange} />
          </div>

          <div className="form-right">
            <textarea name="description" placeholder="Mô tả" value={formData.description} onChange={handleChange} />

            <input
              name="image"
              placeholder="Link ảnh (https://...)"
              value={formData.image}
              onChange={handleChange}
            />

            {formData.image && (
              <img
                src={formData.image}
                alt="preview"
                style={{ width: "120px", marginTop: "10px" }}
              />
            )}

            <button type="submit">
              {isSubmitting ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;