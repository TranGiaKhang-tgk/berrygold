// App.jsx — Fix đúng cách
import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { UserProvider, useUser } from "./context/UserContext";
import { CartProvider } from "./context/cartContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ChatBot from "./components/ChatBot";
import AuthModal from "./auth/AuthModal";
import Success from "./pages/Success";
import Home from "./pages/Home";
import TrackOrder from "./pages/TrackOrder";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Search from "./pages/Search";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import ThankYou from "./pages/ThankYou";
import Compare from "./pages/Compare";
import CompareSelect from "./pages/CompareSelect";
import ProductDetail from "./product/ProductDetail";
import CategoryPage from "./pages/CategoryPage";
import DeliveryPolicy from "./policy/deliveryPolicy";
import RefundPolicy from "./policy/refundPolicy";
import About from "./policy/About";

function AppContent() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const { user } = useUser();

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header onLoginClick={() => { setAuthMode("login"); setShowAuthModal(true); }} />

      {showAuthModal && (
        <AuthModal
          mode={authMode}
          onClose={() => setShowAuthModal(false)}
          switchMode={setAuthMode}
        />
      )}

      <main className="flex-grow-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/compare/select" element={<CompareSelect />} />
          <Route path="/pages/cart" element={<Cart />} />
          <Route path="/pages/checkout" element={<Checkout />} />
          <Route path="/thankyou" element={<ThankYou />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/pages/trackorder" element={<TrackOrder />} />
          <Route path="/payment-success" element={<Success />} />
          <Route path="/success" element={<Success />} />
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/search" element={<Search />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/policy/deliverypolicy" element={<DeliveryPolicy />} />
          <Route path="/policy/refundpolicy" element={<RefundPolicy />} />
          <Route path="/policy/about" element={<About />} />
        </Routes>
      </main>

      <Footer />

      <ChatBot
  userName={
    user?.name ||
    user?.displayName ||
    (user?.email?.split("@")[0] || "").replace(/[0-9]/g, "")
  }
  userEmail={user?.email || ""}
/>
    </div>
  );
}

function App() {
  return (
    <CartProvider>
      <UserProvider>
        <Router>
          <AppContent />
          <Toaster position="top-right" toastOptions={{ duration: 2000 }} />
        </Router>
      </UserProvider>
    </CartProvider>
  );
}

export default App;