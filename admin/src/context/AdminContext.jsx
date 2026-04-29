import React, { createContext, useContext, useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Khi trang load, đọc localStorage để giữ đăng nhập
    const loadAdmin = async () => {
      try {
        const stored = localStorage.getItem("adminData");
        if (stored) {
          const parsed = JSON.parse(stored);
          setAdmin(parsed);

          // Cập nhật trạng thái online trong Firestore
          if (parsed?.uid) {
            try {
              await updateDoc(doc(db, "Users", parsed.uid), { isOnline: true });
            } catch {
              console.warn("Không thể cập nhật isOnline, có thể admin chưa tồn tại trong Firestore.");
            }
          }
        }
      } finally {
        // Dù có hay không cũng cần set loading = false
        setLoading(false);
      }
    };

    loadAdmin();
  }, []);

  // Khi đăng nhập thành công
  const login = async (data) => {
    localStorage.setItem("adminData", JSON.stringify(data));
    setAdmin(data);
    if (data?.uid) {
      try {
        await updateDoc(doc(db, "Users", data.uid), { isOnline: true });
      } catch {
        console.warn("Không thể cập nhật trạng thái online.");
      }
    }
  };

  // Khi đăng xuất
  const logout = async () => {
    if (admin?.uid) {
      try {
        await updateDoc(doc(db, "Users", admin.uid), { isOnline: false });
      } catch {
        console.warn("Không thể cập nhật trạng thái offline.");
      }
    }
    localStorage.removeItem("adminData");
    setAdmin(null);
  };

  return (
    <AdminContext.Provider value={{ admin, login, logout, loading }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext);
