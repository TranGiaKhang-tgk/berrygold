import React, { createContext, useContext, useState, useEffect } from "react";
import { getCart } from "../utils/cartUtils";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const cart = getCart();
    setCartCount(cart.reduce((sum, item) => sum + item.quantity, 0));

    const handleStorage = () => {
      const updatedCart = getCart();
      setCartCount(updatedCart.reduce((sum, i) => sum + i.quantity, 0));
    };
    window.addEventListener("storage", handleStorage);

    const handleCartUpdated = () => {
      const updatedCart = getCart();
      setCartCount(updatedCart.reduce((sum, i) => sum + i.quantity, 0));
    };
    window.addEventListener("cartUpdated", handleCartUpdated);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("cartUpdated", handleCartUpdated);
    };
  }, []);

  const refreshCartCount = () => {
    const cart = getCart();
    setCartCount(cart.reduce((sum, i) => sum + i.quantity, 0));
  };

  // 🔥 THÊM HÀM NÀY
  const clearCart = () => {
    localStorage.removeItem("berrygold_cart");
    setCartCount(0);

    // trigger update UI
    window.dispatchEvent(new Event("cartUpdated"));
  };

  return (
    <CartContext.Provider value={{ cartCount, refreshCartCount, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);