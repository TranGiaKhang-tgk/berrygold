import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc
} from "firebase/firestore";
import { useAdmin } from "../context/AdminContext";
import toast from "react-hot-toast";
import "../Style/Auth.css";

export default function AdminLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const { login } = useAdmin();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // 🔥 LOGIN FIREBASE AUTH
      const res = await signInWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      // 🔥 TÌM USER THEO EMAIL (QUAN TRỌNG)
      const q = query(
        collection(db, "Users"),
        where("email", "==", res.user.email)
      );

      const querySnapshot = await getDocs(q);

      // ❌ KHÔNG TÌM THẤY
      if (querySnapshot.empty) {
        toast.error("Không tìm thấy user!");
        await signOut(auth);
        return;
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();

      // 🔥 CHECK STATUS
      if (userData.status !== "active") {
        toast.error("Tài khoản đã bị khóa!");
        await signOut(auth);
        return;
      }

      // 🔥 CHECK ROLE ADMIN
      if (userData.role !== "admin" && userData.role !== "Admin") {
        toast.error("Tài khoản không có quyền quản trị!");
        await signOut(auth);
        return;
      }

      // 🔥 UPDATE ONLINE
      await updateDoc(userDoc.ref, { isOnline: true });

      const adminData = {
        uid: res.user.uid,
        ...userData
      };

      // 🔥 LƯU CONTEXT
      login(adminData);

      toast.success("Đăng nhập thành công!");
      navigate("/dashboard", { replace: true });

    } catch (err) {
      console.error("Login error:", err);
      toast.error("Sai email hoặc mật khẩu!");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <h2>Đăng nhập quản trị</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email công ty"
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Mật khẩu"
            onChange={handleChange}
            required
          />
          <button type="submit">Đăng nhập</button>
        </form>

        <div className="auth-footer">
          Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
        </div>
      </div>
    </div>
  );
}