import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AdminProvider, useAdmin } from "./context/AdminContext";

import Header from "./Components/Header";
import Category from "./Components/Category";
import Dashboard from "./Pages/Dashboard";
import Product from "./Pages/Product";
import Order from "./Pages/Order";
import User from "./Pages/User";
import AdminLogin from "./auth/AdminLogin";
import AdminRegister from "./auth/AdminRegister";
import ProtectedRoute from "./Components/ProtectRoute";
import "./Style/index.css";
import { Toaster } from "react-hot-toast";

/* Trang mặc định */
function DefaultRoute() {
  const { admin, loading } = useAdmin();

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          fontSize: "1.2rem",
          color: "#666",
        }}
      >
        Đang tải dữ liệu...
      </div>
    );

  return <Navigate to={admin ? "/dashboard" : "/login"} replace />;
}


/* Layout chính chỉ dùng cho admin đã đăng nhập */
function AdminLayout() {
  return (
    <div className="admin-layout">
      <Header />
      <div className="admin-body">
        <Category />
        <main className="content">
          <Routes>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <Order />
                </ProtectedRoute>
              }
            />
            <Route
              path="/products"
              element={
                <ProtectedRoute>
                  <Product />
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <User />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AdminProvider>
      <Router>
        <Routes>
          {/* Khi chạy npm start */}
          <Route path="/" element={<DefaultRoute />} />

          {/* Trang login / register KHÔNG render Header + Sidebar */}
          <Route path="/login" element={<AdminLogin />} />
          <Route path="/register" element={<AdminRegister />} />

          {/* Layout admin */}
          <Route path="/*" element={<AdminLayout />} />
        </Routes>

        <Toaster position="top-right" />
      </Router>
    </AdminProvider>
  );
}

export default App;
