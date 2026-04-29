import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase";

const COLLECTION_NAME = "Products"; // ⚠️ giữ đúng tên trong Firebase

// ➕ Thêm sản phẩm
export const addProduct = async (data) => {
  try {
    await addDoc(collection(db, COLLECTION_NAME), {
      ...data,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Lỗi addProduct:", error);
    throw error;
  }
};

// 📥 Lấy danh sách sản phẩm (FIX ID CHUẨN)
export const getProducts = async () => {
  try {
    const snapshot = await getDocs(collection(db, COLLECTION_NAME));

    return snapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        ...data,
        id: doc.id, // 🔥 để cuối để KHÔNG bị ghi đè
      };
    });
  } catch (error) {
    console.error("Lỗi getProducts:", error);
    throw error;
  }
};

// ✏️ Cập nhật sản phẩm
export const updateProduct = async (id, data) => {
  try {
    if (!id) throw new Error("ID không tồn tại");

    await updateDoc(doc(db, COLLECTION_NAME, id), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Lỗi updateProduct:", error);
    throw error;
  }
};

// 🗑️ Xoá sản phẩm (FIX CHUẨN)
export const deleteProduct = async (id) => {
  try {
    if (!id) throw new Error("ID không hợp lệ");

    console.log("Deleting ID:", id);

    await deleteDoc(doc(db, COLLECTION_NAME, id));

    console.log("Xoá thành công:", id);
  } catch (error) {
    console.error("Lỗi deleteProduct:", error);
    throw error;
  }
};