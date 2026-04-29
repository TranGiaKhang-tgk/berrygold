import { db } from "../firebase";
import {
  collection,
  getDocs,
  updateDoc,
  addDoc,
  doc
} from "firebase/firestore";

// 🔥 GET ALL USERS
export const getUsers = async () => {
  const snapshot = await getDocs(collection(db, "users"));
  return snapshot.docs.map((d) => {
    const user = d.data();
    return {
      id: d.id,
      ...user,
      status: user.status || "active"
    };
  });
};

// 🔥 ADD USER
export const addUser = async (data) => {
  await addDoc(collection(db, "users"), {
    ...data,
    status: "active",
    createdAt: new Date()
  });
};

// 🔥 UPDATE USER
export const updateUser = async (id, data) => {
  await updateDoc(doc(db, "users", id), data);
};

// 🔥 CHANGE STATUS (ban/unban)
export const changeStatus = async (id, status) => {
  await updateDoc(doc(db, "users", id), { status });
};