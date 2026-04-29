// src/utils/cartUtils.js

const CART_KEY = "berrygold_cart";

/** Lấy giỏ hàng */
export const getCart = () => {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
};

/**  Lưu giỏ hàng */
export const saveCart = (cart) => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
};

/**  Thêm sản phẩm */
export const addToCart = (product, quantity = 1) => {
  const cart = getCart();
  const existing = cart.find((i) => i.id === product.id);

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image:
  product.image ||
  product.images?.[0] ||
  "https://via.placeholder.com/300?text=No+Image",
      quantity,
    });
  }

  saveCart(cart);
  return cart;
};

/**  Cập nhật số lượng */
export const updateQuantity = (id, quantity) => {
  const cart = getCart().map((item) =>
    item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
  );
  saveCart(cart);
  return cart;
};

/**  Xóa sản phẩm */
export const removeFromCart = (id) => {
  const cart = getCart().filter((item) => item.id !== id);
  saveCart(cart);
  return cart;
};

/**  Xóa toàn bộ */
export const clearCart = () => {
  localStorage.removeItem(CART_KEY);
};