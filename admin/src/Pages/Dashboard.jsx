import React, { useEffect, useState } from "react";
import "../Style/Dashboard.css";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  setDoc,
  doc
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    customers: 0,
    orders: 0,
    shipping: 0,
    newUsers: 0,
    products: 0,
    totalStock: 0,
    revenueToday: 0,
    revenueMonth: 0,
  });

  const [loading, setLoading] = useState(true);

  // ===== 🔥 COUPON STATE =====
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState("");
  const [couponMaxUses, setCouponMaxUses] = useState("");

  // ===== LOAD DATA =====
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // USERS
        const usersSnap = await getDocs(collection(db, "users"));
        const allUsers = usersSnap.docs.map((d) => d.data());

        const customers = allUsers.filter(
          (u) => u.role?.toLowerCase() === "user"
        ).length;

        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const newUsers = allUsers.filter((u) => {
          if (!u.createdAt) return false;
          const date =
            u.createdAt.toDate?.() ||
            new Date(u.createdAt.seconds * 1000);
          return date >= sevenDaysAgo;
        }).length;

        // PRODUCTS
        const productsSnap = await getDocs(collection(db, "Products"));
        const allProducts = productsSnap.docs.map((d) => d.data());

        let totalStock = 0;
        allProducts.forEach((p) => {
          totalStock += Number(p.quantity) || 0;
        });

        // ORDERS
        const ordersSnap = await getDocs(collection(db, "Orders"));
        const allOrders = ordersSnap.docs.map((d) => d.data());

        const orders = allOrders.length;

        const shipping = allOrders.filter(
          (o) => o.status === "Đang giao"
        ).length;

        let revenueToday = 0;
        let revenueMonth = 0;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        allOrders.forEach((o) => {
          if (!o.createdAt || !o.total) return;

          let orderDate = null;

          if (o.createdAt.toDate) orderDate = o.createdAt.toDate();
          else if (o.createdAt.seconds)
            orderDate = new Date(o.createdAt.seconds * 1000);
          else orderDate = new Date(o.createdAt);

          const total = Number(o.total) || 0;

          const sameDay =
            orderDate.getDate() === today.getDate() &&
            orderDate.getMonth() === today.getMonth() &&
            orderDate.getFullYear() === today.getFullYear();

          if (sameDay) revenueToday += total;

          if (
            orderDate.getMonth() === currentMonth &&
            orderDate.getFullYear() === currentYear
          ) {
            revenueMonth += total;
          }
        });

        setStats({
          customers,
          orders,
          shipping,
          newUsers,
          products: allProducts.length,
          totalStock,
          revenueToday,
          revenueMonth,
        });
      } catch (err) {
        console.error("🔥 Lỗi:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // ===== 🔥 TẠO COUPON =====
  const handleCreateCoupon = async () => {
    if (!couponCode || !couponDiscount) {
      alert("Nhập đầy đủ!");
      return;
    }

    try {
      const code = couponCode.toUpperCase();

      await setDoc(doc(db, "coupons", code), {
        code: code,
        discount: Number(couponDiscount),
        maxUses: Number(couponMaxUses) || 100,
        used: 0,
        isActive: true,
        createdAt: new Date(),
      });

      alert("Tạo mã thành công!");

      setCouponCode("");
      setCouponDiscount("");
      setCouponMaxUses("");
    } catch (err) {
      console.error(err);
      alert("Lỗi tạo mã");
    }
  };

  const items = [
    { title: "Khách hàng", value: stats.customers, path: "/users" },
    { title: "Đơn hàng", value: stats.orders, path: "/orders" },
    { title: "Đang giao", value: stats.shipping, path: "/orders" },
    { title: "User mới", value: stats.newUsers, path: "/users" },
    { title: "Sản phẩm", value: stats.products, path: "/products" },
    { title: "Tồn kho", value: stats.totalStock, path: "/products" },
    {
      title: "Doanh thu hôm nay",
      value: stats.revenueToday.toLocaleString() + "đ",
      path: "/orders",
    },
    {
      title: "Doanh thu tháng",
      value: stats.revenueMonth.toLocaleString() + "đ",
      path: "/orders",
    },
  ];

  return (
    <div className="dashboard-container">
      <h4>Tổng quan hệ thống</h4>

      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <div className="dashboard-stats">
          {items.map((item, i) => (
            <div
              key={i}
              className="stat-card"
              onClick={() => navigate(item.path)}
            >
              <h6>{item.title}</h6>
              <h2>{item.value}</h2>
            </div>
          ))}
        </div>
      )}

      <div className="coupon-box">
  <h4>🎁 Tạo mã giảm giá</h4>

  <label>Mã giảm giá</label>
  <input
    placeholder="VD: SALE10"
    value={couponCode}
    onChange={(e) => setCouponCode(e.target.value)}
  />

  <label>Phần trăm giảm (%)</label>
  <input
    type="number"
    placeholder="VD: 10"
    value={couponDiscount}
    onChange={(e) => setCouponDiscount(e.target.value)}
  />

  <label>Số lượt sử dụng</label>
  <input
    type="number"
    placeholder="VD: 100"
    value={couponMaxUses}
    onChange={(e) => setCouponMaxUses(e.target.value)}
  />

  <button onClick={handleCreateCoupon}>
    ➕ Tạo mã
  </button>
</div>
    </div>
  );
};

export default Dashboard;